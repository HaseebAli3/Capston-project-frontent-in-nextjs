import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "../utils/api";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    if (!token) {
      router.push("/signup");
    } else {
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("posts/");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signup");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Community Feed</h1>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head>
        <title>Community Feed | Share Your Thoughts</title>
        <meta
          name="description"
          content="Join the community and share your thoughts through posts and discussions."
        />
      </Head>

      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Community Feed</h1>
          <div className="flex gap-3">
            <Link
              href="/create-post"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Create Post
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md text-center max-w-md mx-auto">
            <p>{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-3 text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No posts yet
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Start by creating your first post.
            </p>
            <div className="mt-6">
              <Link
                href="/create-post"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Create Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}