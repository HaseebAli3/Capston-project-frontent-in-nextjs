// components/PostCard.js
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function PostCard({ post }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);

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
    try {
      const res = await api.post("comments/", {
        post: post.id,
        content: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  return (
    <div className="border rounded-md p-4 my-4">
      <h2 className="font-bold">{post.title}</h2>
      <p>{post.content}</p>
      <p className="text-sm text-gray-500">By: {post.author?.username}</p>

      <div className="mt-2">
        <button
          className={`px-2 py-1 text-sm border rounded ${
            liked ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={handleLike}
          disabled={liked}
        >
          👍 Like ({likes})
        </button>
      </div>

      <div className="mt-4">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="border px-2 py-1 w-full rounded"
          placeholder="Write a comment..."
        />
        <button
          onClick={handleComment}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          Post Comment
        </button>

        <div className="mt-4">
          <h4 className="font-semibold">Comments:</h4>
          {comments.map((c) => (
            <div key={c.id} className="border-t py-1 text-sm">
              <strong>{c.user?.username}:</strong> {c.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
