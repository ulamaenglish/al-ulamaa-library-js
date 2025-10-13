"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

interface Worship {
  title: string;
  action: string;
  effect: string;
}

const WORSHIP_ICONS = [
  "🌙",
  "⭐",
  "✨",
  "💫",
  "🌟",
  "💎",
  "🔮",
  "📿",
  "🕯️",
  "🌸",
  "🍃",
  "💚",
  "🦋",
  "🌺",
  "🌼",
  "🌻",
  "🌹",
  "🏵️",
  "💐",
  "🌷",
];

export default function WorshipListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [worships, setWorships] = useState<Worship[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorship, setExpandedWorship] = useState<string | null>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    loadWorships();
  }, []);

  const loadWorships = async () => {
    try {
      const response = await fetch("/worships.txt");
      const text = await response.text();
      const parsedWorships = parseWorships(text);
      setWorships(parsedWorships);
    } catch (error) {
      console.error("Error loading worships:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseWorships = (text: string): Worship[] => {
    const lines = text.split("\n");
    const worshipsArray: Worship[] = [];
    let title: string | null = null;
    let action: string | null = null;
    let effect: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        // Empty line - save current worship if complete
        if (title && action && effect) {
          worshipsArray.push({ title, action, effect });
          title = null;
          action = null;
          effect = null;
        }
        continue;
      }

      if (trimmed === trimmed.toUpperCase() && trimmed.length > 0) {
        // This is a title (all uppercase)
        if (title && action && effect) {
          worshipsArray.push({ title, action, effect });
        }
        title = trimmed;
        action = null;
        effect = null;
      } else if (title && !action) {
        // First line after title is action
        action = trimmed;
      } else if (title && action && !effect) {
        // Second line after title is effect
        effect = trimmed;
      }
    }

    // Save the last worship if complete
    if (title && action && effect) {
      worshipsArray.push({ title, action, effect });
    }

    return worshipsArray;
  };

  const handleSaveWorship = async (
    title: string,
    action: string,
    effect: string
  ) => {
    if (!user) {
      alert("Please login to save worships!");
      router.push("/login");
      return;
    }

    const fullContent = `Action: ${action}\n\nBenefit: ${effect}`;

    try {
      const result = await saveQuote(user.username, title, fullContent);
      if (result.success) {
        alert("Worship saved successfully!");
      } else {
        alert(result.message || "Already saved");
      }
    } catch (error) {
      console.error("Error saving worship:", error);
    }
  };

  const handleAddNote = async (title: string) => {
    if (!user) {
      alert("Please login to add notes!");
      router.push("/login");
      return;
    }

    if (!noteText.trim()) {
      alert("Please enter a note!");
      return;
    }

    try {
      await addNote(user.username, title, noteText);
      alert("Note saved!");
      setAddingNoteFor(null);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleWorshipView = async (title: string) => {
    if (user) {
      await addToHistory(user.username, title);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
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
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        padding: "20px",
      }}
    >
      <Particles />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>

          {user && (
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 216, 155, 0.2)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "10px",
                color: "#ffd89b",
                cursor: "pointer",
              }}
            >
              📊 Dashboard
            </button>
          )}
        </div>

        {/* Page Title */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 20px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.8rem",
              fontWeight: "900",
              marginBottom: "5px",
              letterSpacing: "2px",
              color: "white",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            🕌 Daily Worship Program
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Acts of Worship and Their Spiritual Benefits
          </p>
        </div>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 216, 155, 0.5), transparent)",
            margin: "40px 0",
          }}
        />

        {/* Worships List */}
        {worships.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {worships.map((worship, idx) => {
              const isExpanded = expandedWorship === worship.title;
              const icon = WORSHIP_ICONS[idx % WORSHIP_ICONS.length];

              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "15px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  <button
                    onClick={() => {
                      const newExpanded = isExpanded ? null : worship.title;
                      setExpandedWorship(newExpanded);
                      if (newExpanded) {
                        handleWorshipView(worship.title);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "20px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {icon} {worship.title.toLowerCase()}
                    </div>
                    <div style={{ fontSize: "1.5rem" }}>
                      {isExpanded ? "▲" : "▼"}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "0 20px 20px 20px" }}>
                      <h2
                        style={{
                          color: "#ffd89b",
                          fontSize: "1.4rem",
                          marginTop: "20px",
                          marginBottom: "15px",
                          fontFamily: "'Playfair Display', serif",
                          textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                          textTransform: "capitalize",
                        }}
                      >
                        {worship.title.toLowerCase()}
                      </h2>

                      {/* Action Section */}
                      <h3
                        style={{
                          color: "#ffd89b",
                          fontSize: "1.2rem",
                          marginTop: "20px",
                          marginBottom: "10px",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        📋 Action
                      </h3>

                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                          borderRadius: "15px",
                          border: "2px solid rgba(255, 216, 155, 0.3)",
                          padding: "25px",
                          margin: "15px 0",
                          color: "#f5f5f5",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                          fontFamily: "'Georgia', serif",
                          fontSize: "17px",
                          lineHeight: "1.9",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {worship.action}
                      </div>

                      {/* Effect Section */}
                      <h3
                        style={{
                          color: "#ffd89b",
                          fontSize: "1.2rem",
                          marginTop: "20px",
                          marginBottom: "10px",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        ✨ Spiritual Benefit
                      </h3>

                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(25, 84, 123, 0.3) 0%, rgba(255, 216, 155, 0.2) 100%)",
                          borderRadius: "15px",
                          border: "2px solid rgba(255, 216, 155, 0.4)",
                          padding: "25px",
                          margin: "15px 0",
                          color: "#ffffff",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                          fontFamily: "'Georgia', serif",
                          fontSize: "17px",
                          lineHeight: "1.8",
                          backdropFilter: "blur(10px)",
                          borderLeft: "5px solid #ffd89b",
                        }}
                      >
                        {worship.effect}
                      </div>

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          flexWrap: "wrap",
                          marginTop: "20px",
                        }}
                      >
                        {user && (
                          <>
                            <button
                              onClick={() =>
                                handleSaveWorship(
                                  worship.title,
                                  worship.action,
                                  worship.effect
                                )
                              }
                              style={{
                                padding: "10px 20px",
                                background: "rgba(255, 216, 155, 0.2)",
                                border: "1px solid rgba(255, 216, 155, 0.4)",
                                borderRadius: "10px",
                                color: "#ffd89b",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              💾 Save
                            </button>

                            <button
                              onClick={() => setAddingNoteFor(worship.title)}
                              style={{
                                padding: "10px 20px",
                                background: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                borderRadius: "10px",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              📝 Add Note
                            </button>
                          </>
                        )}

                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${worship.action}\n\n${worship.effect}`
                            )
                          }
                          style={{
                            padding: "10px 20px",
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "10px",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>

                      {/* Add Note Form */}
                      {addingNoteFor === worship.title && (
                        <div style={{ marginTop: "20px" }}>
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Your reflection on this worship..."
                            style={{
                              width: "100%",
                              padding: "15px",
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "10px",
                              color: "white",
                              fontSize: "15px",
                              minHeight: "100px",
                              marginBottom: "10px",
                              fontFamily: "inherit",
                            }}
                          />
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => handleAddNote(worship.title)}
                              style={{
                                padding: "10px 20px",
                                background:
                                  "linear-gradient(135deg, #19547b, #ffd89b)",
                                border: "none",
                                borderRadius: "10px",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => {
                                setAddingNoteFor(null);
                                setNoteText("");
                              }}
                              style={{
                                padding: "10px 20px",
                                background: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                borderRadius: "10px",
                                color: "white",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 40px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "15px",
            }}
          >
            <p style={{ color: "#d0d0d0", fontSize: "1.2rem" }}>
              No worships loaded. Please check your worships.txt file.
            </p>
          </div>
        )}

        {/* More Coming Soon */}
        <div
          style={{
            textAlign: "center",
            padding: "30px",
            background: "rgba(255, 216, 155, 0.1)",
            borderRadius: "15px",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            marginTop: "40px",
          }}
        >
          <p style={{ color: "#ffd89b", fontSize: "1.1rem", margin: 0 }}>
            💡 More worships will be added regularly. Check back often!
          </p>
        </div>

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
          <p style={{ marginBottom: "5px" }}>
            © 2025{" "}
            <span style={{ color: "#ffd89b", fontWeight: "600" }}>ULAMA</span> |
            All rights reserved
          </p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            May our worship be accepted
          </p>
        </div>
      </div>
    </div>
  );
}
