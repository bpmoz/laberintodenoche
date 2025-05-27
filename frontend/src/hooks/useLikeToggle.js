// frontend/src/hooks/useLikeToggle.js
import { useState, useEffect, useContext } from "react";
import api from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentContextUser";

const useLikeToggle = (episodeId, initialIsLiked, initialLikeCount) => {
  const { isLoggedIn } = useContext(CurrentUserContext);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Sync initial state if it changes externally (e.g., from async data fetch)
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(initialLikeCount);
  }, [initialIsLiked, initialLikeCount]);

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to like this episode");
      return;
    }

    if (!episodeId) {
      console.error("Episode ID not available for liking.");
      return;
    }

    try {
      const method = isLiked ? "DELETE" : "POST";
      const data = await api.toggleLikeStatus(episodeId, method); // Use the API method

      setIsLiked(!isLiked);
      setLikeCount(data.count);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Assuming error is an array from your Api.request, get the first message
      alert(error[0] || "Failed to update like status. Please try again.");
    }
  };

  return { isLiked, likeCount, handleLikeToggle };
};

export default useLikeToggle;
