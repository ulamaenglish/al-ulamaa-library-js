"use client";

import { useState, useRef, useEffect } from "react";
import { AudiobookChapter } from "@/lib/audiobookData";

interface AudiobookPlayerProps {
  bookTitle: string;
  bookTitleArabic?: string;
  coverImage: string;
  audioUrl: string;
  chapters: AudiobookChapter[];
  isPremium: boolean;
  userHasPremium: boolean;
}

export default function AudiobookPlayer({
  bookTitle,
  bookTitleArabic,
  coverImage,
  audioUrl,
  chapters,
  isPremium,
  userHasPremium,
}: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [showChapters, setShowChapters] = useState(false);

  // Check if user can access this audiobook
  const canAccess = !isPremium || userHasPremium;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);

      // Auto-update current chapter based on time
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (audio.currentTime >= chapters[i].startSeconds) {
          setCurrentChapter(i);
          break;
        }
      }
    };

    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [chapters]);

  const togglePlay = () => {
    if (!canAccess) {
      alert("⭐ This is a premium audiobook! Please upgrade to listen.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const jumpToChapter = (chapterIndex: number) => {
    if (!canAccess) {
      alert("⭐ This is a premium audiobook! Please upgrade to listen.");
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = chapters[chapterIndex].startSeconds;
      setCurrentChapter(chapterIndex);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: "rgba(20, 20, 20, 0.95)",
        border: "2px solid rgba(255, 216, 155, 0.3)",
        borderRadius: "20px",
        padding: "40px",
        maxWidth: "700px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "700",
          }}
        >
          ⭐ PREMIUM
        </div>
      )}

      {/* Book Cover */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            width: "220px",
            height: "300px",
            margin: "0 auto",
            background: `url(${coverImage}) center/cover, linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!coverImage && "📖"}

          {/* Lock overlay for premium books without access */}
          {isPremium && !userHasPremium && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                backdropFilter: "blur(5px)",
              }}
            >
              🔒
            </div>
          )}
        </div>

        <h2
          style={{
            color: "#ffd89b",
            fontSize: "1.8rem",
            marginTop: "25px",
            fontWeight: "800",
          }}
        >
          {bookTitle}
        </h2>

        {bookTitleArabic && (
          <h3
            style={{
              color: "#93c5fd",
              fontSize: "1.4rem",
              marginTop: "10px",
              fontFamily: "Arabic, serif",
            }}
          >
            {bookTitleArabic}
          </h3>
        )}
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} src={canAccess ? audioUrl : ""} />

      {/* Progress Bar */}
      <div style={{ marginBottom: "25px" }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => {
            if (!canAccess) {
              alert(
                "⭐ This is a premium audiobook! Please upgrade to listen."
              );
              return;
            }
            if (audioRef.current) {
              audioRef.current.currentTime = Number(e.target.value);
            }
          }}
          style={{
            width: "100%",
            height: "8px",
            background: `linear-gradient(to right, #ffd89b ${
              (currentTime / duration) * 100
            }%, rgba(255, 216, 155, 0.2) ${(currentTime / duration) * 100}%)`,
            borderRadius: "4px",
            cursor: "pointer",
            appearance: "none",
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#999",
            fontSize: "0.9rem",
            marginTop: "10px",
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span style={{ color: "#ffd89b" }}>
            Chapter {currentChapter + 1} of {chapters.length}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* Previous Chapter */}
        <button
          onClick={() => {
            if (currentChapter > 0) {
              jumpToChapter(currentChapter - 1);
            }
          }}
          disabled={currentChapter === 0}
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "50%",
            width: "55px",
            height: "55px",
            color: "#ffd89b",
            cursor: currentChapter === 0 ? "not-allowed" : "pointer",
            fontSize: "1.3rem",
            opacity: currentChapter === 0 ? 0.4 : 1,
            transition: "all 0.3s",
          }}
        >
          ⏮
        </button>

        {/* Skip Backward 15s */}
        <button
          onClick={skipBackward}
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "50%",
            width: "55px",
            height: "55px",
            color: "#ffd89b",
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>⏪</div>
          <div style={{ fontSize: "0.6rem" }}>15s</div>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            background: canAccess
              ? "linear-gradient(135deg, #19547b, #ffd89b)"
              : "rgba(100, 100, 100, 0.5)",
            border: "none",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            color: "white",
            cursor: canAccess ? "pointer" : "not-allowed",
            fontSize: "2.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: canAccess
              ? "0 8px 30px rgba(255, 216, 155, 0.4)"
              : "none",
            transition: "all 0.3s",
          }}
        >
          {!canAccess ? "🔒" : isPlaying ? "⏸" : "▶️"}
        </button>

        {/* Skip Forward 15s */}
        <button
          onClick={skipForward}
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "50%",
            width: "55px",
            height: "55px",
            color: "#ffd89b",
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>⏩</div>
          <div style={{ fontSize: "0.6rem" }}>15s</div>
        </button>

        {/* Next Chapter */}
        <button
          onClick={() => {
            if (currentChapter < chapters.length - 1) {
              jumpToChapter(currentChapter + 1);
            }
          }}
          disabled={currentChapter === chapters.length - 1}
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "50%",
            width: "55px",
            height: "55px",
            color: "#ffd89b",
            cursor:
              currentChapter === chapters.length - 1
                ? "not-allowed"
                : "pointer",
            fontSize: "1.3rem",
            opacity: currentChapter === chapters.length - 1 ? 0.4 : 1,
            transition: "all 0.3s",
          }}
        >
          ⏭
        </button>
      </div>

      {/* Additional Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          padding: "0 20px",
        }}
      >
        {/* Speed Control */}
        <button
          onClick={changeSpeed}
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "10px",
            padding: "10px 18px",
            color: "#ffd89b",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          🎚️ {playbackRate}x
        </button>

        {/* Volume Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#ffd89b", fontSize: "1.2rem" }}>
            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            style={{
              width: "100px",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Chapters Toggle */}
        <button
          onClick={() => setShowChapters(!showChapters)}
          style={{
            background: "rgba(147, 197, 253, 0.1)",
            border: "1px solid rgba(147, 197, 253, 0.3)",
            borderRadius: "10px",
            padding: "10px 18px",
            color: "#93c5fd",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          📑 Chapters
        </button>
      </div>

      {/* Chapters List */}
      {showChapters && (
        <div
          style={{
            marginTop: "20px",
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              color: "#93c5fd",
              marginBottom: "15px",
              fontSize: "1.2rem",
              fontWeight: "700",
            }}
          >
            📚 Chapters
          </h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {chapters.map((chapter, index) => (
              <div
                key={index}
                onClick={() => jumpToChapter(index)}
                style={{
                  padding: "15px",
                  background:
                    currentChapter === index
                      ? "rgba(255, 216, 155, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${
                    currentChapter === index
                      ? "rgba(255, 216, 155, 0.4)"
                      : "transparent"
                  }`,
                  borderRadius: "10px",
                  marginBottom: "10px",
                  cursor: canAccess ? "pointer" : "not-allowed",
                  color: currentChapter === index ? "#ffd89b" : "#d0d0d0",
                  transition: "all 0.3s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  if (canAccess && currentChapter !== index) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentChapter !== index) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      opacity: currentChapter === index ? 1 : 0.6,
                    }}
                  >
                    {currentChapter === index ? "▶️" : "📖"}
                  </span>
                  <span
                    style={{
                      fontWeight: currentChapter === index ? "700" : "500",
                    }}
                  >
                    {chapter.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#999",
                    fontFamily: "monospace",
                  }}
                >
                  {chapter.startTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Upgrade CTA */}
      {isPremium && !userHasPremium && (
        <div
          style={{
            marginTop: "25px",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "1.3rem",
              marginBottom: "10px",
              fontWeight: "800",
            }}
          >
            ⭐ Unlock This Premium Audiobook
          </h3>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "15px",
              fontSize: "0.95rem",
            }}
          >
            Get unlimited access to all premium audiobooks
          </p>
          <button
            onClick={() => (window.location.href = "/subscription")}
            style={{
              background: "white",
              color: "#f5576c",
              border: "none",
              borderRadius: "10px",
              padding: "12px 30px",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            Upgrade to Premium →
          </button>
        </div>
      )}
    </div>
  );
}
