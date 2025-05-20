import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    imagePath: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
    description: {
      type: String,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    spotifyId: {
      type: String,
    },
    youtubeId: {
      type: String,
    },

    spotifyUrl: {
      type: String,
    },
    youtubeUrl: {
      type: String,
    },

    episodeNumber: {
      type: Number,
    },
  },
  { timestamps: true }
);

episodeSchema.pre("save", function (next) {
  console.log("pre('save') hook triggered for title:", this.title);
  console.log("Is title modified?", this.isModified("title"));
  if (!this.isModified("title")) {
    console.log("Title not modified, skipping slug generation");
    return next();
  }

  this.slug = this.title
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  console.log("Generated slug:", this.slug);

  next();
});

export const Episode = mongoose.model("episode", episodeSchema);
