"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

export default function ImamKhomeiniHadithPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"adab" | "forty">("adab");

  // Adab Al-Salat state (from anotherbook folder)
  const [selectedAdabTopic, setSelectedAdabTopic] = useState<string>(
    "Avoiding Moral Impurity"
  );
  const [adabImageIndex, setAdabImageIndex] = useState(0);
  const [showAdabThumbnails, setShowAdabThumbnails] = useState(false);

  // Forty Hadith state (from 40hadith folder)
  const [selectedFortyTopic, setSelectedFortyTopic] =
    useState<string>("Al Nafs");
  const [fortyImageIndex, setFortyImageIndex] = useState(0);
  const [showFortyThumbnails, setShowFortyThumbnails] = useState(false);

  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Adab Al-Salat topics (from anotherbook folder)
  const adabTopics = [
    "Avoiding Moral Impurity",
    "Four Level Of Spiritual Covering",
    "How To Achieve Presence Of Heart",
    "Mystic Reality Of The Prayer Place Is The Inner Place",
    "Prayer-Is-Accepted-Depending-On-Presence-Of-Heart",
    "Strive To Achieve Presence Of Heart",
    "The Mysteries Of Prayer Times",
    "The Path Of Purification Of The Heart",
    "The Reality Of Adhan And Iqamah",
    "Three Level Of Knowing The Place Of Prayer",
    "Three Level Of Purification",
    "What-Is-The-Inner-Reality-Of-Wudu",
    "Wudu And Prophet Adam",
  ];

  // Forty Hadith topics (from 40hadith folder)
  const fortyTopics = ["Al Nafs", "Kibr"];

  // UPDATED: Exact image counts for each Adab topic
  // TODO: Count your actual images in each folder and update these numbers!
  const getAdabImageCount = (topic: string) => {
    const imageCounts: { [key: string]: number } = {
      "Avoiding Moral Impurity": 7, // UPDATE: count files in your folder
      "Four Level Of Spiritual Covering": 7, // UPDATE
      "How To Achieve Presence Of Heart": 7, // UPDATE
      "Mystic Reality Of The Prayer Place Is The Inner Place": 7, // UPDATE
      "Prayer Is Accepted Depending On Presence Of Heart": 12, // UPDATE
      "Strive To Achieve Presence Of Heart": 12, // UPDATE
      "The Mysteries Of Prayer Times": 8, // UPDATE
      "The Path Of Purification Of The Heart": 8, // UPDATE
      "The Reality Of Adhan And Iqamah": 8, // UPDATE
      "Three Level Of Knowing The Place Of Prayer": 7, // UPDATE
      "Three Level Of Purification": 7, // UPDATE
      "What Is The Inner Reality Of Wudu": 7, // UPDATE
      "Wudu And Prophet Adam": 14, // UPDATE
    };

    return imageCounts[topic] || 10; // Default to 10 if not found
  };

  // Count images for Forty Hadith topics
  const getFortyImageCount = (topic: string) => {
    if (topic === "Al Nafs") return 14;
    if (topic === "Kibr") return 12; // UPDATE: count files in your Kibr folder
    return 10;
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleAdabTopicSelect = (topic: string) => {
    setSelectedAdabTopic(topic);
    setAdabImageIndex(0);
    if (user) {
      addToHistory(user.username, `Adab Al-Salat: ${topic}`);
    }
  };

  const handleFortyTopicSelect = (topic: string) => {
    setSelectedFortyTopic(topic);
    setFortyImageIndex(0);
    if (user) {
      addToHistory(user.username, `Forty Hadith: ${topic}`);
    }
  };

  const handleSavePage = async (pageTitle: string, pageContent: string) => {
    if (!user) {
      alert("Please login to save pages!");
      router.push("/login");
      return;
    }

    try {
      const result = await saveQuote(user.username, pageTitle, pageContent);
      if (result.success) {
        alert("Page saved successfully!");
      } else {
        alert(result.message || "Page already saved");
      }
    } catch (error) {
      console.error("Error saving page:", error);
    }
  };

  const handleAddNote = async (pageTitle: string) => {
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
      await addNote(user.username, pageTitle, noteText);
      alert("Note saved!");
      setAddingNoteFor(null);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Adab images from anotherbook folder - encode spaces in folder names
  const currentAdabImages = Array.from(
    { length: getAdabImageCount(selectedAdabTopic) },
    (_, i) =>
      `/images/anotherbook/${encodeURIComponent(selectedAdabTopic)}/${
        i + 1
      }.jpeg`
  );

  // Forty Hadith images from 40hadith folder
  const currentFortyImages = Array.from(
    { length: getFortyImageCount(selectedFortyTopic) },
    (_, i) => `/images/40hadith/${selectedFortyTopic}/${i + 1}.jpg`
  );

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
            padding: "30px 20px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.8rem",
              fontWeight: "900",
              marginBottom: "10px",
              letterSpacing: "1px",
              color: "white",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            📚 Illustrated Spiritual Works
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#e0e0e0",
              fontWeight: "300",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            Explore the teachings of Imam Khomeini visually, through illustrated
            explanations
            <br />
            of each moral and spiritual hadith
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {[
            { id: "adab" as const, label: "🕌 Adab Al-Salat" },
            { id: "forty" as const, label: "📖 Forty Hadith" },
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

        {/* ADAB AL-SALAT TAB (anotherbook folder) */}
        {activeTab === "adab" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Choose a Topic
            </h2>

            {/* Topic Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "40px",
              }}
            >
              {adabTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAdabTopicSelect(topic)}
                  style={{
                    padding: "15px 20px",
                    background:
                      selectedAdabTopic === topic
                        ? "rgba(255, 216, 155, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${
                      selectedAdabTopic === topic
                        ? "rgba(255, 216, 155, 0.4)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                    borderRadius: "10px",
                    color: selectedAdabTopic === topic ? "#ffd89b" : "white",
                    cursor: "pointer",
                    fontWeight: selectedAdabTopic === topic ? "600" : "400",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 216, 155, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAdabTopic !== topic) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>

            {currentAdabImages.length > 0 && (
              <div>
                <div
                  style={{
                    padding: "15px",
                    background: "rgba(25, 84, 123, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "12px",
                    color: "white",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  📚 <strong>{selectedAdabTopic}</strong>
                  <div
                    style={{
                      color: "#d0d0d0",
                      fontStyle: "italic",
                      marginTop: "5px",
                    }}
                  >
                    Total {currentAdabImages.length} illustrated pages
                  </div>
                </div>

                {/* Navigation Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() =>
                      setAdabImageIndex(Math.max(0, adabImageIndex - 1))
                    }
                    disabled={adabImageIndex === 0}
                    style={{
                      padding: "10px 20px",
                      background:
                        adabImageIndex === 0
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: adabImageIndex === 0 ? "#666" : "white",
                      cursor: adabImageIndex === 0 ? "not-allowed" : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    &larr; Previous
                  </button>

                  <div
                    style={{
                      color: "#ffd89b",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    Page {adabImageIndex + 1} of {currentAdabImages.length}
                  </div>

                  <button
                    onClick={() =>
                      setAdabImageIndex(
                        Math.min(
                          currentAdabImages.length - 1,
                          adabImageIndex + 1
                        )
                      )
                    }
                    disabled={adabImageIndex === currentAdabImages.length - 1}
                    style={{
                      padding: "10px 20px",
                      background:
                        adabImageIndex === currentAdabImages.length - 1
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color:
                        adabImageIndex === currentAdabImages.length - 1
                          ? "#666"
                          : "white",
                      cursor:
                        adabImageIndex === currentAdabImages.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Next &rarr;
                  </button>
                </div>

                {/* Main Image */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "15px",
                    padding: "20px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  <img
                    src={currentAdabImages[adabImageIndex]}
                    alt={`Page ${adabImageIndex + 1}`}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "12px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                    }}
                    onError={(e) => {
                      console.error(
                        "Image failed to load:",
                        currentAdabImages[adabImageIndex]
                      );
                    }}
                  />
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        ((adabImageIndex + 1) / currentAdabImages.length) * 100
                      }%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #19547b 0%, #ffd89b 100%)",
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {user && (
                    <>
                      <button
                        onClick={() =>
                          handleSavePage(
                            `${selectedAdabTopic} - Page ${adabImageIndex + 1}`,
                            `Saved page ${
                              adabImageIndex + 1
                            } of ${selectedAdabTopic}`
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
                        💾 Save Page
                      </button>

                      <button
                        onClick={() =>
                          setAddingNoteFor(
                            `${selectedAdabTopic} - Page ${adabImageIndex + 1}`
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
                        📝 Add Note
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      alert(`Bookmarked page ${adabImageIndex + 1}`)
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
                    🔖 Bookmark
                  </button>
                </div>

                {/* Add Note Form */}
                {addingNoteFor ===
                  `${selectedAdabTopic} - Page ${adabImageIndex + 1}` && (
                  <div style={{ marginBottom: "20px" }}>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Your reflection on this page..."
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
                        onClick={() =>
                          handleAddNote(
                            `${selectedAdabTopic} - Page ${adabImageIndex + 1}`
                          )
                        }
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

                {/* Thumbnails Toggle */}
                <div style={{ marginTop: "30px" }}>
                  <button
                    onClick={() => setShowAdabThumbnails(!showAdabThumbnails)}
                    style={{
                      padding: "10px 20px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: "white",
                      cursor: "pointer",
                      marginBottom: "20px",
                    }}
                  >
                    {showAdabThumbnails ? "Hide" : "Show"} Thumbnails
                  </button>

                  {showAdabThumbnails && (
                    <div>
                      <h4
                        style={{
                          color: "#ffd89b",
                          textAlign: "center",
                          marginBottom: "15px",
                        }}
                      >
                        Quick Navigation
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(120px, 1fr))",
                          gap: "15px",
                        }}
                      >
                        {currentAdabImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setAdabImageIndex(idx)}
                            style={{
                              cursor: "pointer",
                              border:
                                idx === adabImageIndex
                                  ? "2px solid #ffd89b"
                                  : "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "8px",
                              padding: "5px",
                              background: "rgba(255, 255, 255, 0.05)",
                              textAlign: "center",
                            }}
                          >
                            <img
                              src={img}
                              alt={`Thumb ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "5px",
                                marginBottom: "5px",
                              }}
                            />
                            <div
                              style={{ color: "#ffd89b", fontSize: "0.85rem" }}
                            >
                              Page {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FORTY HADITH TAB (40hadith folder) */}
        {activeTab === "forty" && (
          <div>
            <h2
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: "30px",
                fontFamily: "'Lora', serif",
              }}
            >
              Choose a Topic
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "40px",
              }}
            >
              {fortyTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFortyTopicSelect(topic)}
                  style={{
                    padding: "15px 20px",
                    background:
                      selectedFortyTopic === topic
                        ? "rgba(255, 216, 155, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${
                      selectedFortyTopic === topic
                        ? "rgba(255, 216, 155, 0.4)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                    borderRadius: "10px",
                    color: selectedFortyTopic === topic ? "#ffd89b" : "white",
                    cursor: "pointer",
                    fontWeight: selectedFortyTopic === topic ? "600" : "400",
                    transition: "all 0.3s ease",
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Same image viewer structure for Forty Hadith */}
            {currentFortyImages.length > 0 && (
              <div>
                <div
                  style={{
                    padding: "15px",
                    background: "rgba(25, 84, 123, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "12px",
                    color: "white",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  📚 <strong>{selectedFortyTopic}</strong>
                  <div
                    style={{
                      color: "#d0d0d0",
                      fontStyle: "italic",
                      marginTop: "5px",
                    }}
                  >
                    Total {currentFortyImages.length} illustrated pages
                  </div>
                </div>

                {/* Copy same navigation/image display from Adab tab but with fortyImageIndex */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() =>
                      setFortyImageIndex(Math.max(0, fortyImageIndex - 1))
                    }
                    disabled={fortyImageIndex === 0}
                    style={{
                      padding: "10px 20px",
                      background:
                        fortyImageIndex === 0
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: fortyImageIndex === 0 ? "#666" : "white",
                      cursor: fortyImageIndex === 0 ? "not-allowed" : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    &larr; Previous
                  </button>

                  <div
                    style={{
                      color: "#ffd89b",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    Page {fortyImageIndex + 1} of {currentFortyImages.length}
                  </div>

                  <button
                    onClick={() =>
                      setFortyImageIndex(
                        Math.min(
                          currentFortyImages.length - 1,
                          fortyImageIndex + 1
                        )
                      )
                    }
                    disabled={fortyImageIndex === currentFortyImages.length - 1}
                    style={{
                      padding: "10px 20px",
                      background:
                        fortyImageIndex === currentFortyImages.length - 1
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color:
                        fortyImageIndex === currentFortyImages.length - 1
                          ? "#666"
                          : "white",
                      cursor:
                        fortyImageIndex === currentFortyImages.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Next &rarr;
                  </button>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "15px",
                    padding: "20px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  <img
                    src={currentFortyImages[fortyImageIndex]}
                    alt={`Page ${fortyImageIndex + 1}`}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "12px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                    }}
                  />
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        ((fortyImageIndex + 1) / currentFortyImages.length) *
                        100
                      }%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #19547b 0%, #ffd89b 100%)",
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>
              </div>
            )}
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
          <p style={{ color: "#666", fontSize: "0.85rem" }}>Powered by Ulama</p>
        </div>
      </div>
    </div>
  );
}
