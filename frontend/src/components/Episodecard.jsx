import React from "react";
import { Link } from "react-router-dom";

const EpisodeCard = ({ episode }) => {
  if (!episode) {
    return <div className="episode__card--loading">Loading...</div>;
  }

  const imageUrl = `http://localhost:3002/${episode.imagePath}`;

  return (
    <Link to={`/episode/${episode._id}`} className="episode__card">
      <div className="episode__card-image">
        <img
          src={imageUrl}
          alt={`${episode.title} cover`}
          className="episode__card-image-img"
        />
      </div>
      <div className="episode__card-content">
        <h3 className="episode__card-title">{episode.title}</h3>
        <p className="episode__card-number">Episode {episode.episodeNumber}</p>
        <p className="episode__card-duration">Duration: {episode.duration}</p>
      </div>
    </Link>
  );
};

export default EpisodeCard;
