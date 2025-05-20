import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
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

likeSchema.index({ episode: 1, user: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
