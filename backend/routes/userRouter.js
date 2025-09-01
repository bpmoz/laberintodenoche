import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import { User } from "../models/user.js";
import { Comments } from "../models/comments.js";
import "../models/likes.js";
import "../models/episode.js";

const router = express.Router();

router.get("/favorite-episodes", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "favoriteEpisodes"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favoriteEpisodes);
  } catch (err) {
    console.error("Error fetching favorite episodes:", err);
    next(err);
  }
});

router.get("/favorite-books", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: "favoriteBooks",
        select: "title author coverImagePath _id",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favoriteBooks);
  } catch (err) {
    console.error("Error fetching favorite books:", err);
    next(err);
  }
});

router.get("/comments", auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const comments = await Comments.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "episodes",
          localField: "episode",
          foreignField: "_id",
          as: "episodeDetails",
        },
      },
      {
        $unwind: { path: "$episodeDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "commentLikes",
        },
      },

      {
        $addFields: {
          likeCount: { $size: "$commentLikes" },
        },
      },

      {
        $project: {
          _id: 0,
          id: "$_id",
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          episode: "$episode",
          episodeTitle: "$episodeDetails.title",
          user: "$user",
          likeCount: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json(comments);
  } catch (err) {
    console.error("Error fetching user comments:", err);
    next(err);
  }
});

export default router;
