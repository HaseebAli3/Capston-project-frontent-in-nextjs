import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "../utils/api";

const PostCard = ({ post }) => {
  const [visibleComments, setVisibleComments] = useState(2);
  const [expanded, setExpanded] = useState(false);

  // Safely format user information
  const formatUser = (user) => {
    if (!user) return "Unknown";
    if (typeof user === "string") return user;
    if (typeof user === "object") return user.username || user.name || "Unknown";
    return "Unknown";
  };

  // Safely get and format comments
  const comments = Array.isArray(post?.comments) 
    ? post.comments.map(comment => ({
        id: comment?.id || Math.random().toString(36).substring(2, 9),
        author: formatUser(comment?.user || comment?.author),
        content: comment?.content || comment?.text || "[No content]",
        date: comment?.createdAt ? new Date(comment.createdAt) : new Date()
      }))
    : [];

  const toggleComments = () => {
    setExpanded(!expanded);
    setVisibleComments(expanded ? 2 : comments.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{post?.title || "Untitled Post"}</h3>
        <p className="text-gray-600 mb-4">{post?.content || post?.body || ""}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>Posted by {formatUser(post?.user || post?.author)}</span>
          <span className="mx-2">•</span>
          <span>
            {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Unknown date"}
          </span>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-2">
            Comments ({comments.length})
          </h4>
          
          <div className="space-y-3 mb-3">
            {comments.slice(0, visibleComments).map((comment) => (
              <div key={comment.id} className="text-sm">
                <div className="font-medium text-gray-800">{comment.author}</div>
                <p className="text-gray-600">{comment.content}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {comment.date.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {comments.length > 2 && (
            <button
              onClick={toggleComments}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {expanded ? 'Show less' : `View all ${comments.length} comments`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
      
      // Format posts data with proper user handling
      const formattedPosts = response.data.map(post => ({
        id: post?.id || Math.random().toString(36).substring(2, 9),
        title: post?.title || "Untitled Post",
        content: post?.content || post?.body || "",
        user: post?.user, // Keep user object as is
        author: post?.author, // Keep for backward compatibility
        createdAt: post?.createdAt,
        comments: Array.isArray(post?.comments) ? post.comments : []
      }));
      
      setPosts(formattedPosts);
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