import React from "react";
import EpisodeCard from "../components/Episodecard";

const EpisodeGrid = ({ episodes }) => {
  return (
    <div className="podcast__grid-container">
      <div className="podcast__grid">
        {episodes.map((episode) => {
          return <EpisodeCard key={episode._id} episode={episode} />;
        })}
      </div>
    </div>
  );
};

export default EpisodeGrid;
