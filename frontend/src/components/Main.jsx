import React, { useState, useEffect, useRef } from "react";
import InputComponent from "./Input";
import EpisodeGrid from "./Episodegrid";
import api from "../utils/Api";

const MainComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const episodesPerPage = 10;

  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoading(true);

    debounceTimeoutRef.current = setTimeout(() => {
      api
        .getEpisodes(searchTerm, currentPage, episodesPerPage)
        .then((data) => {
          console.log("Fetched Episodes Data:", data);
          setEpisodes(data.episodes);
          setPagination(data.pagination);
        })
        .catch((error) => {
          console.error("Error fetching episodes (Frontend):", error);
          setEpisodes([]);
          setPagination(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="main__container">
      <InputComponent
        type="text"
        placeholder="Buscar episodio por título, descripción, tags, libro o autor..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="custom__input-search"
      />

      <h2>Todos los episodios</h2>

      {}
      {loading ? (
        <p className="message">Cargando episodios...</p>
      ) : episodes.length === 0 && searchTerm ? (
        <p className="message">No se encontraron episodios para tu búsqueda.</p>
      ) : episodes.length === 0 && !searchTerm ? (
        <p className="message">No hay episodios disponibles en este momento.</p>
      ) : (
        <EpisodeGrid episodes={episodes} />
      )}

      {}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MainComponent;
