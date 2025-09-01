import express from "express";
import { Like } from "../models/likes.js";
import { Episode } from "../models/episode.js";
import { auth } from "../middleware/auth.js";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/status/episode/:episodeId", auth, async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const likeExists = await Like.exists({
      episode: episodeId,
      user: req.user.userId,
    });

    res.json({ liked: !!likeExists });
  } catch (err) {
    next(err);
  }
});

router.get("/count/episode/:episodeId", async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const count = await Like.countDocuments({ episode: episodeId });

    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Like an episode
router.post("/", auth, async (req, res, next) => {
  try {
    const { episodeId } = req.body;
    const userId = req.user.userId;

    if (!episodeId) {
      return res.status(400).json({ message: "Episode ID is required" });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const existingLike = await Like.findOne({
      episode: episodeId,
      user: userId,
    });

    if (existingLike) {
      const count = await Like.countDocuments({ episode: episodeId });
      return res.status(200).json({ message: "Episode already liked", count });
    }

    // Create new like
    const newLike = new Like({
      episode: episodeId,
      user: userId,
    });

    await newLike.save();

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteEpisodes: episodeId } },
      { new: true }
    );

    const count = await Like.countDocuments({ episode: episodeId });

    res.status(201).json({
      message: "Episode liked successfully",
      count,
    });
  } catch (err) {
    console.error("Error liking episode:", err);
    next(err);
  }
});

// Unlike an episode
router.delete("/episode/:episodeId", auth, async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user.userId;

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const result = await Like.findOneAndDelete({
      episode: episodeId,
      user: userId, // Use userId
    });

    if (!result) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { favoriteEpisodes: episodeId } },
        { new: true }
      );
      const count = await Like.countDocuments({ episode: episodeId });
      return res.status(200).json({
        message: "Episode was not liked by user or already unliked",
        count,
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteEpisodes: episodeId } },
      { new: true }
    );

    // Get updated count
    const count = await Like.countDocuments({ episode: episodeId });

    res.json({
      message: "Like removed successfully",
      count,
    });
  } catch (err) {
    console.error("Error unliking episode:", err);
    next(err);
  }
});

export default router;
