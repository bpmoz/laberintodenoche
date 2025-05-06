import React, { useState, useEffect } from "react";
import InputComponent from "./Input";
import EpisodeGrid from "./Episodegrid";
import api from "../utils/Api";

const MainComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    api
      .getEpisodes()
      .then((data) => {
        console.log("Episodes Data:", data);
        setEpisodes(data.episodes);
      })
      .catch((error) => console.error("Error fetching episodes:", error));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEpisodes = episodes.filter((episode) =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main__container">
      <InputComponent
        type="text"
        placeholder="Buscar episodio por libro o autor..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="custom__input-search"
      />

      <h2>Latest Episodes</h2>
      <EpisodeGrid episodes={filteredEpisodes} />
    </div>
  );
};

export default MainComponent;
