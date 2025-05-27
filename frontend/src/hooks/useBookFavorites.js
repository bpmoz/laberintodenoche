// frontend/src/hooks/useBookFavorites.js
import { useState, useEffect, useContext } from "react";
import api from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentContextUser";

const useBookFavorites = (bookId) => {
  const { isLoggedIn, currentUser } = useContext(CurrentUserContext);

  // We'll manage the favorited status locally
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavoriteStatus, setLoadingFavoriteStatus] = useState(true);
  const [errorFavoriteStatus, setErrorFavoriteStatus] = useState(null);

  // Effect to check if the current book is in the user's favorites
  // This relies on `currentUser.favoriteBooks` being an array of book objects or IDs
  useEffect(() => {
    if (isLoggedIn && currentUser && bookId) {
      setLoadingFavoriteStatus(true);
      setErrorFavoriteStatus(null);
      try {
        // Assuming currentUser.favoriteBooks is an array of book objects or their IDs
        // You might need to adjust this logic based on what your backend returns for currentUser
        const favorited = currentUser.favoriteBooks?.some(
          (favBook) => favBook === bookId || favBook._id === bookId
        );
        setIsFavorited(!!favorited); // Convert to boolean
      } catch (err) {
        console.error("Error checking initial book favorite status:", err);
        setErrorFavoriteStatus("Failed to check favorite status.");
        setIsFavorited(false);
      } finally {
        setLoadingFavoriteStatus(false);
      }
    } else {
      // Not logged in or no bookId/currentUser, so not favorited
      setIsFavorited(false);
      setLoadingFavoriteStatus(false);
      setErrorFavoriteStatus(null);
    }
  }, [isLoggedIn, currentUser, bookId]); // Re-run if login status, currentUser, or bookId changes

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to favorite books.");
      return;
    }

    if (!bookId) {
      console.error("Book ID is missing for favorite toggle.");
      return;
    }

    try {
      const method = isFavorited ? "DELETE" : "POST";
      await api.toggleFavoriteBookStatus(bookId, method); // Use the API method

      // Optimistically update UI
      setIsFavorited(!isFavorited);

      // You might want to also refetch currentUser or update its favoriteBooks array
      // in CurrentUserContext to reflect the change globally, if your context supports it.
      // E.g., if your CurrentUserContext has a function like `refreshCurrentUser()`
      // if (typeof refreshCurrentUser === 'function') {
      //   refreshCurrentUser();
      // }
    } catch (error) {
      console.error("Error toggling book favorite status:", error);
      alert(
        error[0] || "Failed to update book favorite status. Please try again."
      );
      // Revert optimistic update if API call failed
      setIsFavorited(isFavorited);
    }
  };

  return {
    isFavorited,
    loadingFavoriteStatus,
    errorFavoriteStatus,
    handleToggleFavorite,
  };
};

export default useBookFavorites;
