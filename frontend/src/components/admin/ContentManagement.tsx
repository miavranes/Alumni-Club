import React, { useState, useEffect } from "react";
import EventList from "../../pages/EventList";

interface Post {
  id: number;
  title: string;
  short_desc: string;
  content: string;
  category: string;
  read_time?: string | null;
  created_at: string;
  image_url?: string;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  _count?: {
    comments: number;
    post_likes: number;
  };
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "events">(
    "pending"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const token = localStorage.getItem("token");

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingPosts();
    } else if (activeTab === "approved") {
      loadApprovedPosts();
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    // Reset page when switching tabs
    setCurrentPage(1);
  }, [activeTab]);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/posts/pending`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message || "Neuspešno učitavanje objava.");
        return;
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Greška prilikom učitavanja objava:", error);
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/api/posts?page=${currentPage}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message || "Neuspešno učitavanje objava.");
        return;
      }

      const data = await res.json();

      // Check if data has pagination structure
      if (data.posts && data.pagination) {
        setPosts(data.posts);
        setTotalPages(data.pagination.pages);
        setTotalPosts(data.pagination.total);
      } else {
        // Fallback for simple array response
        setPosts(data);
        setTotalPages(1);
        setTotalPosts(data.length);
      }
    } catch (error) {
      console.error("Greška prilikom učitavanja objava:", error);
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: number) => {
    if (!window.confirm("Da li ste sigurni da želite odobriti ovu objavu?"))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.message || "Neuspješno odobravanje objave.");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error(error);
      alert("Došlo je do greške prilikom odobravanja objave.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("Da li ste sigurni da želite obrisati ovu objavu?"))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.message || "Neuspješno brisanje objave.");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error(error);
      alert("Došlo je do greške prilikom brisanja objave.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Upravljanje sadržajem
      </h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-[#294a70] text-[#294a70]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Objave na čekanju
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "approved"
                ? "border-[#294a70] text-[#294a70]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Odobrene objave
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "events"
                ? "border-[#294a70] text-[#294a70]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Događaji
          </button>
        </nav>
      </div>

      {/* PENDING POSTS TAB */}
      {activeTab === "pending" && (
        <>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#294a70] mx-auto"></div>
              <p className="mt-4 text-gray-600">Učitavanje objava...</p>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-600">Trenutno nema objava na čekanju.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#294a70] text-lg">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Autor: {post.users.first_name} {post.users.last_name}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Odobri
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* APPROVED POSTS TAB */}
      {activeTab === "approved" && (
        <>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#294a70] mx-auto"></div>
              <p className="mt-4 text-gray-600">Učitavanje objava...</p>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-600">Trenutno nema odobrenih objava.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#294a70] text-lg">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Autor: {post.users.first_name} {post.users.last_name}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION FOR APPROVED POSTS */}
          {activeTab === "approved" && !loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Prikazano {((currentPage - 1) * 10) + 1}-
                {Math.min(currentPage * 10, totalPosts)} od {totalPosts} objava
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#294a70] text-white hover:bg-[#1e3a5f]"
                  }`}
                >
                  ← Prethodna
                </button>

                <span className="px-3 py-1 text-sm text-gray-600">
                  Strana {currentPage} od {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#294a70] text-white hover:bg-[#1e3a5f]"
                  }`}
                >
                  Sledeća →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* EVENTS TAB */}
      {activeTab === "events" && <EventList />}
    </div>
  );
}
