// ========================================
// MY LIBRARY PAGE - MOBILE RESPONSIVE
// app/my-library/page.tsx
// ========================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUserLibrary,
  getLibraryStats,
  removeFromLibrary,
  toggleFavorite,
  LibraryItem,
} from "@/lib/libraryHelper";

type FilterType = "all" | "favorites" | "in-progress" | "completed";

export default function MyLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    inProgress: 0,
    completed: 0,
  });
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    loadLibrary(userData.email);
    loadStats(userData.email);
  }, [filter, router]);

  const loadLibrary = async (email: string) => {
    setLoading(true);
    const result = await getUserLibrary(email, filter);
    if (result.success) {
      setLibrary(result.data);
    }
    setLoading(false);
  };

  const loadStats = async (email: string) => {
    const result = await getLibraryStats(email);
    if (result.success) {
      setStats(result.stats);
    }
  };

  const handleRemove = async (audiobookId: string) => {
    if (!confirm("Remove this audiobook from your library?")) return;

    const result = await removeFromLibrary(user.email, audiobookId);
    if (result.success) {
      loadLibrary(user.email);
      loadStats(user.email);
    } else {
      alert("Failed to remove audiobook");
    }
  };

  const handleToggleFavorite = async (
    audiobookId: string,
    currentStatus: boolean
  ) => {
    const result = await toggleFavorite(
      user.email,
      audiobookId,
      !currentStatus
    );
    if (result.success) {
      loadLibrary(user.email);
      loadStats(user.email);
    }
  };

  const getProgressPercentage = (item: LibraryItem): number => {
    if (!item.total_seconds || item.total_seconds === 0) return 0;
    return Math.round(
      (Number(item.progress_seconds) / Number(item.total_seconds)) * 100
    );
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "clamp(20px, 4vw, 60px) clamp(15px, 4vw, 20px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(25px, 5vw, 40px)" }}>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "10px",
              lineHeight: "1.2",
            }}
          >
            📚 My Library
          </h1>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
            }}
          >
            Your saved audiobooks and listening progress
          </p>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "clamp(12px, 3vw, 20px)",
            marginBottom: "clamp(25px, 5vw, 40px)",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "clamp(15px, 3vw, 20px)",
              borderRadius: "15px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                marginBottom: "8px",
              }}
            >
              📖
            </div>
            <div
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
              }}
            >
              Total
            </div>
            <div
              style={{
                color: "white",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
              }}
            >
              {stats.total}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 216, 155, 0.1)",
              padding: "clamp(15px, 3vw, 20px)",
              borderRadius: "15px",
              border: "1px solid rgba(255, 216, 155, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                marginBottom: "8px",
              }}
            >
              ❤️
            </div>
            <div
              style={{
                color: "#ffd89b",
                fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
              }}
            >
              Favorites
            </div>
            <div
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
              }}
            >
              {stats.favorites}
            </div>
          </div>

          <div
            style={{
              background: "rgba(147, 197, 253, 0.1)",
              padding: "clamp(15px, 3vw, 20px)",
              borderRadius: "15px",
              border: "1px solid rgba(147, 197, 253, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                marginBottom: "8px",
              }}
            >
              ▶️
            </div>
            <div
              style={{
                color: "#93c5fd",
                fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
              }}
            >
              In Progress
            </div>
            <div
              style={{
                color: "#93c5fd",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
              }}
            >
              {stats.inProgress}
            </div>
          </div>

          <div
            style={{
              background: "rgba(134, 239, 172, 0.1)",
              padding: "clamp(15px, 3vw, 20px)",
              borderRadius: "15px",
              border: "1px solid rgba(134, 239, 172, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                marginBottom: "8px",
              }}
            >
              ✅
            </div>
            <div
              style={{
                color: "#86efac",
                fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
              }}
            >
              Completed
            </div>
            <div
              style={{
                color: "#86efac",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
              }}
            >
              {stats.completed}
            </div>
          </div>
        </div>

        {/* Filter Tabs - Mobile Optimized */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "8px",
            marginBottom: "clamp(20px, 4vw, 30px)",
          }}
        >
          {(
            [
              { key: "all", label: "All", icon: "📚" },
              { key: "favorites", label: "Favorites", icon: "❤️" },
              { key: "in-progress", label: "In Progress", icon: "▶️" },
              { key: "completed", label: "Completed", icon: "✅" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              style={{
                padding: "clamp(10px, 2vw, 12px) clamp(8px, 2vw, 16px)",
                background:
                  filter === tab.key
                    ? "rgba(255, 216, 155, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  filter === tab.key
                    ? "1px solid rgba(255, 216, 155, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                color: filter === tab.key ? "#ffd89b" : "#d0d0d0",
                cursor: "pointer",
                fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                fontWeight: "600",
                transition: "all 0.3s",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ marginRight: "4px" }}>{tab.icon}</span>
              <span className="filter-text">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Library Grid - Mobile Optimized */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "white",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "20px" }}>📚</div>
            <div>Loading your library...</div>
          </div>
        ) : library.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "clamp(40px, 8vw, 60px) clamp(20px, 4vw, 40px)",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 6vw, 3rem)",
                marginBottom: "20px",
              }}
            >
              📚
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                marginBottom: "10px",
              }}
            >
              Your library is empty
            </h3>
            <p
              style={{
                color: "#d0d0d0",
                marginBottom: "30px",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              }}
            >
              Start adding audiobooks to build your collection
            </p>
            <Link
              href="/audiobooks"
              style={{
                display: "inline-block",
                padding: "12px 30px",
                background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                borderRadius: "10px",
                color: "white",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              }}
            >
              Browse Audiobooks
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "clamp(15px, 3vw, 25px)",
            }}
          >
            {library.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "15px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "clamp(15px, 3vw, 20px)",
                  transition: "all 0.3s",
                  position: "relative",
                }}
              >
                {/* Favorite Button */}
                <button
                  onClick={() =>
                    handleToggleFavorite(item.audiobook_id, item.is_favorite)
                  }
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s",
                  }}
                >
                  {item.is_favorite ? "❤️" : "🤍"}
                </button>

                <h3
                  style={{
                    color: "white",
                    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                    marginBottom: "10px",
                    paddingRight: "40px",
                    lineHeight: "1.3",
                  }}
                >
                  {item.audiobook?.title || "Untitled"}
                </h3>

                {/* Progress Bar */}
                {item.progress_seconds > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <span style={{ color: "#d0d0d0", fontSize: "0.85rem" }}>
                        Progress
                      </span>
                      <span style={{ color: "#ffd89b", fontSize: "0.85rem" }}>
                        {getProgressPercentage(item)}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${getProgressPercentage(item)}%`,
                          height: "100%",
                          background:
                            "linear-gradient(90deg, #ffd89b, #f59e0b)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Completion Badge */}
                {item.completed && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      background: "rgba(134, 239, 172, 0.2)",
                      border: "1px solid rgba(134, 239, 172, 0.4)",
                      borderRadius: "20px",
                      color: "#86efac",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      marginBottom: "15px",
                    }}
                  >
                    ✅ Completed
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <Link
                    href={`/audiobooks/${item.audiobook_id}`}
                    style={{
                      flex: 1,
                      padding: "clamp(8px, 2vw, 10px)",
                      background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                      borderRadius: "8px",
                      color: "white",
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
                      fontWeight: "600",
                    }}
                  >
                    {item.progress_seconds > 0 ? "▶️ Continue" : "▶️ Play"}
                  </Link>
                  <button
                    onClick={() => handleRemove(item.audiobook_id)}
                    style={{
                      padding: "clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)",
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: "8px",
                      color: "#fca5a5",
                      cursor: "pointer",
                      fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 480px) {
          .filter-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
