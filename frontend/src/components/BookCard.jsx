import React from "react";
import { Link } from "react-router-dom";
import useBookFavorites from "../hooks/useBookFavorites";

const DEFAULT_BOOK_COVER = "/path/to/your/default_book_cover.png";

const BookCard = ({ book }) => {
  const { isFavorited, loadingFavoriteStatus, handleToggleFavorite } =
    useBookFavorites(book._id);

  const imageUrl = book.coverImagePath
    ? `${import.meta.env.VITE_API_URL}/${book.coverImagePath}`
    : DEFAULT_BOOK_COVER;

  return (
    <div className="book-card">
      <div className="book-card__image-container">
        {book.coverImagePath ? (
          <img
            src={imageUrl}
            alt={`${book.title} cover`}
            className="book-card__image"
          />
        ) : (
          <div className="book-card__placeholder-image">
            No hay cover del libro
          </div>
        )}
      </div>
      <div className="book-card__content">
        <h4 className="book-card__title">{book.title}</h4>
        <p className="book-card__author"> {book.author}</p>
        <button
          className={`book-card__favorite-button ${
            isFavorited ? "book-card__favorite-button--active" : ""
          }`}
          onClick={handleToggleFavorite}
          disabled={loadingFavoriteStatus}
        >
          {loadingFavoriteStatus
            ? "..."
            : isFavorited
            ? "❤️ Favorito"
            : "🤍 Favorito"}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
