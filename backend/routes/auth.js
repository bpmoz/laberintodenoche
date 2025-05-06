// routes/auth.js
import express from "express";
import dotenv from "dotenv";
import { upload } from "../uploadConfig.js";
import { auth } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";

dotenv.config();

const router = express.Router();

// User registration
router.post("/register", authController.register);

// User login
router.post("/login", authController.login);

// Verify token
router.get("/verify", authController.verifyToken);

// Profile picture update
router.patch(
  "/profile-picture",
  auth,
  upload.single("profilePicture"),
  authController.updateProfilePicture
);

router.patch("/me", auth, authController.updateProfile);

export default router;
