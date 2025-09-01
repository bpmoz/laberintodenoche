import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CurrentUserContext } from "../context/CurrentContextUser";
import api from "../utils/Api";
import useLikeToggle from "../hooks/useLikeToggle";
import useComments from "../hooks/useComments";
import BookCard from "./BookCard";
import CommentSection from "./CommentSection";

const formatDurationIso8601 = (isoDuration) => {
  if (!isoDuration) return "N/A";

  let durationString = String(isoDuration);

  if (typeof isoDuration === "number") {
    const totalSeconds = isoDuration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let isoParts = "PT";
    if (hours > 0) isoParts += `${hours}H`;
    if (minutes > 0) isoParts += `${minutes}M`;
    if (seconds > 0 || (hours === 0 && minutes === 0 && totalSeconds === 0))
      isoParts += `${seconds}S`;

    durationString = isoParts;
    console.log(
      "Converted number duration to ISO-like string for parsing:",
      durationString
    );
  }

  const matches = durationString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) {
    console.warn(
      "Could not parse duration string using regex:",
      durationString
    );
    return durationString;
  }

  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);

  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    formattedDuration += `${minutes}m `;
  }
  if (seconds > 0 || formattedDuration.trim() === "") {
    formattedDuration += `${seconds}s`;
  }

  return formattedDuration.trim();
};

const cleanDescriptionLinks = (text) => {
  if (!text) return "";
  const genericUrlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.\-]+(?:\.[a-zA-Z]{2,})(?:\/[^\s]*)?)/g;
  return text.replace(genericUrlRegex, "");
};

const removeSpecificWords = (text) => {
  if (!text) return "";
  const wordsToRemove = ["spotify", "youtube", "twitter", "instagram"];
  let modifiedText = text;
  wordsToRemove.forEach((word) => {
    const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
    modifiedText = modifiedText.replace(wordRegex, "");
  });
  return modifiedText;
};

const EpisodeDetail = () => {
  const { slug } = useParams();
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [youtubeVideoData, setYoutubeVideoData] = useState(null);
  const [currentYoutubeId, setCurrentYoutubeId] = useState(null);

  const [initialIsLiked, setInitialIsLiked] = useState(false);
  const [initialLikeCount, setInitialLikeCount] = useState(0);

  const { isLiked, likeCount, handleLikeToggle } = useLikeToggle(
    episode?._id,
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
    commentPage,
  } = useComments(episode?._id);

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
            setYoutubeVideoData(youtubeData);
          } catch (youtubeErr) {
            console.error("Error fetching YouTube video metadata:", youtubeErr);
            setYoutubeVideoData(null);
          }
        } else {
          setCurrentYoutubeId(null);
          setYoutubeVideoData(null);
        }

        if (isLoggedIn && episodeResponse._id) {
          try {
            const likeStatus = await api.getLikeStatus(episodeResponse._id);
            setInitialIsLiked(likeStatus.liked);
            const likeCountResponse = await api.getLikeCount(
              episodeResponse._id
            );
            setInitialLikeCount(likeCountResponse.count);
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
  }, [slug, isLoggedIn]);

  const displayTitle =
    youtubeVideoData?.snippet?.title || episode?.title || "Loading...";

  const displayDuration = formatDurationIso8601(
    youtubeVideoData?.contentDetails?.duration || episode?.duration
  );

  const youtubeDescription = youtubeVideoData?.snippet?.description;
  const cleanedDescription = youtubeDescription
    ? removeSpecificWords(cleanDescriptionLinks(youtubeDescription))
    : episode?.description;

  const displayDescription = cleanedDescription;

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
        {/* <img
          src={`${import.meta.env.VITE_API_URL}/${episode.imagePath}`}
          alt={episode.title}
          className="episode__image"
        /> */}
        <div className="episode__info">
          <h1 className="episode__title">{displayTitle}</h1>
          <p className="episode__duration">Duración: {displayDuration}</p>
          <p className="episode__description">
            {" "}
            + : + : + :{displayDescription}
          </p>
          {episode.tags && episode.tags.length > 0 && (
            <p className="episode__tags">
              Etiquetas: {episode.tags.join(", ")}
            </p>
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

      {}
      <div className="episode__like-section">
        {" "}
        {}
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
            <Link to="/login" className="episode__link">
              Unite al laberinto
            </Link>{" "}
            para dar like
          </span>
        )}
      </div>

      {episode.mentionedBooks && episode.mentionedBooks.length > 0 && (
        <div className="episode__books-section">
          <h3 className="episode__books-title">Libros mencionados</h3>
          <div className="episode__books-list">
            {episode.mentionedBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>
      )}

      {}
      <CommentSection
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={submittingComment}
        loadingComments={loadingComments}
        hasMoreComments={hasMoreComments}
        handleCommentSubmit={handleCommentSubmit}
        loadMoreComments={loadMoreComments}
        commentPage={commentPage}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default EpisodeDetail;
