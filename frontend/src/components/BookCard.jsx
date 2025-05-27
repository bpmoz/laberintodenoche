// frontend/src/components/BookCard.jsx
import React from "react";
import { Link } from "react-router-dom"; // Assuming you might want to link to a book detail page later
import useBookFavorites from "../hooks/useBookFavorites"; // Import the hook

// Consider adding some default image if book.coverImagePath is missing
const DEFAULT_BOOK_COVER = "/path/to/your/default_book_cover.png"; // Make sure this path is correct

const BookCard = ({ book }) => {
  // Use the custom hook for each book.
  // The hook itself uses CurrentUserContext, so we don't need to pass isLoggedIn/currentUser here.
  const { isFavorited, loadingFavoriteStatus, handleToggleFavorite } =
    useBookFavorites(book._id);

  // Construct the image URL. Ensure your VITE_API_URL is correctly set.
  const imageUrl = book.coverImagePath
    ? `${import.meta.env.VITE_API_URL}/${book.coverImagePath}`
    : DEFAULT_BOOK_COVER; // Use a default if no cover image is provided

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
          <div className="book-card__placeholder-image">No Cover Available</div>
        )}
      </div>
      <div className="book-card__content">
        <h4 className="book-card__title">{book.title}</h4>
        <p className="book-card__author">by {book.author}</p>
        <button
          className={`book-card__favorite-button ${
            isFavorited ? "book-card__favorite-button--active" : ""
          }`}
          onClick={handleToggleFavorite}
          disabled={loadingFavoriteStatus} // Disable while checking status or toggling
        >
          {loadingFavoriteStatus
            ? "..."
            : isFavorited
            ? "❤️ Favorited"
            : "🤍 Favorite"}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
