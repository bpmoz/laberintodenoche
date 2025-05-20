import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CurrentUserContext } from "../context/CurrentContextUser";
import api from "../utils/Api";

const EpisodeDetail = () => {
  const { slug } = useParams();
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentPage, setCommentPage] = useState(1);

  const [youtubeVideoData, setYoutubeVideoData] = useState(null);
  const [currentYoutubeId, setCurrentYoutubeId] = useState(null);

  const youtubeEmbedUrl = currentYoutubeId
    ? `https://www.youtube-nocookie.com/embed/${currentYoutubeId}`
    : null;

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
            console.log(
              "LOG 1: Fetched YouTube Video Data (from your backend):",
              youtubeData
            );

            setYoutubeVideoData(youtubeData);
          } catch (youtubeErr) {
            console.error("Error fetching YouTube video metadata:", youtubeErr);
          }
        } else {
          setCurrentYoutubeId(null);
          setYoutubeVideoData(null);
        }

        if (isLoggedIn && episodeResponse._id) {
          try {
            const likeStatus = await api.getLikeStatus(episodeResponse._id);
            setIsLiked(likeStatus.liked);

            const likeCountResponse = await api.getLikeCount(
              episodeResponse._id
            );
            setLikeCount(likeCountResponse.count);
          } catch (likeErr) {
            console.error("Error fetching like status/count:", likeErr);
          }
        } else {
          setIsLiked(false);
          setLikeCount(0);
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

    return () => {
      // Abort ongoing fetch requests if the component unmounts
      // (Requires AbortController if you use fetch directly or configure axios)
    };
  }, [slug, isLoggedIn]); // Re-run effect if slug or login status changes

  // --- Handle Like Toggle (Existing Logic) ---
  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to like this episode");
      return;
    }

    // Use episode._id for the like/unlike actions
    if (!episode?._id) {
      console.error("Episode ID not available for liking.");
      return; // Cannot like/unlike if episode ID is missing
    }

    try {
      const method = isLiked ? "DELETE" : "POST";
      // Ensure you use the correct API endpoints for liking/unliking
      const url = isLiked
        ? // DELETE needs the episode ID in the path
          `${import.meta.env.VITE_API_URL}/api/likes/episode/${episode._id}`
        : // POST sends the episode ID in the body
          `${import.meta.env.VITE_API_URL}/api/likes`;

      const body = isLiked
        ? undefined // DELETE typically doesn't have a body
        : JSON.stringify({ episodeId: episode._id }); // POST needs episodeId in body

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt-token")}`,
        },
        ...(body && { body }), // Conditionally add body if it exists
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        setLikeCount(data.count); // Update count from backend response
      } else {
        // Handle non-OK responses (e.g., 401, 404, 500)
        const errorData = await response.json(); // Try to get error message from body
        throw new Error(errorData.message || "Failed to update like status");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert(error.message || "Failed to update like status. Please try again.");
    }
  };
  // --- End Handle Like Toggle ---
  const fetchComments = async (episodeId, page = 1) => {
    setLoadingComments(true);
    try {
      const commentsResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/comments/episode/${episodeId}?page=${page}&limit=10`
      );

      if (commentsResponse.ok) {
        const data = await commentsResponse.json();

        if (page === 1) {
          // Replace all comments
          setComments(data.comments);
        } else {
          // Append to existing comments
          setComments((prevComments) => [...prevComments, ...data.comments]);
        }

        // Check if there are more pages
        setHasMoreComments(
          data.pagination.currentPage < data.pagination.totalPages
        );
        setCommentPage(data.pagination.currentPage);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadMoreComments = () => {
    if (episode && hasMoreComments && !loadingComments) {
      fetchComments(episode._id, commentPage + 1);
    }
  };

  // --- Use fetched metadata in JSX ---
  // Use youtubeVideoData and spotifyEpisodeData for display
  const displayTitle =
    youtubeVideoData?.snippet?.title || episode?.title || "Loading...";
  const displayDuration =
    youtubeVideoData?.contentDetails?.duration ||
    episode?.duration ||
    "Loading...";
  // You might need to format the YouTube duration (e.g., PT1H30M5S) from contentDetails

  // ... (rest of your other helper functions like formatDate) ...

  // --- Loading and Error States ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt-token")}`,
          },
          body: JSON.stringify({
            episodeId: episode._id,
            content: newComment,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const newCommentData = await response.json();

      // Add new comment to the top of the list
      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };
  if (loading) {
    return <div className="episode__loading">Loading episode...</div>;
  }

  if (error) {
    return <div className="episode__error">Error: {error}</div>;
  }

  // Ensure episode data is available before rendering
  if (!episode) {
    return <div className="episode__not-found">Episode not found.</div>; // Should be caught by the error state above, but good fallback
  }

  // --- Render JSX ---
  return (
    <div className="episode">
      {/* Display episode details using your data and fetched metadata */}
      <div className="episode__header">
        {/* Use your episode image */}
        <img
          src={`${import.meta.env.VITE_API_URL}/${episode.imagePath}`}
          alt={episode.title}
          className="episode__image"
        />
        <div className="episode__info">
          {/* Use your title or fetched YouTube title */}
          <h1 className="episode__title">{displayTitle}</h1>
          {/* Use your duration or fetched YouTube duration */}
          <p className="episode__duration">Duration: {displayDuration}</p>
          {/* Display description from your data or fetched YouTube data */}
          <p className="episode__description">
            {episode.description || youtubeVideoData?.snippet?.description}
          </p>
          {/* Display tags from your data */}
          {episode.tags && episode.tags.length > 0 && (
            <p className="episode__tags">Tags: {episode.tags.join(", ")}</p>
          )}
          {/* You can add other metadata here */}
        </div>
      </div>

      {/* Player section - Simplified for YouTube only */}
      <div className="episode__player">
        {/* Removed episode__tabs as only YouTube is an option */}
        {/* You could have a single button if you want, e.g., "Watch on YouTube" */}
        {/* <div className="episode__tabs">
          <button className="episode__tab episode__tab--active">
            Watch on YouTube
          </button>
        </div> */}

        <div className="episode__player-container">
          {youtubeEmbedUrl && ( // Condition to render iframe
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
          {/* Display message if no YouTube embed URL */}
          {!youtubeEmbedUrl && !loading && (
            <p>No YouTube embed available for this episode.</p>
          )}
        </div>
      </div>

      {/* Engagement section: Like and Comments */}
      <div className="episode__engagement">
        {/* Like button */}
        <div className="episode__like-section">
          <button
            className={`episode__like-button ${
              isLiked ? "episode__like-button--active" : ""
            }`}
            onClick={handleLikeToggle}
            disabled={!isLoggedIn}
          >
            {isLiked ? "❤️" : "🤍"} {likeCount}
          </button>
          {!isLoggedIn && (
            <span className="episode__auth-message">
              <Link to="/login">Sign in</Link> to like this episode
            </span>
          )}
        </div>

        {/* Comments section */}
        <div className="episode__comments-section">
          <h3 className="episode__comments-title">
            Comments ({comments.length})
          </h3>

          {/* Comment form - only shown if authenticated */}
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
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="episode__auth-prompt">
              <Link to="/signin">Sign in</Link> to join the conversation
            </div>
          )}

          {/* Comment list */}
          <div className="episode__comments-list">
            {comments.length > 0 ? (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="episode__comment">
                    <div className="episode__comment-header">
                      <span className="episode__comment-author">
                        {comment.user.name}
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

                {/* Load more comments button */}
                {hasMoreComments && (
                  <button
                    className="episode__load-more-comments"
                    onClick={loadMoreComments}
                    disabled={loadingComments}
                  >
                    {loadingComments ? "Loading..." : "Load More Comments"}
                  </button>
                )}
              </>
            ) : (
              <p className="episode__no-comments">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetail;
