import express from "express";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import commentsRouter from "./routes/comments.js";
import cors from "cors";
import authRouter from "./routes/auth.js";
import episodesRouter from "./routes/episodes.js";
import { User } from "./models/user.js";
import bcrypt from "bcrypt";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const { PORT = 3002, MONGODB_URI = "mongodb://localhost:27017/podcastdb" } =
  process.env;

mongoose
  .connect(MONGODB_URI)
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
app.use("/api/comments", commentsRouter);

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
