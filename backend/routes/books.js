import express from "express";
import { auth, adminOnly } from "../middleware/auth.js";
import { User } from "../models/user.js";
import { Book } from "../models/book.js";
import { upload } from "../uploadConfig.js";

const router = express.Router();

router.post(
  "/",
  auth,
  adminOnly,
  upload.single("coverImage"),
  async (req, res, next) => {
    try {
      const { title, author } = req.body;
      let featuredEpisode = req.body.featuredEpisode;

      if (!title || !author) {
        return res
          .status(400)
          .json({ message: "Title and Author are required for a new book." });
      }

      if (featuredEpisode === "") {
        featuredEpisode = null;
      }
      let coverImagePath = "";
      if (req.file) {
        coverImagePath = `uploads/${req.file.filename}`;
      } else {
      }

      const newBook = new Book({
        title,
        author,
        coverImagePath,
        featuredEpisode: featuredEpisode,
      });

      const savedBook = await newBook.save();

      res.status(201).json(savedBook);
    } catch (err) {
      console.error("Error creating book:", err);
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ message: messages.join(", ") });
      }
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (err) {
    next(err);
  }
});

router.post("/favorite", auth, async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    const isFavorited = user.favoriteBooks.includes(bookId);

    if (isFavorited) {
      return res.status(400).json({ message: "Book is already favorited." });
    }

    user.favoriteBooks.addToSet(bookId);
    await user.save();

    res.status(200).json({
      message: "Book added to favorites successfully.",
      favorited: true,
    });
  } catch (err) {
    console.error("Error adding book to favorites:", err);
    next(err);
  }
});

router.delete("/favorite", auth, async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    const isFavorited = user.favoriteBooks.includes(bookId);

    if (!isFavorited) {
      return res.status(400).json({ message: "Book is not in favorites." });
    }

    user.favoriteBooks.pull(bookId);
    await user.save();

    res.status(200).json({
      message: "Book removed from favorites successfully.",
      favorited: false,
    });
  } catch (err) {
    console.error("Error removing book from favorites:", err);
    next(err);
  }
});

export default router;
