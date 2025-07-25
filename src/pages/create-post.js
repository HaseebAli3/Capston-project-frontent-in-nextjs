import { useState } from "react";
import { useRouter } from "next/router";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    console.log(token)

    if (!token) {
      alert("You're not logged in.");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // ✅ Make sure this is correct
        },
        body: formData,
      });

      if (res.status === 201) {
        alert("Post created!");
        router.push("/");
      } else {
        const err = await res.json();
        console.error(err);
        alert("Post failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting post.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        /><br /><br />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
