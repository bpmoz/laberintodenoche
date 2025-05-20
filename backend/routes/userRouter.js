// backend/routes/userRouter.js
import express from "express";
import mongoose from "mongoose"; // <-- ADD THIS LINE
import { auth } from "../middleware/auth.js"; // Assuming your auth middleware path
import { User } from "../models/user.js"; // Assuming your User model path
import { Comments } from "../models/comments.js"; // Assuming your Comment model path
import "../models/likes.js"; // Assuming your Like model path
import "../models/episode.js"; // Assuming your Episode model path

// Assuming you have a Book model if you store favorite books in your DB
// import { Book } from "../models/book.js"; // Assuming your Book model path

const router = express.Router();

// These routes are for the *current logged-in user*, identified by the token.
// They should be protected by the auth middleware.

// GET /api/user/favorite-episodes - Get favorite episodes for the authenticated user
router.get("/favorite-episodes", auth, async (req, res, next) => {
  try {
    // Find the user by ID from the authenticated request (set by auth middleware)
    // Populate the 'favoriteEpisodes' field to get the full Episode documents
    const user = await User.findById(req.user.userId).populate(
      "favoriteEpisodes"
    );

    if (!user) {
      // This case should ideally not be reached if auth middleware works correctly
      return res.status(404).json({ message: "User not found" });
    }

    // user.favoriteEpisodes is now an array of populated Episode documents
    res.json(user.favoriteEpisodes);
  } catch (err) {
    console.error("Error fetching favorite episodes:", err);
    // Pass the error to the central error handler
    next(err);
  }
});

// GET /api/user/favorite-books - Get favorite books for the authenticated user
router.get("/favorite-books", auth, async (req, res, next) => {
  try {
    // Find the user by ID from the authenticated request
    const user = await User.findById(req.user.userId).populate("favoriteBooks"); // Make sure 'favoriteBooks' is a field in your User model with ref: 'Book'

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Should not happen if auth succeeds
    }

    // Return the populated favorite books array
    res.json(user.favoriteBooks);
  } catch (err) {
    console.error("Error fetching favorite books:", err);
    next(err);
  }
});

// GET /api/user/comments - Get comments made by the authenticated user, including like counts
router.get("/comments", auth, async (req, res, next) => {
  try {
    const userId = req.user.userId; // Get user ID from authenticated request

    // Fetch comments by this user
    // Use aggregation to include like count for each comment efficiently
    const comments = await Comments.aggregate([
      // Match comments by the authenticated user ID
      { $match: { user: new mongoose.Types.ObjectId(userId) } }, // Convert string ID to ObjectId

      // Populate the associated episode details (especially title)
      {
        $lookup: {
          from: "episodes", // The collection name for Episode model (usually lowercase plural)
          localField: "episode",
          foreignField: "_id",
          as: "episodeDetails",
        },
      },
      // Deconstruct the episodeDetails array (should have max 1 element)
      {
        $unwind: { path: "$episodeDetails", preserveNullAndEmptyArrays: true },
      },

      // Lookup likes for each comment
      {
        $lookup: {
          from: "likes", // The collection name for Like model (usually lowercase plural)
          localField: "_id",
          foreignField: "comment", // Assuming your Like model has a 'comment' field referencing Comment
          as: "commentLikes",
        },
      },

      // Add a field for the count of likes on the comment
      {
        $addFields: {
          likeCount: { $size: "$commentLikes" },
        },
      },

      // Select and reshape the output documents
      {
        $project: {
          _id: 0, // Exclude _id if you prefer 'id'
          id: "$_id", // Map _id to id for frontend consistency
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          episode: "$episode", // Include episode ObjectId if needed
          episodeTitle: "$episodeDetails.title", // Get the episode title
          user: "$user", // Include user ObjectId (already matched)
          // populatedUser: { _id: '$userDetails._id', username: '$userDetails.username', profilePicture: '$userDetails.profilePicture' }, // If you need user details populated here too, add another lookup
          likeCount: 1, // Include the calculated like count
        },
      },

      // Sort comments (e.g., newest first)
      { $sort: { createdAt: -1 } },
    ]);

    // You might still want to populate the user details on the comment if needed,
    // but since it's the current user's comments, you already have currentUser data on the frontend.
    // The aggregation above includes the user ID, but not populated details unless you add another lookup.
    // If you just need the user details (username, pic) on the comment object for rendering in other contexts,
    // you might prefer the simpler find + populate approach from commentsRouter:
    /*
     const comments = await Comment.find({ user: userId })
       .populate('episode', 'title') // Populate episode to get title
       .populate('user', 'username profilePicture') // Populate user (redundant for current user's profile view, but useful elsewhere)
       .sort({ createdAt: -1 });

     // Then you'd need to add like counts separately, maybe by mapping:
     const commentsWithLikes = await Promise.all(comments.map(async comment => {
       const likeCount = await Like.countDocuments({ comment: comment._id });
       return {
         ...comment.toObject(), // Convert Mongoose document to plain object
         likeCount: likeCount,
         episodeTitle: comment.episode.title // Assuming populate worked
       };
     }));
     res.json(commentsWithLikes); // Respond with the mapped array
     */
    // The aggregation approach is generally more efficient for getting counts. Let's stick to that one.

    res.json(comments); // Respond with the aggregated comments including likeCount
  } catch (err) {
    console.error("Error fetching user comments:", err);
    next(err);
  }
});

export default router;
