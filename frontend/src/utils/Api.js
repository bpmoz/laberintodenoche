class Api {
  constructor(options) {
    this.baseUrl = import.meta.env.VITE_API_URL || options.baseUrl;
    this.initialHeaders = options.headers;
  }

  getHeaders() {
    const headers = { ...this.initialHeaders };
    headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("jwt-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  getAuthFormDataHeaders() {
    const headers = { ...this.initialHeaders };
    delete headers["Content-Type"];
    const token = localStorage.getItem("jwt-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }

    if (res.status === 401) {
      console.error("Authentication error (401) - Invalid or expired token");
      return Promise.reject(
        new Error("Authentication failed: Invalid or expired token")
      );
    }

    return res
      .json()
      .then((error) => {
        console.error(`API error ${res.status}:`, error);
        return Promise.reject(error || `Error: ${res.status}`);
      })
      .catch(() => {
        console.error(
          `API error: Status ${res.status}, failed to parse error body.`
        );
        return Promise.reject(`Error: ${res.status}`);
      });
  }

  getUserInfo() {
    return fetch(`${this.baseUrl}/api/auth/verify`, {
      method: "GET",
      headers: this.getHeaders(),
    })
      .then(this._checkResponse)
      .catch((error) => {
        console.error("getUserInfo() fetch error:", error);
        throw error;
      });
  }

  login(userData) {
    return fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    }).then(this._checkResponse);
  }

  register(userData) {
    return fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    }).then(this._checkResponse);
  }

  logout() {
    localStorage.removeItem("jwt-token");
  }

  verifyToken() {
    return this.getUserInfo();
  }

  updateUserInfo({ username, bio }) {
    return fetch(`${this.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({
        username,
        bio,
      }),
    }).then(this._checkResponse);
  }

  updateProfilePicture(formData) {
    return fetch(`${this.baseUrl}/api/auth/profile-picture`, {
      method: "PATCH",
      headers: this.getAuthFormDataHeaders(),
      body: formData,
    }).then(this._checkResponse);
  }

  getEpisodes() {
    return fetch(`${this.baseUrl}/api/episodes`, {
      method: "GET",
    }).then(this._checkResponse);
  }

  getEpisodeById(slug) {
    return fetch(`${this.baseUrl}/api/episodes/${slug}`, {
      method: "GET",
    }).then(this._checkResponse);
  }

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
      headers: this.getAuthFormDataHeaders(),
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
    }

    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "PUT",
      headers: this.getAuthFormDataHeaders(),
      body: formData,
    }).then(this._checkResponse);
  }

  deleteEpisode(episodeId) {
    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  getUserComments() {
    const url = `${this.baseUrl}/api/user/comments`;
    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  getFavoriteEpisodes() {
    const url = `${this.baseUrl}/api/user/favorite-episodes`;
    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  getFavoriteBooks() {
    const url = `${this.baseUrl}/api/user/favorite-books`;
    return fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  toggleFavoriteBookStatus(bookId, method) {
    if (!bookId) {
      console.warn("toggleFavoriteBookStatus called without a bookId");
      return Promise.reject("Book ID is required to toggle favorite status.");
    }
    // Assuming backend endpoint is /api/books/favorite
    return fetch(`${this.baseUrl}/api/books/favorite`, {
      method: method, // Will be 'POST' for favoriting, 'DELETE' for unfavoriting
      headers: this.getHeaders(), // Requires authentication
      body: method === "POST" ? JSON.stringify({ bookId }) : undefined, // Send bookId in body for POST
    }).then(this._checkResponse);
  }

  updateUserProfile(formData) {
    const url = `${this.baseUrl}/api/auth/me`;
    return fetch(url, {
      method: "PATCH",
      headers: this.getAuthFormDataHeaders(),
      body: formData,
    }).then(this._checkResponse);
  }

  getYoutubeVideo(videoId) {
    if (!videoId) {
      return Promise.resolve(null);
    }
    return fetch(
      `${this.baseUrl}/api/external-apis/youtube/videos/${videoId}`,
      {
        method: "GET",
      }
    ).then(this._checkResponse);
  }

  getLikeStatus(episodeId) {
    if (!episodeId) {
      return Promise.resolve({ liked: false });
    }
    return fetch(`${this.baseUrl}/api/likes/status/episode/${episodeId}`, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  getLikeCount(episodeId) {
    if (!episodeId) {
      return Promise.resolve({ count: 0 });
    }
    return fetch(`${this.baseUrl}/api/likes/count/episode/${episodeId}`, {
      method: "GET",
    }).then(this._checkResponse);
  }

  toggleLikeStatus(episodeId, method) {
    if (!episodeId) {
      return Promise.reject("Episode ID is required to toggle like status.");
    }
    return fetch(`${this.baseUrl}/api/likes`, {
      method: method,
      headers: this.getHeaders(),
      body: method === "POST" ? JSON.stringify({ episodeId }) : undefined,
    }).then(this._checkResponse);
  }

  getComments(episodeId, page = 1, limit = 10) {
    if (!episodeId) {
      return Promise.resolve({
        comments: [],
        pagination: { currentPage: 0, totalPages: 0 },
      });
    }
    return fetch(
      `${this.baseUrl}/api/comments/episode/${episodeId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    ).then(this._checkResponse);
  }

  postComment(episodeId, content) {
    if (!episodeId || !content) {
      return Promise.reject("Episode ID and comment content are required.");
    }
    return fetch(`${this.baseUrl}/api/comments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ episodeId, content }),
    }).then(this._checkResponse);
  }
}

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

const api = new Api({
  baseUrl: baseUrl,
  headers: {
    Accept: "application/json",
  },
});

export default api;
