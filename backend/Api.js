import express from "express";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import commentsRouter from "./routes/comments.js";
import likeRouter from "./routes/likes.js";
import cors from "cors";
import authRouter from "./routes/auth.js";
import episodesRouter from "./routes/episodes.js";
import externalApiRoutes from "./routes/external-apis.js";
import { User } from "./models/user.js";
import "./models/book.js";
import bcrypt from "bcrypt";
import userRouter from "./routes/userRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const { PORT = 3002 } = process.env;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to podcast database");
    createAdminUser();
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

app.use(
  cors({
    origin: [
      "http://localhost:3002",
      "http://localhost:5174",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Function to create admin user
async function createAdminUser() {
  try {
    console.log("createAdminUser called");

    const adminExists = await User.findOne({
      username: process.env.ADMIN_USERNAME,
    });
    console.log("Searching for admin user:", process.env.ADMIN_USERNAME);

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      console.log("Hashed password:", hashedPassword);

      const admin = new User({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        isAdmin: true,
        email: process.env.ADMIN_EMAIL,
      });

      const savedAdmin = await admin.save();
      console.log("Admin user created successfully:", savedAdmin);
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/episodes", episodesRouter);
app.use("/api/likes", likeRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/user", userRouter);
app.use("/api/external-apis", externalApiRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "An internal server error occurred",
  });
});

app.listen(PORT, function () {
  console.log(`Podcast server running on port ${PORT}!`);
});
