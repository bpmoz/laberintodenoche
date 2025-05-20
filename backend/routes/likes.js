// routes/likes.js
import express from "express";
import { Like } from "../models/likes.js";
import { Episode } from "../models/episode.js";
import { auth } from "../middleware/auth.js";
import { User } from "../models/user.js"; // <-- Import the User model

const router = express.Router();

// Get like status for the current user
router.get("/status/episode/:episodeId", auth, async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    // Verify episode exists
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    // Check if user has liked this episode
    const likeExists = await Like.exists({
      episode: episodeId,
      user: req.user.userId,
    });

    res.json({ liked: !!likeExists });
  } catch (err) {
    next(err);
  }
});

// Get like count for an episode
router.get("/count/episode/:episodeId", async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    // Verify episode exists
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    // Count likes
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
    const userId = req.user.userId; // Get user ID from authenticated request

    if (!episodeId) {
      return res.status(400).json({ message: "Episode ID is required" });
    }

    // Verify episode exists
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      episode: episodeId,
      user: userId, // Use userId
    });

    if (existingLike) {
      // If already liked, treat this as idempotent or return a message
      // For favoriting, we probably don't want to allow adding it twice.
      // But since the frontend sends POST even if isLiked is true before the click,
      // we might just return success if it already exists.
      const count = await Like.countDocuments({ episode: episodeId }); // Still get the count
      return res.status(200).json({ message: "Episode already liked", count });
    }

    // Create new like
    const newLike = new Like({
      episode: episodeId,
      user: userId, // Use userId
    });

    await newLike.save();

    // --- Add Episode to User's favoriteEpisodes array ---
    // Find the user and push the episode's ID to their favoriteEpisodes array
    await User.findByIdAndUpdate(
      userId, // Find user by ID
      { $addToSet: { favoriteEpisodes: episodeId } }, // Use $addToSet to prevent duplicates
      { new: true } // Return the updated user document (optional here)
    );
    // --- End Update ---

    // Get updated count
    const count = await Like.countDocuments({ episode: episodeId });

    res.status(201).json({
      message: "Episode liked successfully",
      count,
      // Optionally return the updated user favorites list here, but the profile page refetches it.
    });
  } catch (err) {
    console.error("Error liking episode:", err); // Log the specific error
    next(err); // Pass error to error handler
  }
});

// Unlike an episode
router.delete("/episode/:episodeId", auth, async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user.userId; // Get user ID from authenticated request

    // Verify episode exists (optional but good practice)
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    // Find and delete the like document
    const result = await Like.findOneAndDelete({
      episode: episodeId,
      user: userId, // Use userId
    });

    if (!result) {
      // If like document wasn't found, maybe the user didn't like it,
      // or it was already unliked.
      // Ensure the episode is removed from favorites anyway.
      await User.findByIdAndUpdate(
        userId,
        { $pull: { favoriteEpisodes: episodeId } }, // Ensure it's removed
        { new: true }
      );
      const count = await Like.countDocuments({ episode: episodeId });
      return res
        .status(200)
        .json({
          message: "Episode was not liked by user or already unliked",
          count,
        });
    }

    // --- Remove Episode from User's favoriteEpisodes array ---
    // Find the user and pull the episode's ID from their favoriteEpisodes array
    await User.findByIdAndUpdate(
      userId, // Find user by ID
      { $pull: { favoriteEpisodes: episodeId } }, // Use $pull to remove the ID
      { new: true } // Return the updated user document (optional here)
    );
    // --- End Update ---

    // Get updated count
    const count = await Like.countDocuments({ episode: episodeId });

    res.json({
      message: "Like removed successfully",
      count,
      // Optionally return the updated user favorites list here
    });
  } catch (err) {
    console.error("Error unliking episode:", err); // Log the specific error
    next(err); // Pass error to error handler
  }
});

export default router;
