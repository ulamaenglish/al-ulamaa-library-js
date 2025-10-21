"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSubscription } from "@/lib/subscriptionHelper";

interface ChapterAudio {
  chapterNumber: number;
  chapterTitle: string;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
}

interface Voice {
  id: number;
  voice_id: string;
  voice_name: string;
  audio_file_url?: string;
  chapters?: ChapterAudio[];
  total_duration?: string;
  total_duration_seconds?: number;
  language: string;
}

interface Chapter {
  id: number;
  title: string;
  chapter_order: number;
  start_time: string;
  start_seconds: number;
}

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
  voices: Voice[];
  chapters: Chapter[];
  created_at: string;
}

export default function AudiobookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const audiobookId = params.id;
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (audiobookId) {
      fetchAudiobook();
      checkAccess();
    }
  }, [audiobookId]);

  useEffect(() => {
    if (selectedVoice && audioRef.current && hasAccess) {
      const chapters = selectedVoice.chapters;
      if (chapters && chapters.length > 0) {
        audioRef.current.src = chapters[currentChapterIndex].audioUrl;
        audioRef.current.load();
      } else if (selectedVoice.audio_file_url) {
        audioRef.current.src = selectedVoice.audio_file_url;
        audioRef.current.load();
      }
    }
  }, [selectedVoice, currentChapterIndex, hasAccess]);

  // Add this new useEffect to save progress every 5 seconds
  useEffect(() => {
    if (!selectedVoice || !hasAccess || !audioRef.current) return;

    const saveProgress = async () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user.id) return;

      try {
        // Save to user_audiobook_progress
        const response = await fetch("/api/audiobooks/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            audiobook_id: audiobookId,
            voice_id: selectedVoice.voice_id,
            current_time_seconds: Math.floor(audio.currentTime),
            completed: audio.currentTime >= audio.duration - 5,
          }),
        });

        if (!response.ok) {
          console.error("Failed to save progress");
        }
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    // Save progress every 5 seconds while playing
    const interval = setInterval(saveProgress, 5000);

    return () => clearInterval(interval);
  }, [selectedVoice, hasAccess, audiobookId]);

  const checkAccess = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setHasAccess(false);
      return;
    }

    const user = JSON.parse(userStr);
    if (!user.email) {
      setHasAccess(false);
      return;
    }

    try {
      const subscription = await getUserSubscription(user.email);
      setIsPremium(subscription.isPremium);

      // Fetch audiobook to check if it's premium
      const response = await fetch(`/api/audiobooks/${audiobookId}`);
      const data = await response.json();

      if (data.success) {
        const audiobookData = data.audiobook;

        // Grant access if:
        // 1. Book is not premium, OR
        // 2. User has premium subscription
        if (!audiobookData.premium || subscription.isPremium) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    }
  };

  const fetchAudiobook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/audiobooks/${audiobookId}`);
      const data = await response.json();

      if (data.success) {
        setAudiobook(data.audiobook);
        if (data.audiobook.voices && data.audiobook.voices.length > 0) {
          setSelectedVoice(data.audiobook.voices[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching audiobook:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = (index: number) => {
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentChapterIndex(index);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleAudioEnded = () => {
    if (
      selectedVoice?.chapters &&
      currentChapterIndex < selectedVoice.chapters.length - 1
    ) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 500);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayAttempt = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (!hasAccess && audiobook?.premium) {
      e.preventDefault();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setShowUpgradeModal(true);
    }
  };

  if (loading) {
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
        <div style={{ textAlign: "center" }}>
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
          <p style={{ color: "#d0d0d0", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>
            Loading audiobook...
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
      </div>
    );
  }

  if (!audiobook) {
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
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "clamp(3rem, 8vw, 5rem)", marginBottom: "20px" }}
          >
            ❌
          </div>
          <h2
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              marginBottom: "15px",
            }}
          >
            Audiobook Not Found
          </h2>
          <Link
            href="/audiobooks"
            style={{
              display: "inline-block",
              padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)",
              background: "linear-gradient(135deg, #19547b, #ffd89b)",
              borderRadius: "10px",
              color: "white",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
            }}
          >
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const currentChapter = selectedVoice?.chapters?.[currentChapterIndex];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "clamp(20px, 4vw, 40px) 20px",
      }}
    >
      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #000000 100%)",
              borderRadius: "20px",
              padding: "clamp(30px, 6vw, 50px)",
              maxWidth: "500px",
              width: "100%",
              border: "2px solid rgba(255, 216, 155, 0.3)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "clamp(3rem, 8vw, 4rem)",
                marginBottom: "20px",
              }}
            >
              🔒
            </div>

            <h2
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "900",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              Premium Content
            </h2>

            <p
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                textAlign: "center",
                marginBottom: "30px",
                lineHeight: "1.6",
              }}
            >
              This audiobook requires a Premium subscription to access. Upgrade
              now to unlock unlimited audiobooks!
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={() => router.push("/subscription")}
                style={{
                  width: "100%",
                  padding: "clamp(14px, 3vw, 18px)",
                  background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#000",
                  fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ⭐ Upgrade to Premium
              </button>

              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 2.5vw, 14px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "#d0d0d0",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Back Button */}
        <Link
          href="/audiobooks"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffd89b",
            textDecoration: "none",
            fontSize: "clamp(0.9rem, 2vw, 1rem)",
            marginBottom: "clamp(20px, 4vw, 30px)",
          }}
        >
          ← Back to Library
        </Link>

        {/* Audiobook Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
            gap: "clamp(25px, 5vw, 40px)",
            marginBottom: "clamp(30px, 6vw, 50px)",
          }}
        >
          {/* Cover Image */}
          <div>
            <div
              style={{
                width: "100%",
                maxWidth: "350px",
                height: "clamp(300px, 50vw, 350px)",
                margin: "0 auto",
                background: `linear-gradient(135deg, rgba(25, 84, 123, 0.4), rgba(255, 216, 155, 0.4)), url('/images/bahjatbook.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "15px",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              {audiobook.premium && (
                <div
                  style={{
                    position: "absolute",
                    top: "clamp(10px, 2vw, 15px)",
                    right: "clamp(10px, 2vw, 15px)",
                    padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)",
                    background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                    borderRadius: "20px",
                    fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                    fontWeight: "800",
                    color: "#000",
                  }}
                >
                  ⭐ PREMIUM
                </div>
              )}

              {!hasAccess && audiobook.premium && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}>🔒</div>
                  <div
                    style={{
                      color: "#ffd89b",
                      fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                      fontWeight: "700",
                      textAlign: "center",
                      padding: "0 20px",
                    }}
                  >
                    Premium Only
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1
              style={{
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                fontWeight: "900",
                color: "#ffd89b",
                marginBottom: "15px",
                lineHeight: "1.2",
              }}
            >
              {audiobook.title}
            </h1>

            {audiobook.title_arabic && (
              <h2
                style={{
                  fontSize: "clamp(1.3rem, 4vw, 2rem)",
                  color: "#93c5fd",
                  marginBottom: "20px",
                  direction: "rtl",
                  fontWeight: "700",
                }}
              >
                {audiobook.title_arabic}
              </h2>
            )}

            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: "#d0d0d0",
                marginBottom: "25px",
                fontWeight: "500",
              }}
            >
              📝 By {audiobook.author}
              {audiobook.author_arabic && ` • ${audiobook.author_arabic}`}
            </p>

            {/* Info Badges */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "clamp(8px, 2vw, 12px)",
                marginBottom: "clamp(20px, 4vw, 30px)",
              }}
            >
              <span
                style={{
                  padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 3vw, 18px)",
                  background: "rgba(147, 197, 253, 0.15)",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  borderRadius: "10px",
                  color: "#93c5fd",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  fontWeight: "600",
                }}
              >
                📚 {audiobook.category}
              </span>

              <span
                style={{
                  padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 3vw, 18px)",
                  background: "rgba(134, 239, 172, 0.15)",
                  border: "1px solid rgba(134, 239, 172, 0.3)",
                  borderRadius: "10px",
                  color: "#86efac",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  fontWeight: "600",
                }}
              >
                ⏱️ {selectedVoice?.total_duration || audiobook.duration}
              </span>

              <span
                style={{
                  padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 3vw, 18px)",
                  background: "rgba(255, 216, 155, 0.15)",
                  border: "1px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "10px",
                  color: "#ffd89b",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  fontWeight: "600",
                }}
              >
                🌍{" "}
                {audiobook.language.charAt(0).toUpperCase() +
                  audiobook.language.slice(1)}
              </span>
            </div>

            {/* Description */}
            {audiobook.description && (
              <div
                style={{
                  padding: "clamp(15px, 3vw, 20px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  borderLeft: "4px solid rgba(255, 216, 155, 0.5)",
                }}
              >
                <p
                  style={{
                    color: "#d0d0d0",
                    fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                    lineHeight: "1.8",
                    margin: 0,
                  }}
                >
                  {audiobook.description}
                </p>
              </div>
            )}

            {/* Access Warning for Premium Books */}
            {!hasAccess && audiobook.premium && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "clamp(15px, 3vw, 20px)",
                  background: "rgba(245, 87, 108, 0.1)",
                  border: "1px solid rgba(245, 87, 108, 0.3)",
                  borderRadius: "12px",
                }}
              >
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🔒</span>
                  <span>This audiobook requires a Premium subscription</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Voice Selection */}
        {audiobook.voices.length > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "15px",
              padding: "clamp(20px, 4vw, 30px)",
              marginBottom: "clamp(30px, 5vw, 40px)",
              opacity: !hasAccess && audiobook.premium ? 0.5 : 1,
              pointerEvents: !hasAccess && audiobook.premium ? "none" : "auto",
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              🎙️ Select Narrator Voice
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
                gap: "15px",
              }}
            >
              {audiobook.voices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => {
                    if (hasAccess || !audiobook.premium) {
                      setSelectedVoice(voice);
                      setCurrentChapterIndex(0);
                      setIsPlaying(false);
                    } else {
                      setShowUpgradeModal(true);
                    }
                  }}
                  style={{
                    padding: "clamp(14px, 3vw, 18px)",
                    background:
                      selectedVoice?.id === voice.id
                        ? "linear-gradient(135deg, rgba(255, 216, 155, 0.2), rgba(25, 84, 123, 0.2))"
                        : "rgba(255, 255, 255, 0.03)",
                    border:
                      selectedVoice?.id === voice.id
                        ? "2px solid rgba(255, 216, 155, 0.6)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}>
                      {selectedVoice?.id === voice.id ? "✅" : "⭕"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color:
                            selectedVoice?.id === voice.id
                              ? "#ffd89b"
                              : "#d0d0d0",
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          fontWeight: "700",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {voice.voice_name}
                      </div>
                      <div
                        style={{
                          color: "#999",
                          fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                        }}
                      >
                        {voice.language}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Player */}
        {selectedVoice && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "15px",
              padding: "clamp(20px, 4vw, 30px)",
              marginBottom: "clamp(30px, 5vw, 40px)",
              position: "relative",
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              🎧 Audio Player
            </h3>

            {currentChapter && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  color: "#93c5fd",
                  fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                }}
              >
                <strong>Now Playing:</strong>{" "}
                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                  }}
                >
                  {currentChapter.chapterTitle}
                </span>
              </div>
            )}

            {/* Lock Overlay for Premium Content */}
            {!hasAccess && audiobook.premium && (
              <div
                onClick={() => setShowUpgradeModal(true)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  borderRadius: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                      marginBottom: "15px",
                    }}
                  >
                    🔒
                  </div>
                  <div
                    style={{
                      color: "#ffd89b",
                      fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                  >
                    Unlock Premium Content
                  </div>
                  <div
                    style={{
                      color: "#d0d0d0",
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    }}
                  >
                    Click to upgrade your subscription
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              <audio
                ref={audioRef}
                controls
                controlsList={
                  !hasAccess && audiobook.premium
                    ? "nodownload noplaybackrate"
                    : undefined
                }
                onPlay={handlePlayAttempt}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  height: "clamp(50px, 10vw, 60px)",
                  borderRadius: "10px",
                  pointerEvents:
                    !hasAccess && audiobook.premium ? "none" : "auto",
                }}
              >
                Your browser does not support the audio element.
              </audio>

              <p
                style={{
                  color: "#93c5fd",
                  marginTop: "15px",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                }}
              >
                Voice: <strong>{selectedVoice.voice_name}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Chapters */}
        {selectedVoice?.chapters && selectedVoice.chapters.length > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "15px",
              padding: "clamp(20px, 4vw, 30px)",
              opacity: !hasAccess && audiobook.premium ? 0.5 : 1,
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              📖 Chapters ({selectedVoice.chapters.length})
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {selectedVoice.chapters.map((chapter, index) => (
                <div
                  key={index}
                  onClick={() => handleChapterSelect(index)}
                  style={{
                    padding: "clamp(12px, 3vw, 18px)",
                    background:
                      currentChapterIndex === index
                        ? "rgba(255, 216, 155, 0.15)"
                        : "rgba(255, 255, 255, 0.03)",
                    border:
                      currentChapterIndex === index
                        ? "2px solid rgba(255, 216, 155, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(10px, 2vw, 15px)",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        color: "#ffd89b",
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {currentChapterIndex === index && hasAccess
                        ? "▶️"
                        : !hasAccess && audiobook.premium
                        ? "🔒"
                        : `${chapter.chapterNumber}.`}
                    </span>
                    <span
                      style={{
                        color:
                          currentChapterIndex === index ? "#ffd89b" : "#d0d0d0",
                        fontSize: "clamp(0.85rem, 2vw, 1rem)",
                        fontWeight:
                          currentChapterIndex === index ? "700" : "400",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chapter.chapterTitle}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#93c5fd",
                      fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                      flexShrink: 0,
                    }}
                  >
                    {chapter.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
