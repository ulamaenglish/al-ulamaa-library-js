"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { getSavedAIResponses, deleteSavedAIResponse } from "@/lib/database";

interface SavedResponse {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export default function SavedResponsesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      loadResponses(userData.username);
    } else {
      router.push("/login");
    }
  }, [router]);

  const loadResponses = async (username: string) => {
    setLoading(true);
    try {
      const data = await getSavedAIResponses(username);
      setResponses(data);
    } catch (error) {
      console.error("Error loading responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this saved response?")) {
      return;
    }

    const result = await deleteSavedAIResponse(id);
    if (result.success) {
      setResponses(responses.filter((r) => r.id !== id));
      alert("✅ Response deleted!");
    } else {
      alert("❌ Failed to delete");
    }
  };

  const filteredResponses = responses.filter(
    (response) =>
      response.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      }}
    >
      <Particles />

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .response-card {
          animation: fadeInUp 0.5s ease-out;
          transition: all 0.3s;
        }

        .response-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(20px, 5vw, 40px)",
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
            marginBottom: "clamp(30px, 6vw, 40px)",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/ai-assistant")}
              style={{
                padding: "10px 20px",
                background: "rgba(102, 126, 234, 0.2)",
                border: "1px solid rgba(102, 126, 234, 0.4)",
                borderRadius: "10px",
                color: "#667eea",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.3)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ← Back to AI Assistant
            </button>

            <button
              onClick={() => router.push("/")}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              🏠 Home
            </button>
          </div>

          {user && (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(255, 216, 155, 0.1)",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "10px",
                color: "#ffd89b",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                fontWeight: "600",
              }}
            >
              👤 {user.name}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              color: "white",
              marginBottom: "10px",
              textShadow:
                "0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4)",
            }}
          >
            💾 Saved AI Responses
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "#d0d0d0",
            }}
          >
            Your collection of helpful AI conversations
          </p>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "rgba(102, 126, 234, 0.1)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                color: "#667eea",
                fontWeight: "900",
                marginBottom: "5px",
              }}
            >
              {responses.length}
            </div>
            <div style={{ color: "#d0d0d0", fontSize: "1rem" }}>
              Total Saved
            </div>
          </div>

          <div
            style={{
              background: "rgba(134, 239, 172, 0.1)",
              border: "1px solid rgba(134, 239, 172, 0.3)",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                color: "#86efac",
                fontWeight: "900",
                marginBottom: "5px",
              }}
            >
              {filteredResponses.length}
            </div>
            <div style={{ color: "#d0d0d0", fontSize: "1rem" }}>Showing</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="🔍 Search your saved responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "15px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "15px",
              color: "white",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#888",
              fontSize: "1.2rem",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⏳</div>
            Loading your saved responses...
          </div>
        ) : filteredResponses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📭</div>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#d0d0d0",
                marginBottom: "20px",
              }}
            >
              {searchQuery
                ? "No responses match your search"
                : "No saved responses yet"}
            </p>
            <p style={{ color: "#888", marginBottom: "30px" }}>
              {searchQuery
                ? "Try a different search term"
                : "Start chatting with the AI and save helpful responses!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/ai-assistant")}
                style={{
                  padding: "15px 30px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  boxShadow: "0 5px 20px rgba(102, 126, 234, 0.4)",
                }}
              >
                🤖 Start Chatting with AI
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "25px",
            }}
          >
            {filteredResponses.map((response, index) => (
              <div
                key={response.id}
                className="response-card"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "clamp(20px, 4vw, 30px)",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Question Section */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background:
                          "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      ❓
                    </div>
                    <h3
                      style={{
                        color: "#667eea",
                        fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                        fontWeight: "700",
                        margin: 0,
                      }}
                    >
                      Your Question
                    </h3>
                  </div>
                  <p
                    style={{
                      color: "#d0d0d0",
                      lineHeight: "1.7",
                      fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                      marginLeft: "50px",
                      fontStyle: "italic",
                    }}
                  >
                    "{response.question}"
                  </p>
                </div>

                {/* Answer Section */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      🤖
                    </div>
                    <h3
                      style={{
                        color: "#86efac",
                        fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                        fontWeight: "700",
                        margin: 0,
                      }}
                    >
                      AI Response
                    </h3>
                  </div>
                  <div
                    style={{
                      color: "#e0e0e0",
                      lineHeight: "1.8",
                      fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                      marginLeft: "50px",
                      whiteSpace: "pre-wrap",
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {response.answer}
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#888",
                      fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    }}
                  >
                    <span>📅</span>
                    <span>
                      Saved on{" "}
                      {new Date(response.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(response.id)}
                    style={{
                      padding: "10px 20px",
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: "10px",
                      color: "#fca5a5",
                      cursor: "pointer",
                      fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                      fontWeight: "600",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239, 68, 68, 0.3)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239, 68, 68, 0.2)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            color: "#888",
            fontSize: "0.9rem",
            padding: "20px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p>
            💡 Tip: Chat with the AI and click "Save This Response" to save
            helpful answers
          </p>
        </div>
      </div>
    </div>
  );
}
