import { useState, useEffect } from "react";
import api from "../utils/api";

export default function PostCard({ post }) {
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if the user has already liked the post
  useEffect(() => {
    const checkUserLike = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.get(`/likes/?post=${post.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userLikes = response.data;
          setHasLiked(userLikes.some((like) => like.user === post.current_user_id));
        }
      } catch (err) {
        console.error("Error checking likes:", err);
      }
    };
    checkUserLike();
  }, [post.id, post.current_user_id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          `/comments/`,
          { post: post.id, content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments([...comments, response.data]);
        setNewComment("");
      } catch (err) {
        console.error("Error posting comment:", err);
      }
    }
  };

  const handleLike = async () => {
    if (!hasLiked) {
      try {
        const token = localStorage.getItem("token");
        await api.post(
          `/likes/`,
          { post: post.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHasLiked(true);
        setLikeCount(likeCount + 1);
      } catch (err) {
        console.error("Error liking post:", err);
      }
    }
  };

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    if (!post.image || isDownloading) return;

    setIsDownloading(true);
    try {
      // Fetch the image
      const response = await fetch(post.image);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      // Get the blob data
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = post.image.split('/').pop() || 'download.jpg';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open image in new tab
      window.open(post.image, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl mx-auto">
      {/* Caption/Content */}
      <p className="text-gray-800 text-base mb-4">{post.content || "Untitled Post"}</p>

      {/* Image */}
      {post.image && (
        <div className="relative">
          <img
            src={post.image}
            alt="Post"
            className="w-full h-auto rounded-md mb-4 object-cover cursor-zoom-in"
            onClick={() => setShowImageModal(true)}
          />
          <div 
            className="absolute bottom-6 right-4 bg-black bg-opacity-50 text-white p-1 rounded-md cursor-pointer hover:bg-opacity-70 transition-opacity"
            onClick={handleDownload}
          >
            {isDownloading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Author */}
      <p className="text-sm text-gray-600 mb-4">
        Posted by <span className="font-semibold">{post.author?.username || "Unknown User"}</span> on{" "}
        {new Date(post.created_at).toLocaleDateString()}
      </p>

      {/* Like and Comment Buttons */}
      <div className="flex gap-4 border-t pt-3">
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-1 text-sm ${
            hasLiked ? "text-gray-400" : "text-blue-600 hover:text-blue-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Like ({likeCount})
        </button>
        <button
          onClick={() => setShowCommentPopup(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Comment ({comments.length})
        </button>
      </div>

      {/* Comment Popup */}
      {showCommentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Popup Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
              <button
                onClick={() => setShowCommentPopup(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="text-sm text-gray-600 border-b pb-2">
                    <p className="font-semibold">{comment.user?.username || "Unknown User"}</p>
                    <p>{comment.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">No comments yet.</p>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && post.image && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={post.image}
              alt="Post"
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                title="Download"
              >
                {isDownloading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}