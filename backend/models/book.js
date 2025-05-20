// backend/models/book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    // Basic fields for a book
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
    // Optional: Reference the episode where the book was featured
    featuredEpisode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode", // Assuming your Episode model is registered as 'Episode'
      // You might make this required or not, depending on your data
      // required: true,
    },
    // Optional: ISBN, publication date, cover image URL, etc.
    // isbn: { type: String, trim: true },
    // coverImage: { type: String },
    // publishedDate: { type: Date },
  },
  { timestamps: true }
); // Add timestamps for createdAt and updatedAt

// Register the model. The name 'Book' MUST match the ref: 'Book' in your User model (and elsewhere).
export const Book = mongoose.model("Book", bookSchema);

// Or if you are using module.exports = require(...) syntax elsewhere:
// const Book = mongoose.model('Book', bookSchema);
// module.exports = { Book, bookSchema }; // Export both the model and schema
