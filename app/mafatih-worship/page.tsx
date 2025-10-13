"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

interface Worship {
  title: string;
  emoji: string;
  description: string;
  ayat_text: string;
}

const WORSHIPS_SECTION1: Worship[] = [
  {
    title: "Surah at-Takathur",
    emoji: "📜",
    description:
      "This surah has 8 ayaat and it was revealed in Makkah. Reciting it before sleeping saves from grave's torments. In faraa'idh prayers, reward of 100 martyrs. In nawafil prayers, reward of 50 martyrs. Recommended in Asr prayers. Cure for headaches.",
    ayat_text: `Bismillaahir Rahmaanir Raheem
Al haaku mut takathur
Hatta zurtumul-maqaabir
Kalla sawfa ta'lamoon
Thumma kalla sawfa ta'lamoon
Kalla law ta'lamoona 'ilmal yaqeen
Latara-wun nal jaheem
Thumma latara wunnaha 'ainal yaqeen
Thumma latus alunna yauma-izin 'anin na'eem`,
  },
];

const WORSHIPS_SECTION2: Worship[] = [
  {
    title: "Surah An-Nas",
    emoji: "🌙",
    description:
      "Recitation protects from whisperings of Shaytan. Recommended in morning/evening adhkar.",
    ayat_text: `Bismillaahir Rahmaanir Raheem
Qul a'oozu bi rabbin-nas
Malikin-nas
Ilahin-nas
Min sharril-waswasil-khannaas
Alladhi yuwaswisu fee sudurin-nas
Minal-jinnati wan-nas`,
  },
];

export default function MafatihWorshipPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("section1");
  const [expandedWorship, setExpandedWorship] = useState<string | null>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSaveWorship = async (
    title: string,
    description: string,
    ayat: string
  ) => {
    if (!user) {
      alert("Please login to save worships!");
      router.push("/login");
      return;
    }

    const fullContent = `${description}\n\nAyaat:\n${ayat}`;

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
            🤲 Mafatih al-Jinan
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Keys to the Gardens of Paradise
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

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "section1", label: "📖 Section 1 - Surahs" },
            { id: "section2", label: "📿 Section 2 - Supplications" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 25px",
                borderRadius: "25px",
                fontSize: "15px",
                fontWeight: activeTab === tab.id ? "600" : "500",
                border: `1px solid ${
                  activeTab === tab.id
                    ? "rgba(255, 216, 155, 0.4)"
                    : "rgba(255, 255, 255, 0.1)"
                }`,
                background:
                  activeTab === tab.id
                    ? "rgba(255, 216, 155, 0.15)"
                    : "rgba(255, 255, 255, 0.05)",
                color: activeTab === tab.id ? "#ffd89b" : "#b0b0b0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  activeTab === tab.id
                    ? "0 4px 12px rgba(255, 216, 155, 0.2)"
                    : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1 - SURAHS */}
        {activeTab === "section1" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "#ffd89b",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Sacred Surahs and Their Benefits
            </h2>

            {/* Display Worships */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {WORSHIPS_SECTION1.map((worship, idx) => {
                const isExpanded = expandedWorship === worship.title;

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
                      <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                        {worship.emoji} {worship.title}
                      </div>
                      <div style={{ fontSize: "1.5rem" }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px 20px" }}>
                        <h3
                          style={{
                            textAlign: "center",
                            color: "#ffd89b",
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.8rem",
                            marginBottom: "20px",
                          }}
                        >
                          {worship.title}
                        </h3>

                        {/* Description */}
                        <p
                          style={{
                            color: "#ffd89b",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            marginBottom: "10px",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          📋 Benefits & Description
                        </p>

                        <div
                          style={{
                            background: "rgba(255, 216, 155, 0.1)",
                            borderLeft: "4px solid #ffd89b",
                            padding: "20px",
                            margin: "20px 0",
                            borderRadius: "10px",
                            fontFamily: "'Georgia', serif",
                            fontSize: "16px",
                            lineHeight: "1.8",
                            color: "#e0e0e0",
                          }}
                        >
                          {worship.description}
                        </div>

                        {/* Ayaat */}
                        <p
                          style={{
                            color: "#ffd89b",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            marginBottom: "10px",
                            marginTop: "20px",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          📿 Ayaat
                        </p>

                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            padding: "25px",
                            margin: "20px 0",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 216, 155, 0.2)",
                            fontFamily: "'Amiri', 'Georgia', serif",
                            fontSize: "18px",
                            lineHeight: "2.2",
                            textAlign: "center",
                            color: "#f5f5f5",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {worship.ayat_text}
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
                                    worship.description,
                                    worship.ayat_text
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
                              navigator.clipboard.writeText(worship.ayat_text)
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
                              placeholder="Your reflection..."
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

              {/* Coming Soon */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#ffd89b", fontSize: "1.1rem" }}>
                  📜 More Surahs (Coming Soon)
                </p>
                <p style={{ color: "#b0b0b0", marginTop: "10px" }}>
                  More surahs will be added soon...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 - SUPPLICATIONS */}
        {activeTab === "section2" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "#ffd89b",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Protective Supplications
            </h2>

            {/* Display Worships */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {WORSHIPS_SECTION2.map((worship, idx) => {
                const isExpanded = expandedWorship === worship.title;

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
                      <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                        {worship.emoji} {worship.title}
                      </div>
                      <div style={{ fontSize: "1.5rem" }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px 20px" }}>
                        <h3
                          style={{
                            textAlign: "center",
                            color: "#ffd89b",
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.8rem",
                            marginBottom: "20px",
                          }}
                        >
                          {worship.title}
                        </h3>

                        {/* Description */}
                        <p
                          style={{
                            color: "#ffd89b",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            marginBottom: "10px",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          📋 Benefits & Description
                        </p>

                        <div
                          style={{
                            background: "rgba(255, 216, 155, 0.1)",
                            borderLeft: "4px solid #ffd89b",
                            padding: "20px",
                            margin: "20px 0",
                            borderRadius: "10px",
                            fontFamily: "'Georgia', serif",
                            fontSize: "16px",
                            lineHeight: "1.8",
                            color: "#e0e0e0",
                          }}
                        >
                          {worship.description}
                        </div>

                        {/* Ayaat */}
                        <p
                          style={{
                            color: "#ffd89b",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            marginBottom: "10px",
                            marginTop: "20px",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          📿 Ayaat
                        </p>

                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            padding: "25px",
                            margin: "20px 0",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 216, 155, 0.2)",
                            fontFamily: "'Amiri', 'Georgia', serif",
                            fontSize: "18px",
                            lineHeight: "2.2",
                            textAlign: "center",
                            color: "#f5f5f5",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {worship.ayat_text}
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
                                    worship.description,
                                    worship.ayat_text
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
                              navigator.clipboard.writeText(worship.ayat_text)
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
                              placeholder="Your reflection..."
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

              {/* Coming Soon */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#ffd89b", fontSize: "1.1rem" }}>
                  🌙 More Supplications (Coming Soon)
                </p>
                <p style={{ color: "#b0b0b0", marginTop: "10px" }}>
                  More supplications will be added soon...
                </p>
              </div>
            </div>
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
          <p style={{ marginBottom: "5px" }}>
            © 2025{" "}
            <span style={{ color: "#ffd89b", fontWeight: "600" }}>ULAMA</span> |
            All rights reserved
          </p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            May our recitations be accepted
          </p>
        </div>
      </div>
    </div>
  );
}
