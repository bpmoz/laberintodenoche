// frontend/src/utils/api.js

// Use import.meta.env for Vite environment variables
//const API_BASE_URL = import.meta.env.VITE_API_URL; // Use this if defined in .env

// Or, if you prefer to use the hardcoded URL here, keep it as you had it initially:
// const API_BASE_URL = "http://localhost:3002";

// Using the class structure you already have
class Api {
  constructor(options) {
    // Use VITE_API_URL if available, otherwise fallback to hardcoded
    this.baseUrl = import.meta.env.VITE_API_URL || options.baseUrl;
    // Initial headers might be useful defaults, getHeaders merges and adds Auth
    this.initialHeaders = options.headers;
  }

  getHeaders() {
    // Start with initial headers (like Accept)
    const headers = { ...this.initialHeaders };
    // Add Content-Type for JSON requests (important!)
    headers["Content-Type"] = "application/json";
    // Add Authorization header if token exists
    const token = localStorage.getItem("jwt-token"); // Use the correct key
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Helper specifically for FormData requests (file uploads, mixed text/file)
  // Content-Type should NOT be set manually for FormData
  getAuthFormDataHeaders() {
    const headers = { ...this.initialHeaders }; // Start with initial headers (like Accept)
    delete headers["Content-Type"]; // *** Crucial: Remove Content-Type for FormData ***
    const token = localStorage.getItem("jwt-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      // If successful, return the JSON body
      return res.json();
    }

    // --- Error Handling ---
    // Log specific 401 errors and potentially clear token
    if (res.status === 401) {
      console.error("Authentication error (401) - Invalid or expired token");
      // Optionally clear token if you are certain 401 always means invalid token
      // localStorage.removeItem("jwt-token"); // Be cautious clearing here; might need different handling
      // You might want to trigger a logout flow in your Context/App instead
      // For now, let's just throw the error for the caller to handle
      return Promise.reject(
        new Error("Authentication failed: Invalid or expired token")
      );
    }

    // Try to parse JSON error body for other errors
    return res
      .json()
      .then((error) => {
        console.error(`API error ${res.status}:`, error);
        // Reject with the error object or message from the backend
        return Promise.reject(error || `Error: ${res.status}`);
      })
      .catch(() => {
        // Fallback if response body is not JSON
        console.error(
          `API error: Status ${res.status}, failed to parse error body.`
        );
        return Promise.reject(`Error: ${res.status}`); // Reject with status if no JSON error
      });
  }

  // --- Existing Methods ---

  getUserInfo() {
    // Assuming this route verifies token and returns user data
    return fetch(`${this.baseUrl}/api/auth/verify`, {
      method: "GET",
      headers: this.getHeaders(), // Includes Auth header
    })
      .then(this._checkResponse)
      .catch((error) => {
        // Log the error but re-throw it so the caller can handle it
        console.error("getUserInfo() fetch error:", error);
        throw error;
      });
  }

  login(userData) {
    return fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(), // Includes Auth header (though not needed for initial login) and Content-Type
      body: JSON.stringify(userData),
    }).then(this._checkResponse);
  }

  register(userData) {
    return fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(), // Includes Auth header (not needed for register) and Content-Type
      body: JSON.stringify(userData),
    }).then(this._checkResponse);
  }

  logout() {
    // Frontend-only logout: Clear token
    localStorage.removeItem("jwt-token");
    // If backend has a logout endpoint (e.g., for token invalidation on server), call it here
    // return fetch(`${this.baseUrl}/api/auth/logout`, { method: 'POST', headers: this.getHeaders() }).then(...)
  }

  verifyToken() {
    // Re-uses getUserInfo as it hits an auth-protected endpoint
    return this.getUserInfo();
  }

  // Existing updateUserInfo - Sends JSON to /api/auth/me
  updateUserInfo({ username, bio }) {
    return fetch(`${this.baseUrl}/api/auth/me`, {
      method: "PATCH", // Or 'PUT'
      headers: this.getHeaders(), // Sends Content-Type: application/json
      body: JSON.stringify({
        username,
        bio,
      }),
    }).then(this._checkResponse);
  }

  // Existing updateProfilePicture - Sends FormData to /api/auth/profile-picture
  updateProfilePicture(formData) {
    return fetch(`${this.baseUrl}/api/auth/profile-picture`, {
      method: "PATCH", // Or 'PUT' or 'POST'
      headers: this.getAuthFormDataHeaders(), // Uses headers without Content-Type for FormData
      body: formData, // FormData object
    }).then(this._checkResponse);
  }

  // --- Episodes Methods ---

  getEpisodes() {
    // Assuming this is public
    return fetch(`${this.baseUrl}/api/episodes`, {
      method: "GET",
      // headers: this.getHeaders(), // Use getHeaders() only if authentication is required
    }).then(this._checkResponse);
  }

  getEpisodeById(slug) {
    // Or getEpisodeBySlug
    return fetch(`${this.baseUrl}/api/episodes/${slug}`, {
      method: "GET",
      // Assuming fetching a single episode by slug is public,
      // otherwise add headers: this.getHeaders()
      // headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  // Assuming these require authentication (admin or owner)
  createEpisode(episodeData, imageFile) {
    const formData = new FormData();
    for (const key in episodeData) {
      formData.append(key, episodeData[key]);
    }
    if (imageFile) {
      formData.append("episodeImage", imageFile);
    }

    return fetch(`${this.baseUrl}/api/episodes`, {
      method: "POST",
      headers: this.getAuthFormDataHeaders(), // FormData headers + Auth
      body: formData,
    }).then(this._checkResponse);
  }

  updateEpisode(episodeId, episodeData, imageFile) {
    const formData = new FormData();
    for (const key in episodeData) {
      formData.append(key, episodeData[key]);
    }
    if (imageFile) {
      formData.append("episodeImage", imageFile);
    } else {
      // If no new image, you might need to tell the backend
      // e.g., formData.append('noNewImage', 'true');
    }

    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "PUT", // Or 'PATCH'
      headers: this.getAuthFormDataHeaders(), // FormData headers + Auth
      body: formData,
    }).then(this._checkResponse);
  }

  deleteEpisode(episodeId) {
    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "DELETE",
      headers: this.getHeaders(), // Use standard JSON headers + Auth
    }).then(this._checkResponse);
  }

  // --- New Methods for User Profile ---

  // Fetches comments made by the current logged-in user
  // Assumes backend endpoint GET /api/user/comments (protected by auth)
  // This endpoint should return comments AND their like counts.
  getUserComments() {
    const url = `${this.baseUrl}/api/user/comments`; // Common pattern for current user's data

    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(), // Includes Auth header
    }).then(this._checkResponse);
  }

  // Fetches favorite episodes for the current logged-in user
  // Assumes backend endpoint GET /api/user/favorite-episodes (protected by auth)
  getFavoriteEpisodes() {
    const url = `${this.baseUrl}/api/user/favorite-episodes`; // Common pattern

    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(), // Includes Auth header
    }).then(this._checkResponse);
  }

  // Fetches favorite books for the current logged-in user
  // Assumes backend endpoint GET /api/user/favorite-books (protected by auth)
  getFavoriteBooks() {
    const url = `${this.baseUrl}/api/user/favorite-books`; // Common pattern

    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(), // Includes Auth header
    }).then(this._checkResponse);
  }

  // updateUserProfile method - called with FormData in UserProfile.jsx
  // Assumes backend endpoint PATCH or PUT /api/auth/me (or /api/user)
  // This endpoint should handle FormData for general profile fields (username, bio, etc., potentially image)
  // This method seems like an alternative or more comprehensive update than the JSON updateUserInfo you had.
  // Let's align its endpoint with the existing updateUserInfo which hits /api/auth/me
  updateUserProfile(formData) {
    const url = `${this.baseUrl}/api/auth/me`; // Assuming this endpoint handles PATCH with FormData

    return fetch(url, {
      method: "PATCH", // Or 'PUT'
      headers: this.getAuthFormDataHeaders(), // Uses headers without Content-Type, includes Auth
      body: formData, // Pass the FormData object directly
    }).then(this._checkResponse);
  }
  // --- ADD These New Methods ---

  // Fetches YouTube video metadata from your backend proxy
  getYoutubeVideo(videoId) {
    if (!videoId) {
      console.warn("getYoutubeVideo called without a videoId");
      return Promise.resolve(null); // Return null or empty data if no ID
    }
    // Calls your backend external-apis route
    return fetch(
      `${this.baseUrl}/api/external-apis/youtube/videos/${videoId}`,
      {
        method: "GET",
        // These external API proxy routes might not require auth headers themselves,
        // as the auth is for your user, not the external API call itself.
        // However, if your external-apis router requires user auth, uncomment headers:
        // headers: this.getHeaders(),
      }
    ).then(this._checkResponse);
  }

  // Fetches the like status for a specific episode for the current user
  getLikeStatus(episodeId) {
    if (!episodeId) {
      console.warn("getLikeStatus called without an episodeId");
      return Promise.resolve({ liked: false }); // Return default status if no ID
    }
    // Calls your backend likes route
    return fetch(`${this.baseUrl}/api/likes/status/episode/${episodeId}`, {
      method: "GET",
      headers: this.getHeaders(), // Requires user authentication
    }).then(this._checkResponse);
  }

  // Fetches the like count for a specific episode
  getLikeCount(episodeId) {
    if (!episodeId) {
      console.warn("getLikeCount called without an episodeId");
      return Promise.resolve({ count: 0 }); // Return default count if no ID
    }
    // Calls your backend likes route
    return fetch(`${this.baseUrl}/api/likes/count/episode/${episodeId}`, {
      method: "GET",
      // Assuming like count can be fetched without user auth,
      // otherwise add headers: this.getHeaders()
      // headers: this.getHeaders(),
    }).then(this._checkResponse);
  }
} // End of Class definition

// --- Create and Export API Instance ---

// Check if VITE_API_URL is defined by Vite, otherwise use the hardcoded default
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

const api = new Api({
  baseUrl: baseUrl,
  // These are initial headers. getHeaders() will add Content-Type for JSON and Auth.
  headers: {
    Accept: "application/json",
    // Content-Type is added in getHeaders() for JSON requests, and removed in getAuthFormDataHeaders() for FormData.
    // So, setting it here is just a default that gets overridden.
    // 'Content-Type': 'application/json',
  },
});

export default api;
