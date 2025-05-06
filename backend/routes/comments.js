// routes/comments.js
import express from "express";
import { Comments } from "../models/comments.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/episode/:episodeId", async (req, res, next) => {
  try {
    const comments = await Comments.find({ episode: req.params.episodeId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const newComment = new Comments({
      content: req.body.content,
      episode: req.body.episodeId,
      user: req.user.userId,
    });

    const savedComment = await newComment.save();

    const populatedComment = await Comments.findById(savedComment._id).populate(
      "user",
      "username profilePicture"
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const comment = await Comments.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or not authorized to delete",
      });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
