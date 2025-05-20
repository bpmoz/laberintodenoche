import React, { useState, useEffect, useContext } from "react";
import { CurrentUserContext } from "../context/CurrentContextUser";
import api from "../utils/Api";
import EditProfilePopup from "./EditProfilePopup";

const UserProfile = () => {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [activeTab, setActiveTab] = useState("episodes");
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchFavoriteEpisodes();
      fetchFavoriteBooks();
      fetchUserComments();
    }
  }, [currentUser]);

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsEditProfilePopupOpen(false);
  };

  const handleUpdateUserInfo = (userInfo) => {
    api
      .updateUserInfo(userInfo)
      .then((fullUserObject) => {
        setCurrentUser(fullUserObject);
        handleClosePopup();
      })
      .catch((err) => console.error("Error updating user info:", err));
  };

  const handleUpdateProfilePicture = (formData) => {
    api
      .updateProfilePicture(formData)
      .then((response) => {
        if (response && response.user) {
          setCurrentUser(response.user);
        } else {
          console.error(
            "Profile picture updated, but user data missing or in unexpected format in API response:",
            response
          );
        }
        handleClosePopup();
      })
      .catch((err) => console.error("Error updating profile picture:", err));
  };

  const handleUpdateUserProfile = (formData) => {
    api
      .updateUserProfile(formData)
      .then((updatedUser) => {
        setCurrentUser(updatedUser);
        handleClosePopup();
      })
      .catch((err) => console.error("Error updating user profile:", err));
  };

  const fetchFavoriteEpisodes = () => {
    api
      .getFavoriteEpisodes()
      .then((episodes) => {
        console.log("Fetched Favorite Episodes:", episodes); // Keep this log for debugging

        setFavoriteEpisodes(episodes);
      })
      .catch((err) => console.error("Error fetching favorite episodes:", err));
  };

  const fetchFavoriteBooks = () => {
    api
      .getFavoriteBooks(currentUser.id)
      .then((books) => {
        setFavoriteBooks(books);
      })
      .catch((err) => console.error("Error fetching favorite books:", err));
  };

  const fetchUserComments = () => {
    api
      .getUserComments()
      .then((comments) => {
        setUserComments(comments);
      })
      .catch((err) => console.error("Error fetching user comments:", err));
  };

  const removeFromFavorites = (id, type) => {
    if (type === "episode") {
      setFavoriteEpisodes(
        favoriteEpisodes.filter((episode) => episode.id !== id)
      );
    } else if (type === "book") {
      setFavoriteBooks(favoriteBooks.filter((book) => book.id !== id));
    }
  };

  const deleteComment = (id) => {
    setUserComments(userComments.filter((comment) => comment.id !== id));
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Unknown date";
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  if (!currentUser) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="user">
      <div className="user__profile">
        <div className="user__profile-header">
          <div className="user__profile-avatar-container">
            <img
              src={
                currentUser.profilePicture
                  ? `http://localhost:3002${currentUser.profilePicture}`
                  : "/default-avatar.jpg"
              }
              alt="Profile"
              className="user__profile-avatar"
            />
          </div>

          <div className="user__profile-info">
            <h1 className="user__profile-username">{currentUser.username}</h1>
            <p className="user__profile-email">{currentUser.email}</p>
            <p className="user__profile-bio">{currentUser.bio}</p>
            <p className="user__profile-joined-date">
              Miembro desde {formatDate(currentUser.createdAt)}
            </p>
            <button
              className="user__profile-edit-button"
              onClick={handleEditProfileClick}
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={handleClosePopup}
          onUpdateUserInfo={handleUpdateUserInfo}
          onUpdateProfilePicture={handleUpdateProfilePicture}
          onUpdateUserProfile={handleUpdateUserProfile}
        />

        <div className="user__profile-tabs">
          <button
            className={`user__profile-tab-button ${
              activeTab === "episodes" ? "user__profile-tab-button--active" : ""
            }`}
            onClick={() => setActiveTab("episodes")}
          >
            Episodios favoritos{" "}
          </button>
          <button
            className={`user__profile-tab-button ${
              activeTab === "books" ? "user__profile-tab-button--active" : ""
            }`}
            onClick={() => setActiveTab("books")}
          >
            Libros favoritos
          </button>
          <button
            className={`user__profile-tab-button ${
              activeTab === "comments" ? "user__profile-tab-button--active" : ""
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Mis comentarios
          </button>
        </div>

        <div className="user__profile-content">
          {activeTab === "episodes" && (
            <div className="user__profile-episodes">
              <h2 className="user__profile-section-title">
                Episodios favoritos
              </h2>
              {favoriteEpisodes.length === 0 ? (
                <p className="user__profile-empty-message">
                  Sin episodios favoritos aún.
                </p>
              ) : (
                <ul className="user__profile-episodes-list">
                  {favoriteEpisodes.map((episode) => (
                    <li key={episode.id} className="user__profile-episode-item">
                      <div className="user__profile-episode-image">
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${
                            episode.imagePath
                          }`}
                          alt={episode.title}
                        />
                        <div className="user__profile-episode-play">
                          <button className="user__profile-play-button">
                            ▶
                          </button>
                        </div>
                      </div>
                      <div className="user__profile-episode-info">
                        <h3 className="user__profile-episode-title">
                          {episode.title}
                        </h3>
                        <p className="user__profile-episode-podcast">
                          {episode.podcastName}
                        </p>
                        <p className="user__profile-episode-duration">
                          {episode.duration}
                        </p>
                        <p className="user__profile-episode-date">
                          Added: {formatDate(episode.dateAdded)}
                        </p>
                      </div>
                      <button
                        className="user__profile-remove-button"
                        onClick={() =>
                          removeFromFavorites(episode.id, "episode")
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "books" && (
            <div className="user__profile-books">
              <h2 className="user__profile-section-title">Libros favoritos</h2>
              {favoriteBooks.length === 0 ? (
                <p className="user__profile-empty-message">
                  Sin libros favoritos aún.
                </p>
              ) : (
                <ul className="user__profile-books-list">
                  {favoriteBooks.map((book) => (
                    <li key={book.id} className="user__profile-book-item">
                      <div className="user__profile-book-image">
                        <img src={book.coverImage} alt={book.title} />
                      </div>
                      <div className="user__profile-book-info">
                        <h3 className="user__profile-book-title">
                          {book.title}
                        </h3>
                        <p className="user__profile-book-author">
                          by {book.author}
                        </p>
                        <p className="user__profile-book-episode">
                          From episode: <span>{book.featuredEpisode}</span>
                        </p>
                        <p className="user__profile-book-date">
                          Added: {formatDate(book.dateAdded)}
                        </p>
                      </div>
                      <button
                        className="user__profile-remove-button"
                        onClick={() => removeFromFavorites(book.id, "book")}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="user__profile-comments">
              <h2 className="user__profile-section-title">Mis comentarios</h2>
              {userComments.length === 0 ? (
                <p className="user__profile-empty-message">
                  No has dejado comentarios aún.
                </p>
              ) : (
                <ul className="user__profile-comments-list">
                  {userComments.map((comment) => (
                    <li key={comment.id} className="user__profile-comment-item">
                      <div className="user__profile-comment-header">
                        <h3 className="user__profile-comment-episode">
                          On episode: <span>{comment.episodeTitle}</span>
                        </h3>
                        <p className="user__profile-comment-date">
                          {formatDate(comment.datePosted)}
                        </p>
                      </div>
                      <p className="user__profile-comment-content">
                        {comment.content}
                      </p>
                      <div className="user__profile-comment-actions">
                        <button className="user__profile-edit-comment-button">
                          Edit
                        </button>
                        <button
                          className="user__profile-delete-comment-button"
                          onClick={() => deleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
