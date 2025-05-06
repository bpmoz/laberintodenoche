class Api {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.headers = options.headers;
  }

  getHeaders() {
    const headers = { ...this.headers };
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
      console.error("Authentication error (401) - clearing token");
      localStorage.removeItem("jwt-token");

      return Promise.reject(
        new Error("Authentication failed: Invalid or expired token")
      );
    }

    return res
      .json()
      .then((error) => {
        console.error("API error response body:", error);

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
      credentials: "include",
      body: JSON.stringify({
        username,
        bio,
      }),
    }).then(this._checkResponse);
  }

  updateProfilePicture(formData) {
    const authHeader = this.getHeaders().Authorization;
    const headers = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    return fetch(`${this.baseUrl}/api/auth/profile-picture`, {
      method: "PATCH",
      headers: headers,
      body: formData,
    }).then(this._checkResponse);
  }

  getEpisodes() {
    return fetch(`${this.baseUrl}/api/episodes`, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  getEpisodeById(episodeId) {
    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "GET",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }

  createEpisode(episodeData, imageFile) {
    const formData = new FormData();
    for (const key in episodeData) {
      formData.append(key, episodeData[key]);
    }
    formData.append("episodeImage", imageFile);

    const authHeader = this.getHeaders().Authorization;
    const headers = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    return fetch(`${this.baseUrl}/api/episodes`, {
      method: "POST",
      headers: headers,
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

    const authHeader = this.getHeaders().Authorization;
    const headers = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "PUT",
      headers: headers,
      body: formData,
    }).then(this._checkResponse);
  }

  deleteEpisode(episodeId) {
    return fetch(`${this.baseUrl}/api/episodes/${episodeId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    }).then(this._checkResponse);
  }
}

const api = new Api({
  baseUrl: "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
