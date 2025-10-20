"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserSubscription } from "@/lib/subscriptionHelper";
import {
  addToLibrary,
  removeFromLibrary,
  toggleFavorite,
  isInLibrary,
} from "@/lib/libraryHelper";

interface Audiobook {
  id: number;
  title: string;
  title_arabic?: string;
  author: string;
  author_arabic?: string;
  description?: string;
  category: string;
  language: string;
  premium: boolean;
  duration: string;
  duration_seconds: number;
  voices: any[];
  created_at: string;
}

export default function AudiobooksPage() {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [libraryStatus, setLibraryStatus] = useState<{
    [key: number]: { inLibrary: boolean; isFavorite: boolean };
  }>({});

  const categories = [
    "All",
    "Hadith",
    "Spirituality",
    "Dua",
    "Tafsir",
    "Fiqh",
    "History",
    "Biography",
    "Poetry",
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchAudiobooks();
    checkSubscription();
  }, []);

  useEffect(() => {
    if (user && audiobooks.length > 0) {
      checkLibraryStatus();
    }
  }, [user, audiobooks]);

  const fetchAudiobooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audiobooks/list");
      const data = await response.json();

      if (data.success) {
        setAudiobooks(data.audiobooks);
      }
    } catch (error) {
      console.error("Error fetching audiobooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.email) {
        const subscription = await getUserSubscription(user.email);
        setIsPremium(subscription.isPremium);
      }
    }
  };

  const checkLibraryStatus = async () => {
    if (!user) return;

    const statusMap: {
      [key: number]: { inLibrary: boolean; isFavorite: boolean };
    } = {};

    for (const book of audiobooks) {
      const status = await isInLibrary(user.email, book.id.toString());
      statusMap[book.id] = status;
    }

    setLibraryStatus(statusMap);
  };

  const handleAddToLibrary = async (
    e: React.MouseEvent,
    audiobookId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to save audiobooks");
      return;
    }

    const result = await addToLibrary(user.email, audiobookId.toString());
    if (result.success) {
      setLibraryStatus({
        ...libraryStatus,
        [audiobookId]: { inLibrary: true, isFavorite: false },
      });
    }
  };

  const handleRemoveFromLibrary = async (
    e: React.MouseEvent,
    audiobookId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    const result = await removeFromLibrary(user.email, audiobookId.toString());
    if (result.success) {
      setLibraryStatus({
        ...libraryStatus,
        [audiobookId]: { inLibrary: false, isFavorite: false },
      });
    }
  };

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    audiobookId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to favorite audiobooks");
      return;
    }

    const currentStatus = libraryStatus[audiobookId];
    if (!currentStatus?.inLibrary) {
      // Add to library first
      await addToLibrary(user.email, audiobookId.toString(), true);
      setLibraryStatus({
        ...libraryStatus,
        [audiobookId]: { inLibrary: true, isFavorite: true },
      });
    } else {
      // Toggle favorite
      const newFavoriteStatus = !currentStatus.isFavorite;
      const result = await toggleFavorite(
        user.email,
        audiobookId.toString(),
        newFavoriteStatus
      );
      if (result.success) {
        setLibraryStatus({
          ...libraryStatus,
          [audiobookId]: { inLibrary: true, isFavorite: newFavoriteStatus },
        });
      }
    }
  };

  const filteredAudiobooks = audiobooks.filter((book) => {
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "clamp(20px, 4vw, 40px) 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(30px, 6vw, 50px)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "15px",
              lineHeight: "1.2",
            }}
          >
            🎧 Audiobook Library
          </h1>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              marginBottom: "20px",
            }}
          >
            Listen to Islamic spiritual works narrated with AI voices
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <Link
              href="/subscription"
              style={{
                display: "inline-block",
                padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                background: isPremium
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #ffd89b, #f59e0b)",
                borderRadius: "12px",
                color: isPremium ? "white" : "#000",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                boxShadow: "0 4px 15px rgba(255, 216, 155, 0.3)",
              }}
            >
              {isPremium ? "⚙️ Manage Subscription" : "⭐ Upgrade to Premium"}
            </Link>

            {user && (
              <Link
                href="/my-library"
                style={{
                  display: "inline-block",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                  background: "rgba(147, 197, 253, 0.2)",
                  border: "1px solid rgba(147, 197, 253, 0.4)",
                  borderRadius: "12px",
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                }}
              >
                📚 My Library
              </Link>
            )}
          </div>

          {isPremium && (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                  background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                  borderRadius: "12px",
                  color: "#000",
                  fontWeight: "700",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  boxShadow: "0 4px 15px rgba(255, 216, 155, 0.3)",
                }}
              >
                ⭐ Premium Member - Unlimited Access
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <input
            type="text"
            placeholder="🔍 Search audiobooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "clamp(12px, 2.5vw, 15px) 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 216, 155, 0.3)",
              borderRadius: "12px",
              color: "white",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              outline: "none",
            }}
          />
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "clamp(30px, 6vw, 50px)",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px)",
                background:
                  selectedCategory === category
                    ? "linear-gradient(135deg, #19547b, #ffd89b)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  selectedCategory === category
                    ? "2px solid rgba(255, 216, 155, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "25px",
                color: selectedCategory === category ? "white" : "#d0d0d0",
                cursor: "pointer",
                fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)",
                fontWeight: selectedCategory === category ? "700" : "500",
                transition: "all 0.3s",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: "clamp(50px, 10vw, 60px)",
                height: "clamp(50px, 10vw, 60px)",
                border: "5px solid rgba(255, 216, 155, 0.2)",
                borderTop: "5px solid #ffd89b",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{ color: "#d0d0d0", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}
            >
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

        {/* No Results */}
        {!loading && filteredAudiobooks.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                fontSize: "clamp(3rem, 8vw, 4rem)",
                marginBottom: "20px",
              }}
            >
              📚
            </div>
            <h2
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                marginBottom: "10px",
              }}
            >
              No audiobooks found
            </h2>
            <p style={{ color: "#999", fontSize: "clamp(0.9rem, 2vw, 1rem)" }}>
              {searchQuery
                ? "Try a different search term"
                : audiobooks.length === 0
                ? "No audiobooks have been added yet"
                : "Try selecting a different category"}
            </p>
          </div>
        )}

        {/* Audiobooks Grid */}
        {!loading && filteredAudiobooks.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
              gap: "clamp(20px, 4vw, 30px)",
            }}
          >
            {filteredAudiobooks.map((book) => {
              const status = libraryStatus[book.id] || {
                inLibrary: false,
                isFavorite: false,
              };

              return (
                <Link
                  key={book.id}
                  href={`/audiobooks/${book.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 216, 155, 0.2)",
                      borderRadius: "15px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      height: "100%",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 216, 155, 0.6)";
                      e.currentTarget.style.boxShadow =
                        "0 15px 40px rgba(255, 216, 155, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 216, 155, 0.2)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Cover Image */}
                    <div
                      style={{
                        width: "100%",
                        height: "clamp(220px, 40vw, 280px)",
                        background: `linear-gradient(135deg, rgba(25, 84, 123, 0.4), rgba(255, 216, 155, 0.4)), url('/images/bahjatbook.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                      }}
                    >
                      {/* Action Buttons - Top Right */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          display: "flex",
                          gap: "8px",
                          zIndex: 10,
                        }}
                      >
                        {/* Favorite Button */}
                        {user && (
                          <button
                            onClick={(e) => handleToggleFavorite(e, book.id)}
                            style={{
                              background: "rgba(0, 0, 0, 0.7)",
                              border: "none",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              cursor: "pointer",
                              fontSize: "1.3rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s",
                            }}
                          >
                            {status.isFavorite ? "❤️" : "🤍"}
                          </button>
                        )}

                        {/* Library Button */}
                        {user && (
                          <button
                            onClick={(e) =>
                              status.inLibrary
                                ? handleRemoveFromLibrary(e, book.id)
                                : handleAddToLibrary(e, book.id)
                            }
                            style={{
                              background: status.inLibrary
                                ? "rgba(134, 239, 172, 0.3)"
                                : "rgba(0, 0, 0, 0.7)",
                              border: status.inLibrary
                                ? "2px solid #86efac"
                                : "none",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s",
                            }}
                          >
                            {status.inLibrary ? "✅" : "📚"}
                          </button>
                        )}
                      </div>

                      {book.premium && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            padding: "8px 16px",
                            background:
                              "linear-gradient(135deg, #ffd89b, #f59e0b)",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "800",
                            color: "#000",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          ⭐ PREMIUM
                        </div>
                      )}

                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          left: "10px",
                          padding: "8px 14px",
                          background: "rgba(0, 0, 0, 0.75)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "10px",
                          fontSize: "0.9rem",
                          color: "#86efac",
                          fontWeight: "700",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        ⏱️ {book.duration}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "clamp(20px, 4vw, 25px)" }}>
                      <h3
                        style={{
                          color: "#ffd89b",
                          fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                          fontWeight: "800",
                          marginBottom: "8px",
                          lineHeight: "1.3",
                        }}
                      >
                        {book.title}
                      </h3>

                      {book.title_arabic && (
                        <p
                          style={{
                            color: "#93c5fd",
                            fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                            marginBottom: "15px",
                            direction: "rtl",
                            fontWeight: "600",
                          }}
                        >
                          {book.title_arabic}
                        </p>
                      )}

                      <p
                        style={{
                          color: "#d0d0d0",
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          marginBottom: "15px",
                          fontWeight: "500",
                        }}
                      >
                        📝 By {book.author}
                        {book.author_arabic && ` • ${book.author_arabic}`}
                      </p>

                      {book.description && (
                        <div
                          style={{
                            marginBottom: "18px",
                            padding: "clamp(12px, 2.5vw, 15px)",
                            background: "rgba(255, 255, 255, 0.03)",
                            borderRadius: "10px",
                            borderLeft: "3px solid rgba(255, 216, 155, 0.5)",
                          }}
                        >
                          <p
                            style={{
                              color: "#b0b0b0",
                              fontSize: "clamp(0.85rem, 1.8vw, 0.9rem)",
                              lineHeight: "1.6",
                              margin: 0,
                            }}
                          >
                            {book.description.substring(0, 140)}
                            {book.description.length > 140 ? "..." : ""}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "15px",
                        }}
                      >
                        <span
                          style={{
                            color: "#93c5fd",
                            fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                            padding: "6px 12px",
                            background: "rgba(147, 197, 253, 0.15)",
                            border: "1px solid rgba(147, 197, 253, 0.3)",
                            borderRadius: "8px",
                            fontWeight: "600",
                          }}
                        >
                          📚 {book.category}
                        </span>

                        <span
                          style={{
                            color: "#86efac",
                            fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                            padding: "6px 12px",
                            background: "rgba(134, 239, 172, 0.15)",
                            border: "1px solid rgba(134, 239, 172, 0.3)",
                            borderRadius: "8px",
                            fontWeight: "600",
                          }}
                        >
                          🌍{" "}
                          {book.language.charAt(0).toUpperCase() +
                            book.language.slice(1)}
                        </span>

                        {status.inLibrary && (
                          <span
                            style={{
                              color: "#86efac",
                              fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                              padding: "6px 12px",
                              background: "rgba(134, 239, 172, 0.2)",
                              border: "1px solid rgba(134, 239, 172, 0.4)",
                              borderRadius: "8px",
                              fontWeight: "700",
                            }}
                          >
                            ✅ In Library
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          paddingTop: "15px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffd89b",
                            fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                            fontWeight: "700",
                          }}
                        >
                          🎙️ {book.voices.length}{" "}
                          {book.voices.length === 1
                            ? "AI Voice Available"
                            : "AI Voices Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && audiobooks.length > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "clamp(40px, 8vw, 60px)",
              paddingTop: "clamp(20px, 4vw, 30px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <p
              style={{
                color: "#999",
                fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              }}
            >
              Showing {filteredAudiobooks.length} of {audiobooks.length}{" "}
              audiobooks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
