"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Particles from "@/components/Particles";
import { ziyaratList, Ziyarat } from "../data/ziyarat-list";
import {
  saveQuote,
  addNote,
  addToHistory,
  addListeningHistory,
  getListeningHistory,
  getUserStats,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from "@/lib/database";

export default function ZiyaratDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [user, setUser] = useState<any>(null);
  const [ziyarat, setZiyarat] = useState<Ziyarat | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ========== NEW: FEATURE STATES ==========
  // FEATURE #19: Reading Mode Toggle
  const [readingMode, setReadingMode] = useState<"both" | "listen">("both");

  // FEATURE #5: Auto-play Next
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // FEATURE #10 & #11: Stats
  const [listeningStreak, setListeningStreak] = useState(0);
  const [totalListeningTime, setTotalListeningTime] = useState(0);

  // FEATURE #6: Recently Played
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);

  // FEATURE #16: Tasbih Counter
  const [tasbihCount, setTasbihCount] = useState(0);
  const [showTasbih, setShowTasbih] = useState(false);

  // Favorites
  const [isFavorited, setIsFavorited] = useState(false);

  // Track listening session
  const sessionStartTime = useRef<number>(0);
  const totalSessionTime = useRef<number>(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      loadUserData(userData.username);
    }

    const foundZiyarat = ziyaratList.find((z) => z.slug === slug);
    setZiyarat(foundZiyarat || null);

    if (foundZiyarat && userStr) {
      const userData = JSON.parse(userStr);
      addToHistory(userData.username, foundZiyarat.title);
      checkIfFavorited(userData.username, slug);
    }
  }, [slug]);

  // NEW: Load user data (stats & history)
  const loadUserData = async (username: string) => {
    try {
      const stats = await getUserStats(username);
      setListeningStreak(stats.current_streak_days || 0);
      setTotalListeningTime(stats.total_listening_time_seconds || 0);

      const history = await getListeningHistory(username, 5);
      setRecentlyPlayed(history);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // NEW: Check if favorited
  const checkIfFavorited = async (username: string, ziyaratSlug: string) => {
    const favorited = await isFavorite(username, ziyaratSlug);
    setIsFavorited(favorited);
  };

  // FEATURE #18: Animated Waveform
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    // Only create audio context once
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioRef.current);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 256;

        // Store analyser in a ref so we can access it later
        (audioContextRef.current as any).analyser = analyser;
      } catch (error) {
        console.error("Audio context error:", error);
      }
    }

    // Animation function
    const draw = () => {
      if (!canvasRef.current || !audioContextRef.current) return;

      const analyser = (audioContextRef.current as any).analyser;
      if (!analyser) return;

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const gradient = canvasCtx.createLinearGradient(
          0,
          canvas.height - barHeight,
          0,
          canvas.height
        );
        gradient.addColorStop(0, "#ffd89b");
        gradient.addColorStop(1, "#19547b");

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    // Start or stop animation based on play state
    if (isPlaying && audioContextRef.current) {
      // Resume audio context if suspended
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      // Start animation loop
      draw();
    } else {
      // Stop animation when paused
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      // Track time listened
      if (sessionStartTime.current > 0) {
        totalSessionTime.current += Date.now() - sessionStartTime.current;
      }
    } else {
      audioRef.current.play();
      sessionStartTime.current = Date.now();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // NEW: Handle audio ended with features
  const handleAudioEnded = async () => {
    setIsPlaying(false);

    // Save listening history
    if (user && ziyarat) {
      const totalTime = Math.floor(totalSessionTime.current / 1000);
      await addListeningHistory(user.username, ziyarat.slug, totalTime, true);

      // Reload stats
      loadUserData(user.username);
    }

    // FEATURE #5: Auto-play next ziyarat
    if (autoPlayNext && ziyarat) {
      const currentIndex = ziyaratList.findIndex(
        (z) => z.slug === ziyarat.slug
      );
      const nextIndex = (currentIndex + 1) % ziyaratList.length;
      const nextZiyarat = ziyaratList[nextIndex];

      router.push(`/ziyarat/${nextZiyarat.slug}`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // NEW: Format total time
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // FEATURE #3: Download Audio
  const handleDownload = () => {
    if (!ziyarat?.audioUrl) {
      alert("Audio not available for download");
      return;
    }

    const link = document.createElement("a");
    link.href = ziyarat.audioUrl;
    link.download = `${ziyarat.slug}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!user || !ziyarat) {
      alert("Please login to save!");
      router.push("/login");
      return;
    }

    try {
      const result = await saveQuote(
        user.username,
        ziyarat.title,
        "Audio Ziyarat"
      );
      if (result.success) {
        alert("✅ Ziyarat saved to your collection!");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // NEW: Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user || !ziyarat) {
      alert("Please login!");
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        await removeFromFavorites(user.username, ziyarat.slug);
        setIsFavorited(false);
        alert("Removed from favorites");
      } else {
        await addToFavorites(user.username, ziyarat.slug);
        setIsFavorited(true);
        alert("Added to favorites!");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddNote = async () => {
    if (!user || !ziyarat) {
      alert("Please login!");
      return;
    }

    if (!noteText.trim()) {
      alert("Please enter a note!");
      return;
    }

    try {
      await addNote(user.username, ziyarat.title, noteText);
      alert("✅ Note saved!");
      setAddingNote(false);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  if (!ziyarat) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          color: "white",
        }}
      >
        <Particles />
        <div style={{ textAlign: "center" }}>
          <h2>Ziyarat not found</h2>
          <button
            onClick={() => router.push("/ziyarat")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "rgba(255, 216, 155, 0.2)",
              border: "1px solid rgba(255, 216, 155, 0.4)",
              borderRadius: "10px",
              color: "#ffd89b",
              cursor: "pointer",
            }}
          >
            ← Back to All Ziyarat
          </button>
        </div>
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
        padding: "clamp(15px, 3vw, 20px)",
      }}
    >
      <Particles />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "clamp(20px, 4vw, 30px)",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => router.push("/ziyarat")}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
            }}
          >
            ← All Ziyarat
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
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              📊 Dashboard
            </button>
          )}
        </div>

        {/* FEATURE #10 & #11: Stats Display */}
        {user && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 216, 155, 0.1)",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>🔥</div>
              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {listeningStreak}
              </div>
              <div style={{ color: "#d0d0d0", fontSize: "0.85rem" }}>
                Day Streak
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 216, 155, 0.1)",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⏱️</div>
              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {formatTotalTime(totalListeningTime)}
              </div>
              <div style={{ color: "#d0d0d0", fontSize: "0.85rem" }}>
                Total Time
              </div>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(40px, 6vw, 50px)",
          }}
        >
          <div
            style={{
              fontSize: "clamp(4rem, 12vw, 6rem)",
              marginBottom: "20px",
            }}
          >
            {ziyarat.icon}
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              color: "white",
              marginBottom: "15px",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            {ziyarat.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
              color: "#ffd89b",
              marginBottom: "20px",
              fontFamily: "Arabic, serif",
            }}
          >
            {ziyarat.titleArabic}
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 25px)",
              background: "rgba(255, 216, 155, 0.15)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 216, 155, 0.3)",
            }}
          >
            <span
              style={{
                color: "#ffd89b",
                fontWeight: "700",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              }}
            >
              {ziyarat.category}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(15px, 3vw, 20px)",
            marginBottom: "clamp(40px, 6vw, 50px)",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.07)",
              padding: "clamp(20px, 4vw, 25px)",
              borderRadius: "15px",
              border: "1px solid rgba(255, 216, 155, 0.3)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 5vw, 2.5rem)",
                marginBottom: "10px",
              }}
            >
              ⏱️
            </div>
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                marginBottom: "8px",
                fontWeight: "700",
              }}
            >
              Duration
            </h3>
            <p
              style={{ color: "#d0d0d0", fontSize: "clamp(0.9rem, 2vw, 1rem)" }}
            >
              {ziyarat.duration}
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.07)",
              padding: "clamp(20px, 4vw, 25px)",
              borderRadius: "15px",
              border: "1px solid rgba(255, 216, 155, 0.3)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 5vw, 2.5rem)",
                marginBottom: "10px",
              }}
            >
              🕐
            </div>
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                marginBottom: "8px",
                fontWeight: "700",
              }}
            >
              Best Time
            </h3>
            <p
              style={{ color: "#d0d0d0", fontSize: "clamp(0.9rem, 2vw, 1rem)" }}
            >
              {ziyarat.bestTime}
            </p>
          </div>
        </div>

        {/* Audio Player */}
        {ziyarat.audioUrl && (
          <div
            style={{
              background: "rgba(255, 216, 155, 0.1)",
              border: "2px solid rgba(255, 216, 155, 0.3)",
              borderRadius: "20px",
              padding: "clamp(25px, 5vw, 35px)",
              marginBottom: "clamp(40px, 6vw, 50px)",
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                marginBottom: "20px",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              🔊 Audio Recitation
            </h3>

            <audio
              ref={audioRef}
              src={ziyarat.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleAudioEnded}
            />

            {/* FEATURE #18: Animated Waveform */}
            <canvas
              ref={canvasRef}
              width={600}
              height={100}
              style={{
                width: "100%",
                height: "100px",
                borderRadius: "10px",
                marginBottom: "15px",
                background: "rgba(0, 0, 0, 0.3)",
              }}
            />

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <button
                onClick={togglePlayPause}
                style={{
                  padding: "clamp(15px, 3vw, 18px) clamp(30px, 6vw, 40px)",
                  background: isPlaying
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                  border: "none",
                  borderRadius: "50px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  margin: "0 auto",
                  minWidth: "clamp(180px, 50vw, 250px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                {isPlaying ? "⏸️ Pause" : "▶️ Play"}
              </button>

              <div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: "100%",
                    height: "10px",
                    borderRadius: "5px",
                    outline: "none",
                    background: `linear-gradient(to right, #ffd89b 0%, #ffd89b ${
                      (currentTime / duration) * 100
                    }%, rgba(255, 255, 255, 0.2) ${
                      (currentTime / duration) * 100
                    }%, rgba(255, 255, 255, 0.2) 100%)`,
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#d0d0d0",
                    fontSize: "clamp(0.85rem, 2vw, 1rem)",
                    marginTop: "10px",
                    fontWeight: "600",
                  }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Audio Controls */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* FEATURE #3: Download Button */}
                <button
                  onClick={handleDownload}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    fontWeight: "600",
                  }}
                >
                  ⬇️ Download
                </button>

                {/* FEATURE #5: Auto-play Toggle */}
                <button
                  onClick={() => setAutoPlayNext(!autoPlayNext)}
                  style={{
                    padding: "10px 20px",
                    background: autoPlayNext
                      ? "rgba(255, 216, 155, 0.2)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "10px",
                    color: autoPlayNext ? "#ffd89b" : "white",
                    cursor: "pointer",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    fontWeight: "600",
                  }}
                >
                  {autoPlayNext ? "🔁 Auto-play ON" : "🔁 Auto-play OFF"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE #19: Reading Mode Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() => setReadingMode("both")}
            style={{
              padding: "10px 20px",
              background:
                readingMode === "both"
                  ? "rgba(255, 216, 155, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${
                readingMode === "both"
                  ? "rgba(255, 216, 155, 0.4)"
                  : "rgba(255, 255, 255, 0.3)"
              }`,
              borderRadius: "10px",
              color: readingMode === "both" ? "#ffd89b" : "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
            }}
          >
            📖 Listen & Read
          </button>
          <button
            onClick={() => setReadingMode("listen")}
            style={{
              padding: "10px 20px",
              background:
                readingMode === "listen"
                  ? "rgba(255, 216, 155, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${
                readingMode === "listen"
                  ? "rgba(255, 216, 155, 0.4)"
                  : "rgba(255, 255, 255, 0.3)"
              }`,
              borderRadius: "10px",
              color: readingMode === "listen" ? "#ffd89b" : "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
            }}
          >
            🎧 Listen Only
          </button>
        </div>

        {/* Show content based on reading mode */}
        {readingMode === "both" && (
          <>
            {/* Benefits */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "20px",
                padding: "clamp(25px, 5vw, 35px)",
                marginBottom: "clamp(40px, 6vw, 50px)",
                border: "2px solid rgba(255, 216, 155, 0.3)",
              }}
            >
              <h2
                style={{
                  color: "#ffd89b",
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  marginBottom: "25px",
                  textAlign: "center",
                  fontWeight: "800",
                }}
              >
                ✨ Benefits & Blessings
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "grid",
                  gap: "clamp(15px, 3vw, 18px)",
                }}
              >
                {ziyarat.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    style={{
                      color: "#d0d0d0",
                      fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                      paddingLeft: "clamp(35px, 7vw, 45px)",
                      position: "relative",
                      lineHeight: "1.8",
                      background: "rgba(255, 216, 155, 0.05)",
                      padding:
                        "clamp(12px, 3vw, 15px) clamp(12px, 3vw, 15px) clamp(12px, 3vw, 15px) clamp(45px, 9vw, 55px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 216, 155, 0.2)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "clamp(12px, 3vw, 18px)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#ffd89b",
                        fontWeight: "bold",
                        fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                      }}
                    >
                      ✓
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* FEATURE #16: Tasbih Counter */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => setShowTasbih(!showTasbih)}
            style={{
              padding: "12px 25px",
              background: "rgba(255, 216, 155, 0.2)",
              border: "1px solid rgba(255, 216, 155, 0.4)",
              borderRadius: "10px",
              color: "#ffd89b",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
              fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
            }}
          >
            📿 {showTasbih ? "Hide" : "Show"} Tasbih Counter
          </button>

          {showTasbih && (
            <div
              style={{
                marginTop: "20px",
                background: "rgba(255, 216, 155, 0.1)",
                padding: "30px",
                borderRadius: "15px",
                border: "2px solid rgba(255, 216, 155, 0.3)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(3rem, 10vw, 5rem)",
                  color: "#ffd89b",
                  fontWeight: "900",
                  marginBottom: "20px",
                }}
              >
                {tasbihCount}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setTasbihCount(tasbihCount + 1)}
                  style={{
                    padding: "15px 40px",
                    background: "linear-gradient(135deg, #19547b, #ffd89b)",
                    border: "none",
                    borderRadius: "50px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                    fontWeight: "700",
                  }}
                >
                  + Count
                </button>
                <button
                  onClick={() => setTasbihCount(0)}
                  style={{
                    padding: "15px 40px",
                    background: "rgba(239, 68, 68, 0.3)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    borderRadius: "50px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                    fontWeight: "700",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {user && (
          <div
            style={{
              display: "flex",
              gap: "clamp(10px, 2vw, 15px)",
              marginBottom: "clamp(30px, 5vw, 40px)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleToggleFavorite}
              style={{
                padding: "clamp(12px, 2.5vw, 15px) clamp(25px, 5vw, 35px)",
                background: isFavorited
                  ? "rgba(255, 216, 155, 0.3)"
                  : "rgba(255, 216, 155, 0.1)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "12px",
                color: "#ffd89b",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              }}
            >
              {isFavorited ? "⭐ Favorited" : "☆ Add to Favorites"}
            </button>

            <button
              onClick={handleSave}
              style={{
                padding: "clamp(12px, 2.5vw, 15px) clamp(25px, 5vw, 35px)",
                background: "linear-gradient(135deg, #19547b, #ffd89b)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                boxShadow: "0 4px 15px rgba(255, 216, 155, 0.3)",
              }}
            >
              💾 Save to Collection
            </button>

            <button
              onClick={() => setAddingNote(true)}
              style={{
                padding: "clamp(12px, 2.5vw, 15px) clamp(25px, 5vw, 35px)",
                background: "rgba(255, 255, 255, 0.1)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              }}
            >
              📝 Add Note
            </button>
          </div>
        )}

        {/* Add Note Form */}
        {addingNote && (
          <div
            style={{
              marginBottom: "clamp(30px, 5vw, 40px)",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "clamp(20px, 4vw, 30px)",
              borderRadius: "15px",
              border: "1px solid rgba(255, 216, 155, 0.3)",
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                marginBottom: "15px",
              }}
            >
              📝 Add Your Reflection
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your personal thoughts and reflections..."
              style={{
                width: "100%",
                padding: "15px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                color: "white",
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                minHeight: "140px",
                marginBottom: "15px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleAddNote}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 25px)",
                  background: "linear-gradient(135deg, #19547b, #ffd89b)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                }}
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setAddingNote(false);
                  setNoteText("");
                }}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 25px)",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* FEATURE #6: Recently Played */}
        {user && recentlyPlayed.length > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "15px",
              padding: "clamp(20px, 4vw, 25px)",
              marginBottom: "30px",
              border: "1px solid rgba(255, 216, 155, 0.2)",
            }}
          >
            <h3
              style={{
                color: "#ffd89b",
                marginBottom: "15px",
                fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
              }}
            >
              🎧 Recently Played
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {recentlyPlayed.slice(0, 3).map((item, idx) => {
                const ziyaratItem = ziyaratList.find(
                  (z) => z.slug === item.ziyarat_slug
                );
                return (
                  <div
                    key={idx}
                    onClick={() => router.push(`/ziyarat/${item.ziyarat_slug}`)}
                    style={{
                      padding: "12px",
                      background: "rgba(255, 216, 155, 0.05)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid rgba(255, 216, 155, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                      }}
                    >
                      {ziyaratItem?.title || item.ziyarat_slug}
                    </div>
                    <div
                      style={{
                        color: "#999",
                        fontSize: "0.8rem",
                        marginTop: "3px",
                      }}
                    >
                      {new Date(item.listened_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "clamp(50px, 10vw, 70px)",
            textAlign: "center",
            color: "#888",
            fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
            padding: "25px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p>
            © 2025{" "}
            <span style={{ color: "#ffd89b", fontWeight: "600" }}>ULAMA</span> |
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
