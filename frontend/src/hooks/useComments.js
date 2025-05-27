// frontend/src/hooks/useComments.js
import { useState, useEffect, useContext, useCallback } from "react";
import api from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentContextUser";

const useComments = (episodeId) => {
  const { isLoggedIn } = useContext(CurrentUserContext);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentPage, setCommentPage] = useState(1);

  // Use useCallback to memoize fetchComments to prevent unnecessary re-renders in useEffect
  const fetchComments = useCallback(
    async (page = 1) => {
      if (!episodeId) return; // Don't fetch if no episode ID

      setLoadingComments(true);
      try {
        const data = await api.getComments(episodeId, page, 10); // Use API method

        if (page === 1) {
          setComments(data.comments); // Replace all comments for first page
        } else {
          setComments((prevComments) => [...prevComments, ...data.comments]); // Append for subsequent pages
        }

        setHasMoreComments(
          data.pagination.currentPage < data.pagination.totalPages
        );
        setCommentPage(data.pagination.currentPage);
      } catch (error) {
        console.error("Error fetching comments:", error);
        // You might want to set an error state here too
      } finally {
        setLoadingComments(false);
      }
    },
    [episodeId]
  ); // Dependency on episodeId

  // Effect to load comments when episodeId changes or on initial mount
  useEffect(() => {
    if (episodeId) {
      setComments([]); // Clear comments when episodeId changes
      setCommentPage(1); // Reset page
      setHasMoreComments(true); // Assume more comments initially
      fetchComments(1); // Fetch first page
    }
  }, [episodeId, fetchComments]);

  const loadMoreComments = () => {
    if (hasMoreComments && !loadingComments) {
      fetchComments(commentPage + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;
    if (!episodeId) {
      console.error("Episode ID not available for commenting.");
      return;
    }

    setSubmittingComment(true);

    try {
      const newCommentData = await api.postComment(episodeId, newComment); // Use API method

      setComments((prevComments) => [newCommentData, ...prevComments]); // Add new comment to the top
      setNewComment(""); // Clear input field
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error[0] || "Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    submittingComment,
    loadingComments,
    hasMoreComments,
    handleCommentSubmit,
    loadMoreComments,
  };
};

export default useComments;
