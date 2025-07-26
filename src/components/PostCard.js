// components/PostCard.js
import { useState } from "react";
import api from "@/utils/api";

export default function PostCard({ post }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    try {
      await api.post("likes/", {
        post: post.id,
      });
      setLiked(true);
      setLikes((prev) => prev + 1);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setIsCommenting(true);
      const res = await api.post("comments/", {
        post: post.id,
        content: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
          {post.image && (
  <img
    src={post.image}
    alt="Post"
    className="mt-3 w-full h-64 object-cover rounded-md"
  />
)}
          <span className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <p className="mt-2 text-gray-700">{post.content}</p>
        
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <span>Posted by </span>
          <span className="ml-1 font-medium text-gray-600">
            {post.author?.username}
          </span>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
              liked ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            👍 Like ({likes})
          </button>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Write a comment..."
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || isCommenting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCommenting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Comments:</h4>
            {comments.map((c) => (
              <div key={c.id} className="bg-white p-3 rounded-md shadow-xs border border-gray-100">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-800">
                    {c.user?.username}
                  </span>
                  <span className="mx-1 text-gray-400">·</span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}