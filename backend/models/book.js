import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },

    coverImagePath: { type: String },

    featuredEpisode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
