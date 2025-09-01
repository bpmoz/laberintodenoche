import React from "react";
import { Link } from "react-router-dom";

const CommentSection = ({
  comments,
  newComment,
  setNewComment,
  submittingComment,
  loadingComments,
  hasMoreComments,
  handleCommentSubmit,
  loadMoreComments,
  commentPage,
  isLoggedIn,
}) => {
  return (
    <div className="episode__comments-section">
      <h3 className="episode__comments-title">
        Comentarios ({comments.length})
      </h3>

      {isLoggedIn ? (
        <form className="episode__comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            className="episode__comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte tus pensamientos..."
            rows={3}
            required
          />
          <button
            className="episode__comment-submit"
            type="submit"
            disabled={submittingComment || !newComment.trim()}
          >
            {submittingComment ? "Posteando" : "Postear Comentario"}
          </button>
        </form>
      ) : (
        <div className="episode__auth-prompt">
          <Link to="/login">Unite al laberinto</Link> para comentar
        </div>
      )}

      <div className="episode__comments-list">
        {loadingComments && commentPage === 1 ? (
          <p>Cargando comentarios...</p>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment._id} className="episode__comment">
                <div className="episode__comment-header">
                  <span className="episode__comment-author">
                    {comment.user
                      ? comment.user.username
                      : "Usuario Desconocido"}
                  </span>
                  <span className="episode__comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="episode__comment-content">{comment.content}</p>
              </div>
            ))}

            {hasMoreComments && (
              <button
                className="episode__load-more-comments"
                onClick={loadMoreComments}
                disabled={loadingComments}
              >
                {loadingComments ? "Cargando" : "Cargar más comentarios"}
              </button>
            )}
          </>
        ) : (
          <p className="episode__no-comments">
            Sin comentarios aún. Sé el primero en comentar.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
