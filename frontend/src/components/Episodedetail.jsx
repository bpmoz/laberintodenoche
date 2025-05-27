// frontend/src/components/EpisodeDetail.jsx

import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CurrentUserContext } from "../context/CurrentContextUser";
import api from "../utils/Api"; // Import your API utility
// Import your new custom hooks
import useLikeToggle from "../hooks/useLikeToggle";
import useComments from "../hooks/useComments"; // Adjust path if necessary
import BookCard from "./BookCard";

const EpisodeDetail = () => {
  const { slug } = useParams();
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  // --- Main Episode Data States ---
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- YouTube Video Data States ---
  const [youtubeVideoData, setYoutubeVideoData] = useState(null);
  const [currentYoutubeId, setCurrentYoutubeId] = useState(null);

  // --- State for initial like status and count (passed to useLikeToggle) ---
  const [initialIsLiked, setInitialIsLiked] = useState(false);
  const [initialLikeCount, setInitialLikeCount] = useState(0);

  // --- Use Custom Hooks ---
  const { isLiked, likeCount, handleLikeToggle } = useLikeToggle(
    episode?._id, // Pass episode ID to the hook
    initialIsLiked,
    initialLikeCount
  );

  const {
    comments,
    newComment,
    setNewComment,
    submittingComment,
    loadingComments,
    hasMoreComments,
    handleCommentSubmit,
    loadMoreComments,
  } = useComments(episode?._id); // Pass episode ID to the comments hook

  // --- Derived State (YouTube Embed URL) ---
  const youtubeEmbedUrl = currentYoutubeId
    ? `https://www.youtube-nocookie.com/embed/${currentYoutubeId}`
    : null;

  // --- Main Data Fetching Effect ---
  useEffect(() => {
    const fetchEpisodeData = async (currentSlug) => {
      setLoading(true);
      setError(null);
      try {
        const episodeResponse = await api.getEpisodeById(currentSlug);

        if (!episodeResponse) {
          setLoading(false);
          setError("Episode not found.");
          return;
        }

        setEpisode(episodeResponse);

        if (episodeResponse.youtubeId) {
          setCurrentYoutubeId(episodeResponse.youtubeId);
          try {
            const youtubeData = await api.getYoutubeVideo(
              episodeResponse.youtubeId
            );
            setYoutubeVideoData(youtubeData);
          } catch (youtubeErr) {
            console.error("Error fetching YouTube video metadata:", youtubeErr);
          }
        } else {
          setCurrentYoutubeId(null);
          setYoutubeVideoData(null);
        }

        // --- Fetch initial like status and count (for useLikeToggle) ---
        if (isLoggedIn && episodeResponse._id) {
          try {
            const likeStatus = await api.getLikeStatus(episodeResponse._id);
            setInitialIsLiked(likeStatus.liked); // Update initial state for hook
            const likeCountResponse = await api.getLikeCount(
              episodeResponse._id
            );
            setInitialLikeCount(likeCountResponse.count); // Update initial state for hook
          } catch (likeErr) {
            console.error("Error fetching like status/count:", likeErr);
            setInitialIsLiked(false);
            setInitialLikeCount(0);
          }
        } else {
          setInitialIsLiked(false);
          setInitialLikeCount(0);
        }
      } catch (err) {
        console.error("Error fetching episode data:", err);
        setError("Failed to load episode data.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEpisodeData(slug);
    }
  }, [slug, isLoggedIn]); // isLoggedIn is a dependency for fetching like status

  const displayTitle =
    youtubeVideoData?.snippet?.title || episode?.title || "Loading...";
  const displayDuration =
    youtubeVideoData?.contentDetails?.duration ||
    episode?.duration ||
    "Loading...";

  if (loading) {
    return <div className="episode__loading">Loading episode...</div>;
  }

  if (error) {
    return <div className="episode__error">Error: {error}</div>;
  }

  if (!episode) {
    return <div className="episode__not-found">Episode not found.</div>;
  }

  return (
    <div className="episode">
      <div className="episode__header">
        <img
          src={`${import.meta.env.VITE_API_URL}/${episode.imagePath}`}
          alt={episode.title}
          className="episode__image"
        />
        <div className="episode__info">
          <h1 className="episode__title">{displayTitle}</h1>
          <p className="episode__duration">Duration: {displayDuration}</p>
          <p className="episode__description">
            {episode.description || youtubeVideoData?.snippet?.description}
          </p>
          {episode.tags && episode.tags.length > 0 && (
            <p className="episode__tags">Tags: {episode.tags.join(", ")}</p>
          )}
        </div>
      </div>

      <div className="episode__player">
        <div className="episode__player-container">
          {youtubeEmbedUrl && (
            <iframe
              className="episode__youtube-iframe"
              width="100%"
              height="315"
              src={youtubeEmbedUrl}
              title={youtubeVideoData?.snippet?.title || "YouTube video player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
          {!youtubeEmbedUrl && !loading && <p>Video no disponible</p>}
        </div>
      </div>

      {/* --- Books Mentioned Section - Now using the imported BookCard --- */}
      {episode.mentionedBooks && episode.mentionedBooks.length > 0 && (
        <div className="episode__books-section">
          <h3 className="episode__books-title">Books Mentioned</h3>
          <div className="episode__books-list">
            {episode.mentionedBooks.map((book) => (
              // Just pass the 'book' prop, BookCard will handle login/user context
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>
      )}
      {/* --- END Books Section --- */}

      <div className="episode__engagement">
        {}
        <div className="episode__like-section">
          <button
            className={`episode__like-button ${
              isLiked ? "episode__like-button--active" : ""
            }`}
            onClick={handleLikeToggle}
            disabled={!isLoggedIn || !episode._id}
          >
            {isLiked ? "❤️" : "🤍"} {likeCount}
          </button>
          {!isLoggedIn && (
            <span className="episode__auth-message">
              <Link to="/login">Unite al laberinto</Link> para dar like
            </span>
          )}
        </div>

        {}
        <div className="episode__comments-section">
          <h3 className="episode__comments-title">
            comentarios ({comments.length})
          </h3>

          {isLoggedIn ? (
            <form
              className="episode__comment-form"
              onSubmit={handleCommentSubmit}
            >
              <textarea
                className="episode__comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                required
              />
              <button
                className="episode__comment-submit"
                type="submit"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? "Posteando" : "Comentario posteado"}
              </button>
            </form>
          ) : (
            <div className="episode__auth-prompt">
              <Link to="/login">Unite al laberinto</Link> para comentar
            </div>
          )}

          <div className="episode__comments-list">
            {loadingComments && commentPage === 1 ? (
              <p>Cargando comentarios...</p>
            ) : comments.length > 0 ? (
              <>
                {comments.map((comment) => (
                  <div key={comment._id} className="episode__comment">
                    {" "}
                    {}
                    <div className="episode__comment-header">
                      <span className="episode__comment-author">
                        {comment.user ? comment.user.username : "Unknown User"}{" "}
                        {}
                      </span>
                      <span className="episode__comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="episode__comment-content">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {hasMoreComments && (
                  <button
                    className="episode__load-more-comments"
                    onClick={loadMoreComments}
                    disabled={loadingComments}
                  >
                    {loadingComments ? "Cargando" : "Cargar más comentarios"}
                  </button>
                )}
              </>
            ) : (
              <p className="episode__no-comments">
                Sin comentarios aún. Sé el primero en comentar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetail;
