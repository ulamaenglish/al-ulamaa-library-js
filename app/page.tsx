"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const topics = [
    {
      title: "Shahid Mutahhari Sayings",
      icon: "💎",
      desc: "Luminous pearls of divine wisdom",
      path: "/shahid-mutahhari",
    },
    {
      title: "Ayatollah Bahjat Sayings",
      icon: "📚",
      desc: "Words from a revered mystic",
      path: "/ayatollah-bahjat",
    },
    {
      title: "Imam Khomeini Poems",
      icon: "✨",
      desc: "Profound spiritual Poems",
      path: "/imam-khomeini-poems",
    },
    {
      title: "Imam Khomeini Forty Hadith",
      icon: "🕌",
      desc: "Sacred moral traditions",
      path: "/imam-khomeini-hadith",
    },
    {
      title: "Mafatih al-Jinan",
      icon: "🌙",
      desc: "Keys to heavenly gardens",
      path: "/mafatih-worship",
    },
    {
      title: "Stories of Ulama",
      icon: "📖",
      desc: "Tales of scholarly devotion",
      path: "/stories-ulama",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        overflowX: "hidden",
      }}
    >
      <Particles />

      {/* Header with Login */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "15px",
        }}
      >
        {user ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "12px 25px",
                background: "rgba(255, 216, 155, 0.2)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "10px",
                color: "#ffd89b",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setUser(null);
              }}
              style={{
                padding: "12px 25px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "10px",
                color: "#fca5a5",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "12px 30px",
              background: "rgba(255, 216, 155, 0.2)",
              border: "1px solid rgba(255, 216, 155, 0.4)",
              borderRadius: "10px",
              color: "#ffd89b",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            🔐 Login / Register
          </button>
        )}
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* HERO SECTION */}
        <div style={{ textAlign: "center", padding: "60px 20px 40px 20px" }}>
          <div style={{ animation: "float 3s ease-in-out infinite" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "4.5rem",
                fontWeight: "900",
                marginBottom: "20px",
                letterSpacing: "3px",
                color: "#ffd89b",
                textShadow:
                  "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
              }}
            >
              Al-Ulamaa Library
            </h1>
          </div>

          <p
            style={{
              fontSize: "1.4rem",
              color: "#e0e0e0",
              maxWidth: "900px",
              margin: "0 auto 30px auto",
              lineHeight: "1.9",
              fontWeight: "300",
            }}
          >
            A curated collection of Islamic spiritual works and scholarly
            wisdom.
            <br />
            Featuring illustrated explanations, sacred texts, and guidance from
            great scholars.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "40px",
            }}
          >
            <button
              onClick={() =>
                document
                  .getElementById("collections")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                padding: "18px 45px",
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "white",
                background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                transition: "all 0.4s ease",
                boxShadow: "0 5px 20px rgba(255, 216, 155, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(255, 216, 155, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 5px 20px rgba(255, 216, 155, 0.3)";
              }}
            >
              Explore Collections
            </button>
          </div>
        </div>

        {/* STATS SECTION */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            maxWidth: "1000px",
            margin: "60px auto 80px auto",
            flexWrap: "wrap",
            gap: "30px",
          }}
        >
          {[
            { number: "Timeless", label: "Ancient Wisdom" },
            { number: "Spiritual", label: "Growth Journey" },
            { number: "Divine", label: "Connection" },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                animation: `countUp 0.8s ease-out ${index * 0.2}s`,
              }}
            >
              <h2
                style={{
                  fontSize: "3.5rem",
                  color: "#ffd89b",
                  margin: 0,
                  fontWeight: "700",
                }}
              >
                {stat.number}
              </h2>
              <p
                style={{
                  color: "#b0b0b0",
                  fontSize: "1.1rem",
                  marginTop: "10px",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* FEATURED COLLECTIONS */}
        <div id="collections" style={{ marginBottom: "40px" }}>
          <h2
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "2.8rem",
              marginBottom: "60px",
              letterSpacing: "2px",
              fontFamily: "'Lora', serif",
              position: "relative",
              display: "inline-block",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Featured Collections
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: "40px",
            marginBottom: "80px",
          }}
        >
          {/* Forty Hadith Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              minHeight: "450px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 20px 60px rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = "rgba(255, 216, 155, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
            onClick={() => router.push("/imam-khomeini-hadith")}
          >
            <div
              style={{
                fontSize: "5rem",
                marginBottom: "25px",
                filter: "drop-shadow(0 0 20px rgba(255, 216, 155, 0.6))",
              }}
            >
              📚
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "2.3rem",
                marginBottom: "20px",
                fontWeight: "600",
                fontFamily: "'Lora', serif",
              }}
            >
              Forty Hadith
            </h3>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "1.15rem",
                lineHeight: "1.8",
                marginBottom: "35px",
              }}
            >
              Immerse yourself in profound illustrated explanations of moral and
              spiritual traditions
              <br />
              <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                by Imam Khomeini
              </span>
            </p>
            <button
              style={{
                padding: "12px 30px",
                background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                border: "none",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Begin Journey →
            </button>
          </div>

          {/* Ayatollah Bahjat Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              minHeight: "450px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 20px 60px rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = "rgba(255, 216, 155, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
            onClick={() => router.push("/ayatollah-bahjat")}
          >
            <div
              style={{
                fontSize: "5rem",
                marginBottom: "25px",
                filter: "drop-shadow(0 0 20px rgba(255, 216, 155, 0.6))",
              }}
            >
              💎
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "2.3rem",
                marginBottom: "20px",
                fontWeight: "600",
                fontFamily: "'Lora', serif",
              }}
            >
              Ayatollah Bahjat Sayings
            </h3>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "1.15rem",
                lineHeight: "1.8",
                marginBottom: "35px",
              }}
            >
              Luminous pearls of wisdom and spiritual guidance
              <br />
              <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                from a revered mystic
              </span>
            </p>
            <button
              style={{
                padding: "12px 30px",
                background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                border: "none",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Begin Journey →
            </button>
          </div>
        </div>

        {/* EXPLORE BY TOPIC */}
        <div style={{ marginTop: "80px" }}>
          <h2
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "2.8rem",
              marginBottom: "60px",
              letterSpacing: "2px",
              fontFamily: "'Lora', serif",
            }}
          >
            Explore by Topic
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "30px",
            }}
          >
            {topics.map((topic, index) => (
              <div
                key={index}
                onClick={() => router.push(topic.path)}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(30, 50, 80, 0.8) 0%, rgba(20, 30, 50, 0.9) 100%)",
                  border: "1px solid rgba(255, 216, 155, 0.2)",
                  borderRadius: "15px",
                  padding: "30px",
                  minHeight: "250px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  transformStyle: "preserve-3d",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "rotateX(5deg) rotateY(5deg) translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 216, 155, 0.2)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 216, 155, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "rotateX(0) rotateY(0) translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 216, 155, 0.2)";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "3.5rem",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    {topic.icon}
                  </div>
                  <h4
                    style={{
                      color: "white",
                      fontSize: "1.4rem",
                      marginBottom: "15px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {topic.title}
                  </h4>
                  <p
                    style={{
                      color: "#c0c0c0",
                      fontSize: "1rem",
                      marginBottom: "25px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    {topic.desc}
                  </p>
                </div>
                <button
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255, 216, 155, 0.1)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "20px",
                    color: "#ffd89b",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            margin: "80px auto 60px auto",
            maxWidth: "1000px",
            borderRadius: "25px",
            background:
              "linear-gradient(135deg, rgba(25, 84, 123, 0.3) 0%, rgba(255, 216, 155, 0.2) 100%)",
            border: "2px solid rgba(255, 216, 155, 0.3)",
            boxShadow: "0 15px 50px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "2.2rem",
              marginBottom: "20px",
              fontWeight: "700",
            }}
          >
            Begin Your Spiritual Journey
          </h3>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "1.2rem",
              maxWidth: "700px",
              margin: "0 auto 35px auto",
              lineHeight: "1.8",
            }}
          >
            Immerse yourself in the profound teachings of Islamic scholars.
            <br />
            Every page is crafted for deep reflection and spiritual elevation.
          </p>
        </div>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "1rem",
            padding: "40px 0 20px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            marginTop: "60px",
          }}
        >
          <p style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
            🌙{" "}
            <span
              style={{
                color: "#ffd89b",
                fontWeight: "700",
                fontSize: "1.2rem",
              }}
            >
              Al-Ulamaa Library
            </span>
          </p>
          <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: "1.6" }}>
            A digital sanctuary for Islamic wisdom and spiritual enlightenment
            <br />
            Crafted with reverence and modern excellence
          </p>
          <div style={{ marginTop: "25px" }}>
            <span style={{ color: "#555", fontSize: "0.85rem" }}>
              © 2025 Al-Ulamaa Library | All Rights Reserved
            </span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
            zIndex: 1000,
          }}
        >
          <div style={{ fontSize: "2rem", color: "rgba(255, 216, 155, 0.6)" }}>
            ↓
          </div>
        </div>
      </div>
    </div>
  );
}
