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
} from "@/lib/database";
import Particles from "@/components/Particles";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    saved_quotes: 0,
    notes: 0,
    quotes_read: 0,
  });
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [statsData, quotesData, notesData, historyData] = await Promise.all(
        [
          getUserStats(username),
          getSavedQuotes(username),
          getNotes(username),
          getReadingHistory(username, 5),
        ]
      );

      console.log("📊 Stats:", statsData);
      console.log("💾 Saved Quotes:", quotesData);
      console.log("📝 Notes:", notesData);
      console.log("📖 History:", historyData);

      setStats(statsData);
      setSavedQuotes(quotesData.slice(0, 5));
      setNotes(notesData.slice(0, 5));
      setHistory(historyData);
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
        // Remove from local state
        setSavedQuotes(savedQuotes.filter((q) => q.id !== quoteId));
        // Update stats
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
        // Remove from local state
        setNotes(notes.filter((n) => n.id !== noteId));
        // Update stats
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
        Loading...
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
        padding: "40px 20px",
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
            marginBottom: "60px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "3rem",
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
            <p style={{ color: "#d0d0d0", fontSize: "1.2rem" }}>
              Welcome back,{" "}
              <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                {user?.name}
              </span>
              !
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 30px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "10px",
              color: "#fca5a5",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
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

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            marginBottom: "60px",
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
                padding: "30px",
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
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: stat.color,
                  marginBottom: "10px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: "#d0d0d0", fontSize: "1rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}
        >
          {/* Recent Saved Quotes */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h2
              style={{
                color: "#ffd89b",
                fontSize: "1.5rem",
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
                      }}
                    >
                      {quote.title?.substring(0, 50) || "Untitled"}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "0.85rem",
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
                      }}
                    >
                      <div style={{ color: "#999", fontSize: "0.85rem" }}>
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
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239, 68, 68, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239, 68, 68, 0.2)";
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
              padding: "30px",
            }}
          >
            <h2
              style={{
                color: "#86efac",
                fontSize: "1.5rem",
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
                      }}
                    >
                      {note.quote_title?.substring(0, 40) || "Untitled"}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "0.9rem",
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
                      }}
                    >
                      <div style={{ color: "#999", fontSize: "0.85rem" }}>
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
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239, 68, 68, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239, 68, 68, 0.2)";
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
              padding: "30px",
            }}
          >
            <h2
              style={{
                color: "#93c5fd",
                fontSize: "1.5rem",
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
                      }}
                    >
                      {item.quote_title?.substring(0, 50) || "Untitled"}
                    </div>
                    <div style={{ color: "#999", fontSize: "0.85rem" }}>
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

        {/* Quick Links */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <h2
            style={{
              color: "#ffd89b",
              fontSize: "2rem",
              marginBottom: "30px",
              fontWeight: "700",
            }}
          >
            📚 Explore Content
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {[
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
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "1rem",
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
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>
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
