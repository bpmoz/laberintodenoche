import express from "express";
import { Episode } from "../models/episode.js";
import { auth, adminOnly } from "../middleware/auth.js";
import { upload } from "../uploadConfig.js";
import { Book } from "../models/book.js";
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let aggregationPipeline = [];

    if (search) {
      const searchRegex = new RegExp(search, "i");

      aggregationPipeline.push(
        {
          $lookup: {
            from: "books",
            localField: "mentionedBooks",
            foreignField: "_id",
            as: "mentionedBooksData",
          },
        },

        {
          $unwind: {
            path: "$mentionedBooksData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { tags: searchRegex },
              { "mentionedBooksData.title": searchRegex },
              { "mentionedBooksData.author": searchRegex },
            ],
          },
        },

        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            description: { $first: "$description" },
            slug: { $first: "$slug" },
            imagePath: { $first: "$imagePath" },
            duration: { $first: "$duration" },
            publishDate: { $first: "$publishDate" },
            spotifyId: { $first: "$spotifyId" },
            youtubeId: { $first: "$youtubeId" },
            tags: { $first: "$tags" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            isFeatured: { $first: "$isFeatured" },
            mentionedBooks: {
              $push: {
                $cond: [
                  { $ifNull: ["$mentionedBooksData", false] },
                  "$mentionedBooksData",
                  "$$REMOVE",
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            slug: 1,
            imagePath: 1,
            duration: 1,
            publishDate: 1,
            spotifyId: 1,
            youtubeId: 1,
            tags: 1,
            createdAt: 1,
            updatedAt: 1,
            isFeatured: 1,
            mentionedBooks: {
              $filter: {
                input: "$mentionedBooks",
                as: "book",
                cond: { $ne: ["$$book", null] },
              },
            },
          },
        }
      );
    } else {
      aggregationPipeline.push({
        $lookup: {
          from: "books",
          localField: "mentionedBooks",
          foreignField: "_id",
          as: "mentionedBooks",
        },
      });
    }

    aggregationPipeline.push({ $sort: { publishDate: -1 } });

    const totalAggregationPipeline = [...aggregationPipeline];
    totalAggregationPipeline.push({ $count: "total" });

    const totalResults = await Episode.aggregate(totalAggregationPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    const episodes = await Episode.aggregate(aggregationPipeline);

    res.json({
      episodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEpisodes: total,
      },
    });
  } catch (err) {
    console.error("Error fetching episodes (Backend):", err);
    res.status(500).json({ message: "Error fetching episodes" });
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const episode = await Episode.findOne({ slug: req.params.slug })
      .populate({
        path: "mentionedBooks",
        select: "title author coverImagePath _id",
      })
      .lean();

    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    res.json(episode);
  } catch (err) {
    next(err);
  }
});

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

      const { title, duration, description, tags, publishDate, youtubeId } =
        req.body;

      if (!req.file) {
        console.log("req.file is undefined!");
        return res.status(400).json({ message: "Episode image is required" });
      }

      const imagePath = `uploads/${req.file.filename}`;

      const newEpisode = new Episode({
        title: title,
        imagePath: imagePath,
        duration: parseFloat(duration),
        description: description,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        publishDate: publishDate || new Date(),
        slug: title
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, ""),

        youtubeId: youtubeId,
      });

      console.log("New Episode Object:", newEpisode);
      const savedEpisode = await newEpisode.save();
      console.log("Saved Episode:", savedEpisode);
      res.status(201).json(savedEpisode);
    } catch (err) {
      console.error("Error creating episode:", err);
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

router.put("/:id/add-mentioned-book", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;

    if (!bookId) {
      return res
        .status(400)
        .json({ message: "Book ID is required in the request body." });
    }

    const updatedEpisode = await Episode.findByIdAndUpdate(
      id,
      { $addToSet: { mentionedBooks: bookId } },
      { new: true, runValidators: true }
    ).populate({
      path: "mentionedBooks",
      select: "title author coverImagePath _id",
    });

    if (!updatedEpisode) {
      return res.status(404).json({ message: "Episode not found." });
    }

    res.json(updatedEpisode);
  } catch (err) {
    next(err);
  }
});

// --- ROUTE TO REMOVE A MENTIONED BOOK ---
router.put("/:id/remove-mentioned-book", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Book ID is required in the request body to remove it.",
      });
    }

    const updatedEpisode = await Episode.findByIdAndUpdate(
      id,
      { $pull: { mentionedBooks: bookId } },
      { new: true, runValidators: true }
    ).populate({
      path: "mentionedBooks",
      select: "title author coverImagePath _id",
    });

    if (!updatedEpisode) {
      return res.status(404).json({ message: "Episode not found." });
    }

    res.json(updatedEpisode);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id/remove-single-mentioned-book-instance",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { bookId } = req.body;

      if (!bookId) {
        return res
          .status(400)
          .json({ message: "Book ID is required to remove an instance." });
      }

      const episode = await Episode.findById(id);

      if (!episode) {
        return res.status(404).json({ message: "Episode not found." });
      }

      const indexToRemove = episode.mentionedBooks.indexOf(bookId);

      if (indexToRemove === -1) {
        return res.status(400).json({
          message: "Book not found in mentionedBooks array for this episode.",
        });
      }

      episode.mentionedBooks.splice(indexToRemove, 1);

      episode.markModified("mentionedBooks");

      await episode.save();

      const populatedEpisode = await Episode.findById(id)
        .populate({
          path: "mentionedBooks",
          select: "title author coverImagePath _id",
        })
        .lean();

      res.json(populatedEpisode);
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
