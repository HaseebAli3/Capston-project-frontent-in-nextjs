// components/PostCard.js
export default function PostCard({ post }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h3>@{post.author.username}</h3>
      <p>{post.content}</p>

      {post.image && (
        <img
          src={`http://127.0.0.1:8000${post.image}`}
          alt="Post"
          style={{ maxWidth: "100%", marginTop: "0.5rem" }}
        />
      )}

      <div style={{ marginTop: "0.5rem", fontSize: "14px" }}>
        <span>❤️ {post.likes.length} Likes</span> | <span>💬 {post.comments.length} Comments</span>
      </div>
    </div>
  );
}
