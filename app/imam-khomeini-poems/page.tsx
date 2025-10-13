"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import {
  saveQuote,
  addNote,
  deleteQuote,
  getSavedQuotes,
  getNotes,
  deleteNote,
  addToHistory,
} from "@/lib/database";

interface Poem {
  title: string;
  content: string;
  wordCount: number;
  readTime: number;
}

export default function ImamKhomeiniPoemsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [savedPoems, setSavedPoems] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and controls
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Title (A-Z)");
  const [lengthFilter, setLengthFilter] = useState("All Poems");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [activeTab, setActiveTab] = useState("poems");
  const [viewedPoems, setViewedPoems] = useState<string[]>([]);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedPoem, setExpandedPoem] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
      loadUserData(JSON.parse(userStr).username);
    }
    loadPoems();
  }, []);

  const loadPoems = async () => {
    try {
      const response = await fetch("/imamkhomeinipoems.txt");
      const text = await response.text();
      const parsedPoems = parsePoems(text);
      setPoems(parsedPoems);
      setFilteredPoems(parsedPoems);
    } catch (error) {
      console.error("Error loading poems:", error);
    } finally {
      setLoading(false);
    }
  };

  const parsePoems = (text: string): Poem[] => {
    const lines = text.split("\n");
    const poemsArray: Poem[] = [];
    let currentTitle: string | null = null;
    let currentPoem: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentTitle && currentPoem.length > 0) {
          const content = currentPoem.join("\n");
          poemsArray.push({
            title: currentTitle,
            content: content,
            wordCount: content.split(/\s+/).length,
            readTime: Math.max(
              1,
              Math.floor(content.split(/\s+/).length / 200)
            ),
          });
        }
        currentTitle = null;
        currentPoem = [];
      } else if (currentTitle === null) {
        currentTitle = trimmed;
      } else {
        currentPoem.push(trimmed);
      }
    }

    if (currentTitle && currentPoem.length > 0) {
      const content = currentPoem.join("\n");
      poemsArray.push({
        title: currentTitle,
        content: content,
        wordCount: content.split(/\s+/).length,
        readTime: Math.max(1, Math.floor(content.split(/\s+/).length / 200)),
      });
    }

    return poemsArray;
  };

  const loadUserData = async (username: string) => {
    try {
      const [savedData, notesData] = await Promise.all([
        getSavedQuotes(username),
        getNotes(username),
      ]);
      setSavedPoems(savedData);
      setUserNotes(notesData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...poems];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (lengthFilter !== "All Poems") {
      filtered = filtered.filter((p) => {
        if (lengthFilter === "Short") return p.content.length < 500;
        if (lengthFilter === "Medium")
          return p.content.length >= 500 && p.content.length < 1500;
        if (lengthFilter === "Long") return p.content.length >= 1500;
        return true;
      });
    }

    if (sortOption === "Title (A-Z)") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "Title (Z-A)") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === "Length (Short-Long)") {
      filtered.sort((a, b) => a.content.length - b.content.length);
    } else if (sortOption === "Length (Long-Short)") {
      filtered.sort((a, b) => b.content.length - a.content.length);
    }

    setFilteredPoems(filtered);
    setCurrentPage(1);
  }, [searchQuery, sortOption, lengthFilter, poems]);

  const handleRandomPoem = () => {
    if (poems.length > 0) {
      const randomIndex = Math.floor(Math.random() * poems.length);
      const randomPoem = poems[randomIndex];
      setFilteredPoems([randomPoem]);
      setCurrentPage(1);
      setExpandedPoem(randomPoem.title);
    }
  };

  const handleSavePoem = async (title: string, content: string) => {
    if (!user) {
      alert("Please login to save poems!");
      router.push("/login");
      return;
    }

    try {
      const result = await saveQuote(user.username, title, content);
      if (result.success) {
        alert("Poem saved successfully!");
        loadUserData(user.username);
      } else {
        alert(result.message || "Poem already saved");
      }
    } catch (error) {
      console.error("Error saving poem:", error);
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
      loadUserData(user.username);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteSavedPoem = async (poemId: number) => {
    if (!user) return;

    try {
      await deleteQuote(poemId, user.username);
      alert("Poem deleted!");
      loadUserData(user.username);
    } catch (error) {
      console.error("Error deleting poem:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!user) return;

    try {
      await deleteNote(noteId, user.username);
      alert("Note deleted!");
      loadUserData(user.username);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handlePoemView = async (title: string) => {
    if (!viewedPoems.includes(title)) {
      setViewedPoems([...viewedPoems, title]);
    }

    if (user) {
      await addToHistory(user.username, title);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPoems.length / itemsPerPage)
  );
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, filteredPoems.length);
  const paginatedPoems = filteredPoems.slice(startIdx, endIdx);
  const totalWords = filteredPoems.reduce((sum, p) => sum + p.wordCount, 0);

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
            📖 Spiritual Poetry
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Imam Khomeini's Collection
          </p>
        </div>

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
            { id: "poems", label: "📜 Poems" },
            { id: "saved", label: "💾 My Saved" },
            { id: "notes", label: "📝 My Notes" },
            { id: "about", label: "ℹ️ About" },
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

        {/* POEMS TAB */}
        {activeTab === "poems" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Collection of Verses
            </h2>

            {/* Image */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ maxWidth: "600px", width: "100%" }}>
                <img
                  src="/khomeini2.jpg"
                  alt="Imam Khomeini"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "15px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="🔍 Search poems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: "3",
                    minWidth: "250px",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "15px",
                  }}
                />

                <button
                  onClick={handleRandomPoem}
                  style={{
                    padding: "12px 20px",
                    background: "rgba(255, 216, 155, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.4)",
                    borderRadius: "10px",
                    color: "#ffd89b",
                    cursor: "pointer",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                  title="Random Poem"
                >
                  🎲 Random
                </button>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  style={{
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "15px",
                    minWidth: "120px",
                  }}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="15">15 per page</option>
                  <option value="20">20 per page</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "15px",
                  }}
                >
                  <option value="Title (A-Z)">Title (A-Z)</option>
                  <option value="Title (Z-A)">Title (Z-A)</option>
                  <option value="Length (Short-Long)">
                    Length (Short-Long)
                  </option>
                  <option value="Length (Long-Short)">
                    Length (Long-Short)
                  </option>
                </select>

                <select
                  value={lengthFilter}
                  onChange={(e) => setLengthFilter(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "15px",
                  }}
                >
                  <option value="All Poems">All Poems</option>
                  <option value="Short">Short</option>
                  <option value="Medium">Medium</option>
                  <option value="Long">Long</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            {filteredPoems.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "10px",
                }}
              >
                <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                  {filteredPoems.length}
                </span>
                <span style={{ color: "#b0b0b0" }}>
                  {" "}
                  poem{filteredPoems.length !== 1 ? "s" : ""}
                </span>
                <span style={{ color: "#666", margin: "0 10px" }}>|</span>
                <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                  {totalWords.toLocaleString()}
                </span>
                <span style={{ color: "#b0b0b0" }}> words</span>
                <span style={{ color: "#666", margin: "0 10px" }}>|</span>
                <span style={{ color: "#b0b0b0" }}>Page </span>
                <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                  {currentPage}
                </span>
                <span style={{ color: "#b0b0b0" }}> of </span>
                <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                  {totalPages}
                </span>
              </div>
            )}

            {/* Pagination Top */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 20px",
                    background:
                      currentPage === 1
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: currentPage === 1 ? "#666" : "white",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ◀️
                </button>

                <div
                  style={{
                    padding: "10px 20px",
                    color: "#ffd89b",
                    fontWeight: "600",
                  }}
                >
                  {startIdx + 1}-{endIdx} of {filteredPoems.length}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "10px 20px",
                    background:
                      currentPage === totalPages
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: currentPage === totalPages ? "#666" : "white",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  ▶️
                </button>
              </div>
            )}

            {/* Poems List */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {paginatedPoems.map((poem, idx) => {
                const isExpanded = expandedPoem === poem.title;
                const isSaved = user
                  ? savedPoems.some((sp) => sp.title === poem.title)
                  : false;

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
                        const newExpanded = isExpanded ? null : poem.title;
                        setExpandedPoem(newExpanded);
                        if (newExpanded) {
                          handlePoemView(poem.title);
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
                      <div>
                        <div
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            marginBottom: "5px",
                          }}
                        >
                          📜 {poem.title}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#b0b0b0" }}>
                          {poem.wordCount} words · {poem.readTime} min
                        </div>
                      </div>
                      <div style={{ fontSize: "1.5rem" }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px 20px" }}>
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 216, 155, 0.3)",
                            padding: "30px",
                            color: "#f5f5f5",
                            fontFamily: "'Georgia', serif",
                            fontSize: `${fontSize}px`,
                            lineHeight: "1.9",
                            textAlign: "justify",
                            marginBottom: "20px",
                          }}
                        >
                          <div
                            style={{
                              padding: "20px",
                              background: "rgba(255, 255, 255, 0.03)",
                              borderRadius: "10px",
                              borderLeft: "3px solid #ffd89b",
                            }}
                          >
                            {poem.content.split("\n").map((line, i) => (
                              <p key={i} style={{ margin: "10px 0" }}>
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                          }}
                        >
                          {user && (
                            <>
                              {!isSaved ? (
                                <button
                                  onClick={() =>
                                    handleSavePoem(poem.title, poem.content)
                                  }
                                  style={{
                                    padding: "10px 20px",
                                    background: "rgba(255, 216, 155, 0.2)",
                                    border:
                                      "1px solid rgba(255, 216, 155, 0.4)",
                                    borderRadius: "10px",
                                    color: "#ffd89b",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                >
                                  💾 Save
                                </button>
                              ) : (
                                <div
                                  style={{
                                    padding: "10px 20px",
                                    background: "rgba(34, 197, 94, 0.2)",
                                    border: "1px solid rgba(34, 197, 94, 0.4)",
                                    borderRadius: "10px",
                                    color: "#86efac",
                                  }}
                                >
                                  ✅ Saved
                                </div>
                              )}

                              <button
                                onClick={() => setAddingNoteFor(poem.title)}
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
                              navigator.clipboard.writeText(poem.content)
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
                        {addingNoteFor === poem.title && (
                          <div style={{ marginTop: "20px" }}>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Your note..."
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
                                onClick={() => handleAddNote(poem.title)}
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

                        {/* Show existing notes */}
                        {user &&
                          userNotes.filter((n) => n.quote_title === poem.title)
                            .length > 0 && (
                            <div
                              style={{
                                marginTop: "20px",
                                padding: "15px",
                                background: "rgba(255, 255, 255, 0.03)",
                                borderRadius: "10px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#ffd89b",
                                  fontWeight: "600",
                                  marginBottom: "10px",
                                }}
                              >
                                📝 Your Notes:
                              </div>
                              {userNotes
                                .filter((n) => n.quote_title === poem.title)
                                .map((note) => (
                                  <div
                                    key={note.id}
                                    style={{
                                      color: "#d0d0d0",
                                      fontSize: "0.95rem",
                                      marginBottom: "5px",
                                      paddingLeft: "15px",
                                      borderLeft:
                                        "2px solid rgba(255, 216, 155, 0.3)",
                                    }}
                                  >
                                    {note.note_text}
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Bottom - Same as top */}
            {totalPages > 1 && (
              <div style={{ marginTop: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: "10px 15px",
                      background:
                        currentPage === 1
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: currentPage === 1 ? "#666" : "white",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ⏮️
                  </button>

                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "10px 15px",
                      background:
                        currentPage === 1
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: currentPage === 1 ? "#666" : "white",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ◀️
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "10px 15px",
                      background:
                        currentPage === totalPages
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: currentPage === totalPages ? "#666" : "white",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    ▶️
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "10px 15px",
                      background:
                        currentPage === totalPages
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: currentPage === totalPages ? "#666" : "white",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    ⏭️
                  </button>
                </div>

                <div style={{ textAlign: "center" }}>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    style={{
                      padding: "10px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: "white",
                      width: "100px",
                      textAlign: "center",
                    }}
                  />
                  <span style={{ color: "#b0b0b0", marginLeft: "10px" }}>
                    Jump to page
                  </span>
                </div>
              </div>
            )}

            {/* Recently Viewed */}
            {viewedPoems.length > 0 && (
              <div style={{ marginTop: "60px" }}>
                <div
                  style={{
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                    margin: "40px 0",
                  }}
                />
                <h3
                  style={{
                    color: "#ffd89b",
                    textAlign: "center",
                    marginBottom: "30px",
                  }}
                >
                  📚 Recently Viewed
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {viewedPoems.slice(-3).map((title, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "15px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255, 216, 155, 0.2)",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "#e0e0e0",
                          fontSize: "0.9rem",
                          margin: 0,
                        }}
                      >
                        {title.substring(0, 40)}
                        {title.length > 40 ? "..." : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPoems.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 40px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "15px",
                  marginTop: "40px",
                }}
              >
                <p
                  style={{
                    color: "#d0d0d0",
                    fontSize: "1.2rem",
                    marginBottom: "10px",
                  }}
                >
                  No poems found
                </p>
                <p style={{ color: "#888", fontSize: "1rem" }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        )}

        {/* MY SAVED TAB */}
        {activeTab === "saved" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Your Saved Poems
            </h2>

            {!user ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 40px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "15px",
                }}
              >
                <p
                  style={{
                    color: "#d0d0d0",
                    fontSize: "1.2rem",
                    marginBottom: "20px",
                  }}
                >
                  Please login to view saved poems!
                </p>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    padding: "12px 30px",
                    background: "linear-gradient(135deg, #19547b, #ffd89b)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Login Now
                </button>
              </div>
            ) : savedPoems.length > 0 ? (
              <div>
                <div
                  style={{
                    padding: "15px",
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    borderRadius: "10px",
                    color: "#86efac",
                    textAlign: "center",
                    marginBottom: "30px",
                  }}
                >
                  📚 You have <strong>{savedPoems.length}</strong> saved poem
                  {savedPoems.length !== 1 ? "s" : ""}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {savedPoems.map((poem) => (
                    <div
                      key={poem.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "15px",
                        padding: "25px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#ffd89b",
                          marginBottom: "15px",
                          fontSize: "1.2rem",
                        }}
                      >
                        📖 {poem.title}
                      </h3>
                      <div
                        style={{
                          color: "#d0d0d0",
                          marginBottom: "15px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {poem.text}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#888",
                          marginBottom: "15px",
                        }}
                      >
                        💾 Saved on:{" "}
                        {new Date(poem.saved_at).toLocaleDateString()}
                      </div>

                      <button
                        onClick={() => handleDeleteSavedPoem(poem.id)}
                        style={{
                          padding: "10px 20px",
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "10px",
                          color: "#fca5a5",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        🗑️ Delete
                      </button>

                      {/* Show notes */}
                      {userNotes.filter((n) => n.quote_title === poem.title)
                        .length > 0 && (
                        <div
                          style={{
                            marginTop: "20px",
                            padding: "15px",
                            background: "rgba(255, 255, 255, 0.03)",
                            borderRadius: "10px",
                          }}
                        >
                          <div
                            style={{
                              color: "#ffd89b",
                              fontWeight: "600",
                              marginBottom: "10px",
                            }}
                          >
                            📝 Your Notes:
                          </div>
                          {userNotes
                            .filter((n) => n.quote_title === poem.title)
                            .map((note) => (
                              <div
                                key={note.id}
                                style={{
                                  color: "#d0d0d0",
                                  marginBottom: "10px",
                                }}
                              >
                                <div>{note.note_text}</div>
                                <div
                                  style={{ fontSize: "0.85rem", color: "#888" }}
                                >
                                  Written:{" "}
                                  {new Date(
                                    note.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  💡 No saved poems yet. Start exploring!
                </p>
              </div>
            )}
          </div>
        )}

        {/* MY NOTES TAB */}
        {activeTab === "notes" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Your Personal Notes
            </h2>

            {!user ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 40px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "15px",
                }}
              >
                <p
                  style={{
                    color: "#d0d0d0",
                    fontSize: "1.2rem",
                    marginBottom: "20px",
                  }}
                >
                  Please login to view notes!
                </p>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    padding: "12px 30px",
                    background: "linear-gradient(135deg, #19547b, #ffd89b)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Login Now
                </button>
              </div>
            ) : userNotes.length > 0 ? (
              <div>
                <div
                  style={{
                    padding: "15px",
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    borderRadius: "10px",
                    color: "#86efac",
                    textAlign: "center",
                    marginBottom: "30px",
                  }}
                >
                  📝 You have <strong>{userNotes.length}</strong> note
                  {userNotes.length !== 1 ? "s" : ""}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {userNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "15px",
                        padding: "25px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#ffd89b",
                          marginBottom: "15px",
                          fontSize: "1.2rem",
                        }}
                      >
                        📌 {note.quote_title}
                      </h3>
                      <div
                        style={{
                          color: "#d0d0d0",
                          marginBottom: "15px",
                          lineHeight: "1.6",
                        }}
                      >
                        <strong>Note:</strong> {note.note_text}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#888",
                          marginBottom: "15px",
                        }}
                      >
                        ✍️ {new Date(note.created_at).toLocaleDateString()}
                      </div>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        style={{
                          padding: "10px 20px",
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "10px",
                          color: "#fca5a5",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
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
                  💡 No notes yet!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              About Imam Khomeini's Poetry
            </h2>

            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                borderRadius: "15px",
                border: "2px solid rgba(255, 216, 155, 0.3)",
                padding: "40px",
                color: "#f5f5f5",
                lineHeight: "1.8",
              }}
            >
              <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
                <strong style={{ color: "#ffd89b", fontSize: "1.3rem" }}>
                  Imam Khomeini
                </strong>{" "}
                was not only a revolutionary leader and political figure, but
                also a deeply spiritual person who expressed his devotion
                through poetry.
              </p>
              <p style={{ fontSize: "1.05rem", marginBottom: "20px" }}>
                His poems reflect themes of divine love, mysticism, and
                spiritual awakening, drawing from the rich tradition of Persian
                Sufi poetry.
              </p>
              <p style={{ fontSize: "1.05rem", marginBottom: "20px" }}>
                This collection allows you to explore the spiritual and artistic
                dimension of Imam Khomeini's legacy through his verses.
              </p>
              <div
                style={{
                  height: "1px",
                  background: "rgba(255, 216, 155, 0.3)",
                  margin: "30px 0",
                }}
              />
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#b0b0b0",
                  textAlign: "center",
                }}
              >
                <strong>Credits:</strong> Developed by ULAMA
                <br />
                All content is sourced from publicly available historical and
                scholarly materials.
              </p>
            </div>

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
                <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                  ULAMA
                </span>{" "}
                | All rights reserved
              </p>
              <p style={{ color: "#666", fontSize: "0.85rem" }}>
                {viewedPoems.length} poems viewed this session
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
