import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/youtube/videos/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          id: videoId,
          part: "snippet,contentDetails,statistics",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: "YouTube video not found" });
    }

    res.json(response.data.items[0]);
  } catch (error) {
    console.error("YouTube API error:", error.response?.data || error.message);

    if (error.response?.status === 403) {
      return res
        .status(403)
        .json({ message: "YouTube API quota exceeded or invalid API key" });
    }

    res.status(500).json({ message: "Failed to fetch YouTube data" });
  }
});

export default router;
