// models/comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ episode: 1, createdAt: -1 });

export const Comments = mongoose.model("Comment", commentSchema);
