// routes/external-apis.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// YouTube videos endpoint
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

    // If no items found, return 404
    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: "YouTube video not found" });
    }

    res.json(response.data.items[0]);
  } catch (error) {
    console.error("YouTube API error:", error.response?.data || error.message);

    // Return appropriate error based on the API response
    if (error.response?.status === 403) {
      return res
        .status(403)
        .json({ message: "YouTube API quota exceeded or invalid API key" });
    }

    res.status(500).json({ message: "Failed to fetch YouTube data" });
  }
});

// Spotify episodes endpoint
router.get("/spotify/episodes/:episodeId", async (req, res) => {
  try {
    const { episodeId } = req.params;

    if (!episodeId) {
      return res.status(400).json({ message: "Episode ID is required" });
    }

    // --- First, get a token from Spotify ---
    // Use the correct Spotify token endpoint
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token", // <-- CORRECT TOKEN ENDPOINT
      new URLSearchParams({
        // Using URLSearchParams is correct for x-www-form-urlencoded
        grant_type: "client_credentials",
        // No need to include client_id/secret in the body for client_credentials when using Basic auth
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Basic Authorization header is correct for client_credentials
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // --- Use the token to fetch episode data ---
    // Use the correct Spotify API endpoint for getting an episode by ID
    const episodeResponse = await axios.get(
      `https://api.spotify.com/v1/episodes/${episodeId}`, // <-- CORRECT EPISODE ENDPOINT
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the obtained access token
        },
        params: {
          // Optional: Add market parameter if you need market-specific data
          // market: 'US' // Example: for United States market
        },
      }
    );

    // Spotify API returns the episode object directly
    res.json(episodeResponse.data);
  } catch (error) {
    console.error("Spotify API error:", error.response?.data || error.message);

    // More specific error handling for Spotify API responses
    if (error.response?.status === 401) {
      return res
        .status(401)
        .json({ message: "Spotify API authentication failed" });
    }
    if (error.response?.status === 400) {
      return res
        .status(400)
        .json({ message: "Invalid Spotify Episode ID format" });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Spotify episode not found" });
    }
    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ message: "Spotify API rate limit exceeded" });
    }

    res.status(500).json({ message: "Failed to fetch Spotify data" });
  }
});

export default router;
