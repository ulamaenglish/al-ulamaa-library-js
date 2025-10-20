"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Audiobook {
  id: string;
  title: string;
  author: string;
  category: string;
  duration: string;
  premium: boolean;
  created_at: string;
}

export default function ManageAudiobooksPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchAudiobooks();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError("");
        fetchAudiobooks();
      } else {
        setAuthError("❌ Invalid password!");
        setPassword("");
      }
    } catch (error) {
      setAuthError("❌ Authentication failed!");
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setPassword("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchAudiobooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audiobooks/list");
      const data = await response.json();
      setAudiobooks(data.audiobooks || []);
    } catch (error) {
      console.error("Error fetching audiobooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone and will remove:\n- The audiobook\n- All audio files\n- All chapters\n- All voice recordings`
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      console.log(`Deleting audiobook: ${id}`);

      const response = await fetch(`/api/audiobooks/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete audiobook");
      }

      console.log("✅ Audiobook deleted successfully");
      alert("✅ Audiobook deleted successfully!");

      // Remove from local state
      setAudiobooks((prev) => prev.filter((book) => book.id !== id));
    } catch (error: any) {
      console.error("Error deleting audiobook:", error);
      alert(`❌ Failed to delete audiobook: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "20px",
            padding: "50px",
            maxWidth: "450px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "15px",
            }}
          >
            Admin Access Required
          </h1>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "1.1rem",
              marginBottom: "30px",
            }}
          >
            Enter admin password to continue
          </p>
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: "100%",
                padding: "15px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "2px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "12px",
                color: "white",
                fontSize: "1.1rem",
                outline: "none",
                marginBottom: "20px",
                textAlign: "center",
              }}
            />
            {authError && (
              <div
                style={{
                  color: "#ef4444",
                  marginBottom: "20px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                }}
              >
                {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #19547b, #ffd89b)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255, 216, 155, 0.3)",
                marginBottom: "15px",
              }}
            >
              🔓 Login
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                color: "#93c5fd",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              ← Back to Home
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <Link
              href="/admin/audiobooks"
              style={{
                color: "#ffd89b",
                textDecoration: "none",
                fontSize: "1rem",
              }}
            >
              ← Back to Upload
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "10px",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🚪 Logout
            </button>
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "15px",
            }}
          >
            🗂️ Manage Audiobooks
          </h1>
          <p style={{ color: "#d0d0d0", fontSize: "1.1rem" }}>
            View and delete audiobooks from your library
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid rgba(255, 216, 155, 0.2)",
                borderTop: "4px solid #ffd89b",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "#d0d0d0", fontSize: "1.1rem" }}>
              Loading audiobooks...
            </p>
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}

        {!loading && audiobooks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📚</div>
            <h2
              style={{
                color: "#d0d0d0",
                fontSize: "1.5rem",
                marginBottom: "15px",
              }}
            >
              No Audiobooks Yet
            </h2>
            <p style={{ color: "#999", marginBottom: "30px" }}>
              Upload your first audiobook to get started
            </p>
            <Link
              href="/admin/audiobooks"
              style={{
                display: "inline-block",
                padding: "15px 30px",
                background: "linear-gradient(135deg, #19547b, #ffd89b)",
                borderRadius: "12px",
                color: "white",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Upload Audiobook
            </Link>
          </div>
        )}

        {!loading && audiobooks.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "25px",
            }}
          >
            {audiobooks.map((book) => (
              <div
                key={book.id}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  padding: "25px",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <h3
                    style={{
                      color: "#ffd89b",
                      fontSize: "1.3rem",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    style={{
                      color: "#93c5fd",
                      fontSize: "0.95rem",
                      marginBottom: "8px",
                    }}
                  >
                    by {book.author}
                  </p>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "rgba(147, 197, 253, 0.2)",
                        borderRadius: "6px",
                        color: "#93c5fd",
                        fontSize: "0.8rem",
                      }}
                    >
                      {book.category}
                    </span>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "rgba(134, 239, 172, 0.2)",
                        borderRadius: "6px",
                        color: "#86efac",
                        fontSize: "0.8rem",
                      }}
                    >
                      {book.duration}
                    </span>
                    {book.premium && (
                      <span
                        style={{
                          padding: "4px 10px",
                          background: "rgba(255, 216, 155, 0.2)",
                          borderRadius: "6px",
                          color: "#ffd89b",
                          fontSize: "0.8rem",
                        }}
                      >
                        ⭐ Premium
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href={`/audiobooks/${book.id}`}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "rgba(147, 197, 253, 0.2)",
                      border: "1px solid rgba(147, 197, 253, 0.3)",
                      borderRadius: "8px",
                      color: "#93c5fd",
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    👁️ View
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background:
                        deleting === book.id
                          ? "rgba(100, 100, 100, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                      border:
                        deleting === book.id
                          ? "1px solid rgba(100, 100, 100, 0.3)"
                          : "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      color: deleting === book.id ? "#999" : "#ef4444",
                      cursor: deleting === book.id ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    {deleting === book.id ? "⏳ Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
