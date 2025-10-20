"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AudiobookAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [uploadStep, setUploadStep] = useState<
    "upload" | "processing" | "complete"
  >("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [bookData, setBookData] = useState({
    title: "",
    titleArabic: "",
    author: "",
    authorArabic: "",
    description: "",
    category: "Hadith",
    language: "english",
    premium: false,
    voices: [] as string[],
  });
  const [processingStatus, setProcessingStatus] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);

  const categories = [
    "Hadith",
    "Spirituality",
    "Dua",
    "Tafsir",
    "Fiqh",
    "History",
    "Biography",
    "Poetry",
  ];

  const availableVoices = {
    english: [
      { id: "en-US-Neural2-C", name: "Female (Clear)" },
      { id: "en-US-Neural2-E", name: "Female (Warm)" },
      { id: "en-US-Neural2-F", name: "Female (Young)" },
      { id: "en-US-Neural2-A", name: "Male (Deep)" },
      { id: "en-US-Neural2-D", name: "Male (Clear)" },
      { id: "en-US-Neural2-J", name: "Male (Mature)" },
    ],
    arabic: [
      { id: "ar-XA-Wavenet-A", name: "Female (Arabic)" },
      { id: "ar-XA-Wavenet-D", name: "Female Soft (Arabic)" },
      { id: "ar-XA-Wavenet-B", name: "Male (Arabic)" },
      { id: "ar-XA-Wavenet-C", name: "Male Deep (Arabic)" },
    ],
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError("❌ Invalid password!");
        setPassword("");
      }
    } catch (error) {
      setAuthError("❌ Authentication failed!");
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setPassword("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleVoiceToggle = (voiceId: string) => {
    setBookData((prev) => ({
      ...prev,
      voices: prev.voices.includes(voiceId)
        ? prev.voices.filter((v) => v !== voiceId)
        : [...prev.voices, voiceId],
    }));
  };

  const handleSubmit = async () => {
    if (
      !pdfFile ||
      !bookData.title ||
      !bookData.author ||
      bookData.voices.length === 0
    ) {
      alert(
        "Please fill in all required fields and select at least one voice!"
      );
      return;
    }

    setUploadStep("processing");
    setProcessingProgress(0);

    try {
      // STEP 1: Upload PDF and extract text
      setProcessingStatus("📄 Uploading PDF and extracting text...");
      setProcessingProgress(10);

      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const simplifiedBookData = {
        title: bookData.title,
        titleArabic: bookData.titleArabic,
        author: bookData.author,
        authorArabic: bookData.authorArabic,
        description: bookData.description,
        category: bookData.category,
        language: bookData.language,
        premium: bookData.premium,
      };

      formData.append("bookData", JSON.stringify(simplifiedBookData));

      console.log("Uploading PDF...");

      const uploadResponse = await fetch("/api/audiobooks/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const contentType = uploadResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload PDF");
        } else {
          const errorText = await uploadResponse.text();
          console.error("Server error:", errorText);
          throw new Error(
            "Server returned an error. Check console for details."
          );
        }
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload result:", uploadResult);
      setExtractedData(uploadResult);
      setProcessingProgress(20);

      // STEP 2: Save audiobook to database FIRST
      setProcessingStatus("💾 Saving audiobook to database...");
      setProcessingProgress(30);

      console.log("Saving audiobook to database first...");

      const chapters = uploadResult.chapters.map(
        (chapter: any, index: number) => ({
          title: chapter.title,
          startTime: "0:00:00",
          startSeconds: 0,
          chapterOrder: index + 1,
        })
      );

      const saveResponse = await fetch("/api/audiobooks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audiobookId: uploadResult.audiobookId,
          title: bookData.title,
          titleArabic: bookData.titleArabic,
          author: bookData.author,
          authorArabic: bookData.authorArabic,
          description: bookData.description,
          category: bookData.category,
          language: bookData.language,
          premium: bookData.premium,
          duration: "0:00",
          durationSeconds: 0,
          chapters: chapters,
        }),
      });

      console.log("Save response status:", saveResponse.status);

      if (!saveResponse.ok) {
        const contentType = saveResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await saveResponse.json();
          throw new Error(error.error || "Failed to save audiobook");
        } else {
          const errorText = await saveResponse.text();
          console.error("Server error:", errorText);
          throw new Error(
            "Failed to save audiobook. Check console for details."
          );
        }
      }

      const saveResult = await saveResponse.json();
      console.log("Audiobook saved successfully:", saveResult);
      setProcessingProgress(40);

      // STEP 3: Generate audio for each chapter
      setProcessingStatus("🎙️ Generating audio with Google Cloud TTS...");

      const audioUrls: any[] = [];
      let totalDurationSeconds = 0;

      for (let i = 0; i < bookData.voices.length; i++) {
        const voiceId = bookData.voices[i];
        const allVoices = [
          ...availableVoices.english,
          ...availableVoices.arabic,
        ];
        const voiceInfo = allVoices.find((v) => v.id === voiceId);

        setProcessingStatus(
          `🎙️ Generating audio with ${voiceInfo?.name} (${i + 1}/${
            bookData.voices.length
          })...`
        );

        console.log(`Generating audio for voice ${voiceId}...`);

        // Send chapters to generate-audio API
        const audioResponse = await fetch("/api/audiobooks/generate-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audiobookId: uploadResult.audiobookId,
            chapters: uploadResult.chapters, // Pass chapters from upload
            voiceId: voiceId,
            voiceName: voiceInfo?.name || voiceId,
            language: bookData.language,
          }),
        });

        console.log("Audio response status:", audioResponse.status);

        if (!audioResponse.ok) {
          const contentType = audioResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await audioResponse.json();
            throw new Error(error.error || "Failed to generate audio");
          } else {
            const errorText = await audioResponse.text();
            console.error("Server error:", errorText);
            throw new Error(
              "Failed to generate audio. Check console for details."
            );
          }
        }

        const audioResult = await audioResponse.json();
        console.log("Audio result:", audioResult);
        audioUrls.push(audioResult);
        totalDurationSeconds = audioResult.durationSeconds;

        setProcessingProgress(40 + ((i + 1) / bookData.voices.length) * 55);
      }

      // STEP 4: Update audiobook with real duration and chapter timestamps
      setProcessingStatus("📚 Updating chapters with timestamps...");
      setProcessingProgress(95);

      console.log(
        "Updating audiobook with actual duration and chapter times..."
      );

      const updateResponse = await fetch("/api/audiobooks/update-duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audiobookId: uploadResult.audiobookId,
          duration: audioUrls[0].duration,
          durationSeconds: totalDurationSeconds,
          chapterCount: chapters.length,
        }),
      });

      if (updateResponse.ok) {
        console.log("✅ Duration and chapters updated successfully");
      } else {
        console.warn("⚠️ Failed to update duration, but audiobook was created");
      }

      setProcessingProgress(100);
      setProcessingStatus("✅ Complete! Audiobook is now available!");
      setUploadStep("complete");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error processing audiobook: " + error.message);
      setUploadStep("upload");
    }
  };

  if (!isAuthenticated) {
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
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "20px",
            padding: "50px",
            maxWidth: "450px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "15px",
            }}
          >
            Admin Access Required
          </h1>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "1.1rem",
              marginBottom: "30px",
            }}
          >
            Enter admin password to continue
          </p>
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: "100%",
                padding: "15px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "2px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "12px",
                color: "white",
                fontSize: "1.1rem",
                outline: "none",
                marginBottom: "20px",
                textAlign: "center",
              }}
            />
            {authError && (
              <div
                style={{
                  color: "#ef4444",
                  marginBottom: "20px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                }}
              >
                {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #19547b, #ffd89b)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255, 216, 155, 0.3)",
                marginBottom: "15px",
              }}
            >
              🔓 Login
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                color: "#93c5fd",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              ← Back to Home
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Link
                href="/"
                style={{
                  color: "#ffd89b",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                ← Back to Home
              </Link>
              <Link
                href="/admin/manage"
                style={{
                  padding: "8px 16px",
                  background: "rgba(147, 197, 253, 0.2)",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  borderRadius: "8px",
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                🗂️ Manage Audiobooks
              </Link>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "10px",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🚪 Logout
            </button>
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "15px",
            }}
          >
            📚 Add New Audiobook
          </h1>
          <p style={{ color: "#d0d0d0", fontSize: "1.1rem" }}>
            Upload a PDF and convert it to audiobook with AI voices
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "50px",
            position: "relative",
          }}
        >
          {["Upload", "Processing", "Complete"].map((step, index) => (
            <div
              key={step}
              style={{
                flex: 1,
                textAlign: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background:
                    uploadStep === "upload" && index === 0
                      ? "linear-gradient(135deg, #ffd89b, #f59e0b)"
                      : uploadStep === "processing" && index === 1
                      ? "linear-gradient(135deg, #93c5fd, #3b82f6)"
                      : uploadStep === "complete" && index === 2
                      ? "linear-gradient(135deg, #86efac, #10b981)"
                      : "rgba(255, 255, 255, 0.1)",
                  margin: "0 auto 15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  border: "3px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  color:
                    (uploadStep === "upload" && index === 0) ||
                    (uploadStep === "processing" && index === 1) ||
                    (uploadStep === "complete" && index === 2)
                      ? "#ffd89b"
                      : "#666",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                {step}
              </div>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              top: "25px",
              left: "25%",
              right: "25%",
              height: "3px",
              background: "rgba(255, 255, 255, 0.1)",
              zIndex: 1,
            }}
          />
        </div>

        {uploadStep === "upload" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              padding: "40px",
            }}
          >
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                📄 Upload PDF File *
              </label>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px dashed rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "#d0d0d0",
                  cursor: "pointer",
                }}
              />
              {pdfFile && (
                <div
                  style={{
                    color: "#86efac",
                    marginTop: "10px",
                    fontSize: "0.9rem",
                  }}
                >
                  ✓ {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </div>
              )}
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                📖 Book Title (English) *
              </label>
              <input
                type="text"
                value={bookData.title}
                onChange={(e) =>
                  setBookData({ ...bookData, title: e.target.value })
                }
                placeholder="e.g., 40 Hadith"
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                📖 Book Title (Arabic)
              </label>
              <input
                type="text"
                value={bookData.titleArabic}
                onChange={(e) =>
                  setBookData({ ...bookData, titleArabic: e.target.value })
                }
                placeholder="e.g., الأحاديث الأربعون"
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  direction: "rtl",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                ✍️ Author *
              </label>
              <input
                type="text"
                value={bookData.author}
                onChange={(e) =>
                  setBookData({ ...bookData, author: e.target.value })
                }
                placeholder="e.g., Imam Khomeini"
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                ✍️ Author (Arabic)
              </label>
              <input
                type="text"
                value={bookData.authorArabic}
                onChange={(e) =>
                  setBookData({ ...bookData, authorArabic: e.target.value })
                }
                placeholder="e.g., الإمام الخميني"
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  direction: "rtl",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                📝 Description
              </label>
              <textarea
                value={bookData.description}
                onChange={(e) =>
                  setBookData({ ...bookData, description: e.target.value })
                }
                placeholder="Brief description..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                📚 Category *
              </label>
              <select
                value={bookData.category}
                onChange={(e) =>
                  setBookData({ ...bookData, category: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    style={{ background: "#1a1a2e" }}
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                🌍 Primary Language *
              </label>
              <select
                value={bookData.language}
                onChange={(e) =>
                  setBookData({
                    ...bookData,
                    language: e.target.value,
                    voices: [],
                  })
                }
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="english" style={{ background: "#1a1a2e" }}>
                  English
                </option>
                <option value="arabic" style={{ background: "#1a1a2e" }}>
                  Arabic
                </option>
                <option value="bilingual" style={{ background: "#1a1a2e" }}>
                  Bilingual
                </option>
              </select>
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  color: "#93c5fd",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                🎙️ Select AI Voices (Choose at least 1) *
              </label>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9rem",
                  marginBottom: "15px",
                }}
              >
                Users will choose from these voices
              </p>
              {(bookData.language === "english" ||
                bookData.language === "bilingual") && (
                <div style={{ marginBottom: "20px" }}>
                  <h4
                    style={{
                      color: "#ffd89b",
                      fontSize: "1rem",
                      marginBottom: "10px",
                    }}
                  >
                    English Voices:
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {availableVoices.english.map((voice) => (
                      <div
                        key={voice.id}
                        onClick={() => handleVoiceToggle(voice.id)}
                        style={{
                          padding: "12px",
                          background: bookData.voices.includes(voice.id)
                            ? "rgba(255, 216, 155, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: bookData.voices.includes(voice.id)
                            ? "2px solid rgba(255, 216, 155, 0.5)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "1.2rem" }}>
                            {bookData.voices.includes(voice.id) ? "✅" : "⬜"}
                          </span>
                          <span
                            style={{
                              color: bookData.voices.includes(voice.id)
                                ? "#ffd89b"
                                : "#d0d0d0",
                              fontSize: "0.9rem",
                            }}
                          >
                            {voice.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(bookData.language === "arabic" ||
                bookData.language === "bilingual") && (
                <div>
                  <h4
                    style={{
                      color: "#ffd89b",
                      fontSize: "1rem",
                      marginBottom: "10px",
                    }}
                  >
                    Arabic Voices:
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {availableVoices.arabic.map((voice) => (
                      <div
                        key={voice.id}
                        onClick={() => handleVoiceToggle(voice.id)}
                        style={{
                          padding: "12px",
                          background: bookData.voices.includes(voice.id)
                            ? "rgba(255, 216, 155, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: bookData.voices.includes(voice.id)
                            ? "2px solid rgba(255, 216, 155, 0.5)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "1.2rem" }}>
                            {bookData.voices.includes(voice.id) ? "✅" : "⬜"}
                          </span>
                          <span
                            style={{
                              color: bookData.voices.includes(voice.id)
                                ? "#ffd89b"
                                : "#d0d0d0",
                              fontSize: "0.9rem",
                            }}
                          >
                            {voice.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={bookData.premium}
                  onChange={(e) =>
                    setBookData({ ...bookData, premium: e.target.checked })
                  }
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span style={{ color: "#d0d0d0", fontSize: "1rem" }}>
                  ⭐ Mark as Premium
                </span>
              </label>
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                !pdfFile ||
                !bookData.title ||
                !bookData.author ||
                bookData.voices.length === 0
              }
              style={{
                width: "100%",
                padding: "18px",
                background:
                  !pdfFile ||
                  !bookData.title ||
                  !bookData.author ||
                  bookData.voices.length === 0
                    ? "rgba(100, 100, 100, 0.3)"
                    : "linear-gradient(135deg, #19547b, #ffd89b)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "700",
                cursor:
                  !pdfFile ||
                  !bookData.title ||
                  !bookData.author ||
                  bookData.voices.length === 0
                    ? "not-allowed"
                    : "pointer",
                boxShadow:
                  !pdfFile ||
                  !bookData.title ||
                  !bookData.author ||
                  bookData.voices.length === 0
                    ? "none"
                    : "0 4px 20px rgba(255, 216, 155, 0.3)",
                opacity:
                  !pdfFile ||
                  !bookData.title ||
                  !bookData.author ||
                  bookData.voices.length === 0
                    ? 0.5
                    : 1,
              }}
            >
              🚀 Process & Create Audiobook
            </button>
          </div>
        )}

        {uploadStep === "processing" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                border: "6px solid rgba(255, 216, 155, 0.2)",
                borderTop: "6px solid #ffd89b",
                borderRadius: "50%",
                margin: "0 auto 30px",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2
              style={{
                color: "#ffd89b",
                fontSize: "2rem",
                marginBottom: "15px",
                fontWeight: "800",
              }}
            >
              Processing Your Audiobook...
            </h2>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "1.2rem",
                marginBottom: "20px",
              }}
            >
              {processingStatus}
            </p>
            <div
              style={{
                width: "100%",
                height: "10px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "5px",
                overflow: "hidden",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  width: `${processingProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #19547b, #ffd89b)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "10px" }}>
              {processingProgress}%
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

        {uploadStep === "complete" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "20px" }}>🎉</div>
            <h2
              style={{
                color: "#86efac",
                fontSize: "2.5rem",
                marginBottom: "15px",
                fontWeight: "800",
              }}
            >
              Audiobook Created Successfully!
            </h2>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "1.2rem",
                marginBottom: "30px",
              }}
            >
              Your audiobook is now live!
            </p>
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/audiobooks"
                style={{
                  display: "inline-block",
                  padding: "15px 30px",
                  background: "linear-gradient(135deg, #19547b, #ffd89b)",
                  borderRadius: "12px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                View Library
              </Link>
              <button
                onClick={() => {
                  setUploadStep("upload");
                  setPdfFile(null);
                  setBookData({
                    title: "",
                    titleArabic: "",
                    author: "",
                    authorArabic: "",
                    description: "",
                    category: "Hadith",
                    language: "english",
                    premium: false,
                    voices: [],
                  });
                  setExtractedData(null);
                  setProcessingProgress(0);
                }}
                style={{
                  padding: "15px 30px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Add Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
