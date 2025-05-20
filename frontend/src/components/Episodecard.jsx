import React from "react";
import { Link } from "react-router-dom";

const EpisodeCard = ({ episode }) => {
  if (!episode) {
    return <div className="episode__card--loading">Loading...</div>;
  }

  const imageUrl = `http://localhost:3002/${episode.imagePath}`;

  return (
    <Link to={`/episode/${episode.slug}`} className="episode__card">
      <div className="episode__card-image">
        <img
          src={imageUrl}
          alt={`${episode.title} cover`}
          className="episode__card-image-img"
        />
      </div>
      <div className="episode__card-content">
        <h3 className="episode__card-title">{episode.title}</h3>
        {episode.episodeNumber && (
          <p className="episode__card-number">
            Episode {episode.episodeNumber}
          </p>
        )}
        <p className="episode__card-duration">
          Duration: {formatDuration(episode.duration)}
        </p>

        {/* Visual indicators for available platforms */}
        <div className="episode__card-platforms">
          {episode.spotifyId && (
            <span className="episode__card-platform episode__card-platform--spotify">
              Spotify
            </span>
          )}
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

// Helper function to format duration (assuming duration is in minutes)
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

export default EpisodeCard;
