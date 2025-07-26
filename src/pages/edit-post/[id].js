import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import Head from "next/head";

export default function EditPost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      api.get(`posts/${id}/`)
        .then(res => {
          setContent(res.data.content);
          setPreview(res.data.image);
        })
        .catch(() => setError("Failed to load post"));
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await api.put(`posts/${id}/`, formData);
      router.push("/");
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Edit Post | Social Feed</title>
      </Head>

      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Post</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded shadow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            className="w-full border px-3 py-2 rounded"
          />

          {preview && !image && (
            <img src={`http://127.0.0.1:8000${preview}`} className="w-full h-40 object-cover rounded" alt="Current" />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
