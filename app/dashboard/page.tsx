"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUserStats,
  getSavedQuotes,
  getNotes,
  getReadingHistory,
  deleteQuote,
  deleteNote,
  getFavorites,
  getListeningHistory,
  getUserBadges,
  getMonthlyListeningReport,
} from "@/lib/database";
import Particles from "@/components/Particles";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    saved_quotes: 0,
    notes: 0,
    quotes_read: 0,
    current_streak_days: 0,
    total_listening_time_seconds: 0,
    total_ziyarat_completed: 0,
  });
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [listeningHistory, setListeningHistory] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"quotes" | "ziyarat">("quotes");

  useEffect(() => {
    // Check if logged in
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // Load data
    loadData(userData.username);
  }, [router]);

  const loadData = async (username: string) => {
    try {
      const [
        statsData,
        quotesData,
        notesData,
        historyData,
        favoritesData,
        listeningData,
        badgesData,
        reportData,
      ] = await Promise.all([
        getUserStats(username),
        getSavedQuotes(username),
        getNotes(username),
        getReadingHistory(username, 5),
        getFavorites(username),
        getListeningHistory(username, 5),
        getUserBadges(username),
        getMonthlyListeningReport(username),
      ]);

      console.log("📊 Stats:", statsData);
      console.log("🎧 Favorites:", favoritesData);
      console.log("🏆 Badges:", badgesData);
      console.log("📈 Monthly Report:", reportData);

      setStats(statsData);
      setSavedQuotes(quotesData.slice(0, 5));
      setNotes(notesData.slice(0, 5));
      setHistory(historyData);
      setFavorites(favoritesData.slice(0, 5));
      setListeningHistory(listeningData);
      setBadges(badgesData);
      setMonthlyReport(reportData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (quoteId: number) => {
    if (!confirm("Are you sure you want to delete this saved quote?")) {
      return;
    }

    try {
      const result = await deleteQuote(quoteId, user.username);
      if (result.success) {
        setSavedQuotes(savedQuotes.filter((q) => q.id !== quoteId));
        setStats({ ...stats, saved_quotes: stats.saved_quotes - 1 });
        alert("✅ Quote deleted successfully!");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("❌ Error deleting quote");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const result = await deleteNote(noteId, user.username);
      if (result.success) {
        setNotes(notes.filter((n) => n.id !== noteId));
        setStats({ ...stats, notes: stats.notes - 1 });
        alert("✅ Note deleted successfully!");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("❌ Error deleting note");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Particles />
        <div style={{ fontSize: "1.5rem" }}>⏳ Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        padding: "clamp(20px, 5vw, 40px)",
      }}
    >
      <Particles />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "clamp(30px, 8vw, 60px)",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(2rem, 6vw, 3rem)",
                fontWeight: "900",
                marginBottom: "10px",
                background:
                  "linear-gradient(to right, #ffffff, #ffd89b, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📊 Dashboard
            </h1>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              }}
            >
              Welcome back,{" "}
              <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                {user?.name}
              </span>
              !
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 25px",
                background: "rgba(255, 216, 155, 0.2)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "10px",
                color: "#ffd89b",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              🏠 Home
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "12px 25px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "10px",
                color: "#fca5a5",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("quotes")}
            style={{
              padding: "12px 30px",
              background:
                activeTab === "quotes"
                  ? "rgba(255, 216, 155, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${
                activeTab === "quotes"
                  ? "rgba(255, 216, 155, 0.4)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              borderRadius: "10px",
              color: activeTab === "quotes" ? "#ffd89b" : "white",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
            }}
          >
            📚 Quotes & Notes
          </button>
          <button
            onClick={() => setActiveTab("ziyarat")}
            style={{
              padding: "12px 30px",
              background:
                activeTab === "ziyarat"
                  ? "rgba(255, 216, 155, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${
                activeTab === "ziyarat"
                  ? "rgba(255, 216, 155, 0.4)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              borderRadius: "10px",
              color: activeTab === "ziyarat" ? "#ffd89b" : "white",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
            }}
          >
            🕋 Ziyarat Stats
          </button>
        </div>

        {/* QUOTES TAB */}
        {activeTab === "quotes" && (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "clamp(15px, 3vw, 30px)",
                marginBottom: "clamp(40px, 8vw, 60px)",
              }}
            >
              {[
                {
                  icon: "📚",
                  label: "Saved Quotes",
                  value: stats.saved_quotes,
                  color: "#ffd89b",
                },
                {
                  icon: "📝",
                  label: "Personal Notes",
                  value: stats.notes,
                  color: "#86efac",
                },
                {
                  icon: "👁️",
                  label: "Quotes Read",
                  value: stats.quotes_read,
                  color: "#93c5fd",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    padding: "clamp(20px, 4vw, 30px)",
                    textAlign: "center",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(2rem, 6vw, 3rem)",
                      marginBottom: "15px",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(2rem, 5vw, 2.5rem)",
                      fontWeight: "bold",
                      color: stat.color,
                      marginBottom: "10px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: "#d0d0d0",
                      fontSize: "clamp(0.85rem, 2vw, 1rem)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "clamp(20px, 4vw, 30px)",
              }}
            >
              {/* Recent Saved Quotes */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                }}
              >
                <h2
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  📚 Recent Saved Quotes
                </h2>

                {savedQuotes.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {savedQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "15px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #ffd89b",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            color: "#ffd89b",
                            fontWeight: "600",
                            marginBottom: "5px",
                            paddingRight: "40px",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          }}
                        >
                          {quote.title?.substring(0, 50) || "Untitled"}
                        </div>
                        <div
                          style={{
                            color: "#d0d0d0",
                            fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
                            marginBottom: "10px",
                          }}
                        >
                          {quote.text?.substring(0, 80)}...
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              color: "#999",
                              fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                            }}
                          >
                            {new Date(quote.saved_at).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            style={{
                              padding: "5px 12px",
                              background: "rgba(239, 68, 68, 0.2)",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              borderRadius: "6px",
                              color: "#fca5a5",
                              cursor: "pointer",
                              fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                              fontWeight: "600",
                              transition: "all 0.3s",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>No saved quotes yet</p>
                )}
              </div>

              {/* Recent Notes */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                }}
              >
                <h2
                  style={{
                    color: "#86efac",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  📝 Recent Notes
                </h2>

                {notes.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "15px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #86efac",
                        }}
                      >
                        <div
                          style={{
                            color: "#86efac",
                            fontWeight: "600",
                            marginBottom: "5px",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          }}
                        >
                          {note.quote_title?.substring(0, 40) || "Untitled"}
                        </div>
                        <div
                          style={{
                            color: "#d0d0d0",
                            fontSize: "clamp(0.85rem, 1.8vw, 0.9rem)",
                            marginBottom: "10px",
                          }}
                        >
                          {note.note_text?.substring(0, 60)}...
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              color: "#999",
                              fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                            }}
                          >
                            {new Date(note.created_at).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              padding: "5px 12px",
                              background: "rgba(239, 68, 68, 0.2)",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              borderRadius: "6px",
                              color: "#fca5a5",
                              cursor: "pointer",
                              fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                              fontWeight: "600",
                              transition: "all 0.3s",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>No notes yet</p>
                )}
              </div>

              {/* Reading History */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                }}
              >
                <h2
                  style={{
                    color: "#93c5fd",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  📖 Recent Reading
                </h2>

                {history.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {history.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "15px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #93c5fd",
                        }}
                      >
                        <div
                          style={{
                            color: "#93c5fd",
                            fontWeight: "600",
                            marginBottom: "5px",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          }}
                        >
                          {item.quote_title?.substring(0, 50) || "Untitled"}
                        </div>
                        <div
                          style={{
                            color: "#999",
                            fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                          }}
                        >
                          {new Date(
                            item.read_at || item.last_read
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>No reading history yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ZIYARAT TAB */}
        {activeTab === "ziyarat" && (
          <>
            {/* Ziyarat Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "clamp(15px, 3vw, 30px)",
                marginBottom: "clamp(40px, 8vw, 60px)",
              }}
            >
              {[
                {
                  icon: "🔥",
                  label: "Day Streak",
                  value: stats.current_streak_days,
                  color: "#ff6b6b",
                },
                {
                  icon: "⏱️",
                  label: "Total Time",
                  value: formatTime(stats.total_listening_time_seconds),
                  color: "#ffd89b",
                  isTime: true,
                },
                {
                  icon: "✅",
                  label: "Completed",
                  value: stats.total_ziyarat_completed,
                  color: "#86efac",
                },
                {
                  icon: "⭐",
                  label: "Favorites",
                  value: favorites.length,
                  color: "#93c5fd",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    padding: "clamp(20px, 4vw, 30px)",
                    textAlign: "center",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(2rem, 6vw, 3rem)",
                      marginBottom: "15px",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: stat.isTime
                        ? "clamp(1.5rem, 4vw, 2rem)"
                        : "clamp(2rem, 5vw, 2.5rem)",
                      fontWeight: "bold",
                      color: stat.color,
                      marginBottom: "10px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: "#d0d0d0",
                      fontSize: "clamp(0.85rem, 2vw, 1rem)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Report */}
            {monthlyReport && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 216, 155, 0.1) 0%, rgba(25, 84, 123, 0.1) 100%)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "20px",
                  padding: "clamp(25px, 5vw, 35px)",
                  marginBottom: "clamp(30px, 6vw, 40px)",
                }}
              >
                <h2
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    marginBottom: "25px",
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  📈 Monthly Report - {monthlyReport.month}
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
                    gap: "20px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "clamp(2rem, 5vw, 2.5rem)",
                        color: "#ffd89b",
                        fontWeight: "bold",
                      }}
                    >
                      {monthlyReport.totalListens}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                      }}
                    >
                      Total Listens
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "clamp(1.5rem, 4vw, 2rem)",
                        color: "#ffd89b",
                        fontWeight: "bold",
                      }}
                    >
                      {formatTime(monthlyReport.totalTime)}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                      }}
                    >
                      Time Spent
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "clamp(2rem, 5vw, 2.5rem)",
                        color: "#86efac",
                        fontWeight: "bold",
                      }}
                    >
                      {monthlyReport.completedListens}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                      }}
                    >
                      Completed
                    </div>
                  </div>
                </div>

                {monthlyReport.mostListenedZiyarat && (
                  <div
                    style={{
                      marginTop: "25px",
                      padding: "20px",
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#ffd89b",
                        fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                        marginBottom: "8px",
                      }}
                    >
                      🏆 Most Listened This Month
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                        fontWeight: "600",
                      }}
                    >
                      {monthlyReport.mostListenedZiyarat.replace(/-/g, " ")}
                    </div>
                    <div style={{ color: "#999", marginTop: "5px" }}>
                      ({monthlyReport.mostListenedCount} times)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                  marginBottom: "clamp(30px, 6vw, 40px)",
                }}
              >
                <h2
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.3rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  🏆 Your Badges
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(min(100%, 150px), 1fr))",
                    gap: "15px",
                  }}
                >
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255, 216, 155, 0.1)",
                        border: "1px solid rgba(255, 216, 155, 0.3)",
                        borderRadius: "12px",
                        padding: "20px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(2rem, 5vw, 3rem)",
                          marginBottom: "10px",
                        }}
                      >
                        🏅
                      </div>
                      <div
                        style={{
                          color: "#ffd89b",
                          fontWeight: "600",
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        }}
                      >
                        {badge.badge_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Grid - Favorites & Listening History */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "clamp(20px, 4vw, 30px)",
              }}
            >
              {/* Favorites */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                }}
              >
                <h2
                  style={{
                    color: "#93c5fd",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  ⭐ Favorite Ziyarat
                </h2>

                {favorites.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {favorites.map((fav, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          router.push(`/ziyarat/${fav.ziyarat_slug}`)
                        }
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "15px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #93c5fd",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            color: "#93c5fd",
                            fontWeight: "600",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          }}
                        >
                          {fav.ziyarat_slug.replace(/-/g, " ")}
                        </div>
                        <div
                          style={{
                            color: "#999",
                            fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                            marginTop: "5px",
                          }}
                        >
                          {new Date(fav.favorited_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>No favorites yet</p>
                )}
              </div>

              {/* Recent Listening */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                }}
              >
                <h2
                  style={{
                    color: "#86efac",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "20px",
                    fontWeight: "700",
                  }}
                >
                  🎧 Recent Listening
                </h2>

                {listeningHistory.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {listeningHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          router.push(`/ziyarat/${item.ziyarat_slug}`)
                        }
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "15px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #86efac",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            color: "#86efac",
                            fontWeight: "600",
                            marginBottom: "5px",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          }}
                        >
                          {item.ziyarat_slug.replace(/-/g, " ")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#999",
                            fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                          }}
                        >
                          <span>
                            {new Date(item.listened_at).toLocaleDateString()}
                          </span>
                          <span>{item.completed ? "✅" : "▶️"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>No listening history yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quick Links */}
        <div
          style={{
            marginTop: "clamp(40px, 8vw, 60px)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#ffd89b",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              marginBottom: "30px",
              fontWeight: "700",
            }}
          >
            📚 Explore Content
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
              gap: "15px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {[
              { name: "All Ziyarat", icon: "🕋", path: "/ziyarat" },
              {
                name: "Ayatollah Bahjat",
                icon: "💎",
                path: "/ayatollah-bahjat",
              },
              {
                name: "Imam Khomeini Poems",
                icon: "📜",
                path: "/imam-khomeini-poems",
              },
              {
                name: "Imam Khomeini Hadith",
                icon: "📖",
                path: "/imam-khomeini-hadith",
              },
            ].map((link, index) => (
              <button
                key={index}
                onClick={() => router.push(link.path)}
                style={{
                  padding: "clamp(15px, 3vw, 20px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 216, 155, 0.1)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 216, 155, 0.3)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    marginBottom: "10px",
                  }}
                >
                  {link.icon}
                </div>
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
