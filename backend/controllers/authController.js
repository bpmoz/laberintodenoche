import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already in use",
      });
    }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("isMatch:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.isAdmin ? "admin" : "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "username email _id createdAt updatedAt isAdmin profilePicture bio"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};

export async function updateProfile(req, res) {
  try {
    const { username, bio } = req.body;

    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ error: "UserId required" });
    }

    const user = await User.findById(userId).orFail(
      new Error("User not found")
    );

    user.bio = bio;
    user.username = username;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    console.error("Error updating user:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    } else if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    } else {
      return res.status(500).json({ error: "Error updating user" });
    }
  }
}

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("req.file details:", req.file);
    const profilePicturePath = `/uploads/${req.file.filename}`;

    if (!req.user || !req.user.userId) {
      console.error(
        "User ID not found in req.user for profile picture update."
      );
      return res
        .status(401)
        .json({ message: "Unauthorized or User ID missing" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select(
      "username email _id createdAt updatedAt isAdmin profilePicture bio"
    );

    console.log("User after DB update:", updatedUser);
    if (!updatedUser) {
      console.error(
        `User not found with ID: ${req.user.userId} for profile picture update.`
      );
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Error updating profile picture" });
  }
};
