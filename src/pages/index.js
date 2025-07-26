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
  const router = useRouter();

  const isAuthenticated =
    typeof window !== "undefined" && localStorage.getItem("token");

  // ✅ Fetch all posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await api.get("posts/");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signup");
    } else {
      fetchPosts();
    }
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signup");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Head>
        <title>Social Feed | Share Your Thoughts</title>
        <meta
          name="description"
          content="Connect with others through posts and comments"
        />
      </Head>

      {/* ✅ Header */}
      <header className="w-full bg-white shadow sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Community Feed
          </h1>
          <div className="flex gap-3">
            <Link
              href="/create-post"
              className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Post
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-md text-white bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ✅ Main Content */}
      <main className="flex-grow w-full">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-xl mx-auto">
              <p>{error}</p>
              <button
                onClick={fetchPosts}
                className="mt-2 underline text-sm hover:text-red-600"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                No posts yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating your first post.
              </p>
              <div className="mt-6">
                <Link
                  href="/create-post"
                  className="inline-block px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
        </div>
      </main>
    </div>
  );
}
