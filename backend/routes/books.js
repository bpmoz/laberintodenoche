import express from "express";
import { auth, adminOnly } from "../middleware/auth.js";
import { User } from "../models/user.js";
import { Book } from "../models/book.js";
import { upload } from "../uploadConfig.js"; // Import your file upload configuration (e.g., multer)

const router = express.Router();

router.post(
  "/",
  auth, // Requires authentication
  adminOnly, // Only administrators can create books
  upload.single("coverImage"), // Use multer to handle a single file upload for the book cover
  async (req, res, next) => {
    try {
      const { title, author, featuredEpisode } = req.body; // Extract data from request body

      // Basic validation: ensure title and author are provided
      if (!title || !author) {
        return res
          .status(400)
          .json({ message: "Title and Author are required for a new book." });
      }

      let coverImagePath = "";
      if (req.file) {
        // Assuming your uploadConfig stores files in an 'uploads' directory
        // and provides the filename. Adjust path if necessary.
        coverImagePath = `uploads/${req.file.filename}`;
      } else {
        // Optional: If a cover image is mandatory, uncomment the next line:
        // return res.status(400).json({ message: "Book cover image is required." });
      }

      // Create a new Book instance
      const newBook = new Book({
        title,
        author,
        coverImagePath, // Assign the path to the model
        // If `featuredEpisode` is provided, ensure it's a valid ObjectId
        featuredEpisode: featuredEpisode, // Assuming featuredEpisode is an ID, Mongoose will handle the ref
      });

      const savedBook = await newBook.save(); // Save the new book to the database

      res.status(201).json(savedBook); // Respond with the newly created book
    } catch (err) {
      console.error("Error creating book:", err);
      // Handle Mongoose validation errors
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ message: messages.join(", ") });
      }
      next(err); // Pass other errors to the error handling middleware
    }
  }
);

// Optional: Add a GET route for all books (might be useful for an admin panel)
router.get("/", async (req, res, next) => {
  try {
    const books = await Book.find().sort({ title: 1 }); // Sort by title, for example
    res.json(books);
  } catch (err) {
    next(err);
  }
});

// Route to toggle (add/remove) a book from the user's favorites
// This will handle both POST (favorite) and DELETE (unfavorite)
router.post("/favorite", auth, async (req, res, next) => {
  try {
    const { bookId } = req.body; // Expecting bookId from the request body

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    // Ensure the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // `req.user` comes from your `auth` middleware, which should attach the authenticated user
    const user = await User.findById(req.user.id); // Assuming req.user.id holds the user's MongoDB _id

    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    // Check if the book is already in favorites
    const isFavorited = user.favoriteBooks.includes(bookId);

    if (isFavorited) {
      return res.status(400).json({ message: "Book is already favorited." });
    }

    // Add book to favorites using $addToSet to prevent duplicates
    user.favoriteBooks.addToSet(bookId); // Mongoose's $addToSet ensures unique elements
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
    const { bookId } = req.body; // Expecting bookId from the request body for DELETE

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    // Ensure the book exists (optional, but good for data integrity)
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    // Check if the book is NOT in favorites
    const isFavorited = user.favoriteBooks.includes(bookId);

    if (!isFavorited) {
      return res.status(400).json({ message: "Book is not in favorites." });
    }

    // Remove book from favorites using $pull
    user.favoriteBooks.pull(bookId); // Mongoose's $pull removes an item
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

// You can add other book-related routes here if needed, e.g.,
// router.get("/", async (req, res, next) => { /* Get all books */ });
// router.get("/:id", async (req, res, next) => { /* Get book by ID */ });

export default router;
