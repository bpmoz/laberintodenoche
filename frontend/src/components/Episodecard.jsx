import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/Api";

const EpisodeCard = ({ episode }) => {
  const [youtubeVideoData, setYoutubeVideoData] = useState(null);
  const [loadingYoutubeData, setLoadingYoutubeData] = useState(false);
  const [youtubeError, setYoutubeError] = useState(null);

  useEffect(() => {
    const fetchYoutubeData = async () => {
      if (episode && episode.youtubeId) {
        setLoadingYoutubeData(true);
        setYoutubeError(null);
        try {
          const data = await api.getYoutubeVideo(episode.youtubeId);
          setYoutubeVideoData(data);
        } catch (err) {
          console.error("Error fetching YouTube data for card:", err);
          setYoutubeError("Failed to load YouTube info.");
          setYoutubeVideoData(null);
        } finally {
          setLoadingYoutubeData(false);
        }
      } else {
        setYoutubeVideoData(null);
        setLoadingYoutubeData(false);
        setYoutubeError(null);
      }
    };

    fetchYoutubeData();
  }, [episode]);

  if (!episode) {
    return (
      <div className="episode__card--loading">Loading episode card...</div>
    );
  }

  const imageUrl = `http://localhost:3002/${episode.imagePath}`;

  const displayTitle = youtubeVideoData?.snippet?.title || episode.title;
  const displayDuration = youtubeVideoData?.contentDetails?.duration
    ? parseYoutubeDuration(youtubeVideoData.contentDetails.duration)
    : formatDuration(episode.duration);
  const displayUploadDate = youtubeVideoData?.snippet?.publishedAt
    ? formatYoutubeDate(youtubeVideoData.snippet.publishedAt)
    : null;

  return (
    <Link to={`/episode/${episode.slug}`} className="episode__card">
      <div className="episode__card-image">
        <img
          src={imageUrl}
          alt={`${displayTitle} cover`}
          className="episode__card-image-img"
        />
      </div>
      <div className="episode__card-content">
        <h3 className="episode__card-title">{displayTitle}</h3>

        {}
        {loadingYoutubeData && episode.youtubeId && (
          <p className="episode__card-info">Loading YouTube info...</p>
        )}
        {youtubeError && episode.youtubeId && (
          <p className="episode__card-info episode__card-info--error">
            {youtubeError}
          </p>
        )}

        {}
        {episode.episodeNumber && (
          <p className="episode__card-number">
            Episode {episode.episodeNumber}
          </p>
        )}

        {}
        <p className="episode__card-duration">Duration: {displayDuration}</p>

        {}
        {displayUploadDate && (
          <p className="episode__card-date">Uploaded: {displayUploadDate}</p>
        )}

        {}
        <div className="episode__card-platforms">
          {episode.youtubeId && (
            <span className="episode__card-platform episode__card-platform--youtube">
              YouTube
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const parseYoutubeDuration = (iso8601Duration) => {
  if (!iso8601Duration) return "N/A";

  const matches = iso8601Duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return "N/A";

  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);

  let formatted = [];
  if (hours > 0) formatted.push(`${hours}h`);
  if (minutes > 0) formatted.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) formatted.push(`${seconds}s`);

  return formatted.length > 0 ? formatted.join(" ") : "0m";
};

const formatDuration = (durationInMinutes) => {
  if (typeof durationInMinutes !== "number") return durationInMinutes;

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = Math.floor(durationInMinutes % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const formatYoutubeDate = (isoDateString) => {
  if (!isoDateString) return "N/A";
  const date = new Date(isoDateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default EpisodeCard;
