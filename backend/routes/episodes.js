// routes/episodes.js
import express from "express";
import { Episode } from "../models/episode.js";
import { auth, adminOnly } from "../middleware/auth.js";
import { upload } from "../uploadConfig.js";
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const episodes = await Episode.find()
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Episode.countDocuments();

    res.json({
      episodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEpisodes: total,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const episode = await Episode.findOne({ slug: req.params.slug })
      // --- ADD THIS .populate() CALL HERE ---
      .populate({
        path: "mentionedBooks", // This matches the field name in your Episode model
        select: "title author coverImagePath _id", // These are the fields you want from the Book model
      })
      .lean(); // Optional: use .lean() for faster query results if you don't need Mongoose document methods

    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    res.json(episode);
  } catch (err) {
    next(err);
  }
});
// backend/routes/episodes.js
// ... imports ...

// Create new episode
router.post(
  "/",
  auth,
  adminOnly,
  upload.single("episodeImage"),
  async (req, res, next) => {
    console.log("Episode creation route hit!");

    try {
      console.log("Request Body:", req.body);
      console.log("Request File:", req.file);

      // --- Check if youtubeId or spotifyId are provided in the body ---
      const {
        title,
        duration,
        description,
        tags,
        publishDate,
        youtubeId, // <-- Extract youtubeId
        spotifyId, // <-- Extract spotifyId
      } = req.body;
      // --- End extraction ---

      if (!req.file) {
        console.log("req.file is undefined!");
        return res.status(400).json({ message: "Episode image is required" });
      }

      const imagePath = `uploads/${req.file.filename}`;

      const newEpisode = new Episode({
        title: title, // Use extracted variable
        imagePath: imagePath,
        duration: parseFloat(duration), // Use extracted variable
        description: description, // Use extracted variable
        tags: tags // Use extracted variable
          ? tags.split(",").map((tag) => tag.trim())
          : [],
        publishDate: publishDate || new Date(), // Use extracted variable
        slug: title // Use extracted variable for slug creation
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, ""),

        youtubeId: youtubeId, // <-- Add youtubeId field
        spotifyId: spotifyId, // <-- Add spotifyId field
      });

      console.log("New Episode Object:", newEpisode);
      const savedEpisode = await newEpisode.save();
      console.log("Saved Episode:", savedEpisode);
      res.status(201).json(savedEpisode);
    } catch (err) {
      console.error("Error creating episode:", err);
      // Provide a more informative error message if it's a validation error
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ message: messages.join(", ") });
      }
      res.status(500).json({ message: "Failed to create episode" });
    }
  }
);

// Update episode
router.put(
  "/:id",
  auth,
  adminOnly,
  upload.single("episodeImage"),
  async (req, res, next) => {
    try {
      const updates = { ...req.body };

      if (req.file) {
        updates.imageUrl = `/uploads/episode-images/${req.file.filename}`;
      }

      if (updates.tags) {
        updates.tags = updates.tags.split(",").map((tag) => tag.trim());
      }

      const episode = await Episode.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      res.json(episode);
    } catch (err) {
      next(err);
    }
  }
);

// Delete episode
router.delete("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.id);

    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    res.json({ message: "Episode deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
