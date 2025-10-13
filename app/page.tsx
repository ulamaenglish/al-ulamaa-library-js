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
          padding: "20px clamp(15px, 5vw, 40px)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {user ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 216, 155, 0.2)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "10px",
                color: "#ffd89b",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
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
                padding: "10px 20px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "10px",
                color: "#fca5a5",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "10px 25px",
              background: "rgba(255, 216, 155, 0.2)",
              border: "1px solid rgba(255, 216, 155, 0.4)",
              borderRadius: "10px",
              color: "#ffd89b",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
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
          padding: "0 clamp(15px, 3vw, 20px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* HERO SECTION */}
        <div
          style={{
            textAlign: "center",
            padding: "clamp(30px, 8vw, 60px) 20px clamp(20px, 5vw, 40px) 20px",
          }}
        >
          <div style={{ animation: "float 3s ease-in-out infinite" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 8vw, 4.5rem)",
                fontWeight: "900",
                marginBottom: "20px",
                letterSpacing: "clamp(1px, 0.5vw, 3px)",
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
              fontSize: "clamp(1rem, 3vw, 1.4rem)",
              color: "#e0e0e0",
              maxWidth: "900px",
              margin: "0 auto 30px auto",
              lineHeight: "1.8",
              fontWeight: "300",
              padding: "0 10px",
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
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "30px",
              padding: "0 10px",
            }}
          >
            <button
              onClick={() =>
                document
                  .getElementById("collections")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                padding: "clamp(12px, 3vw, 18px) clamp(25px, 5vw, 45px)",
                fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
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
            margin: "clamp(30px, 8vw, 60px) auto clamp(40px, 10vw, 80px) auto",
            flexWrap: "wrap",
            gap: "clamp(20px, 4vw, 30px)",
            padding: "0 10px",
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
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
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
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  marginTop: "10px",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* FEATURED COLLECTIONS */}
        <div
          id="collections"
          style={{ marginBottom: "clamp(20px, 5vw, 40px)" }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              marginBottom: "clamp(30px, 8vw, 60px)",
              letterSpacing: "clamp(1px, 0.3vw, 2px)",
              fontFamily: "'Lora', serif",
            }}
          >
            Featured Collections
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
            gap: "clamp(20px, 4vw, 40px)",
            marginBottom: "clamp(40px, 10vw, 80px)",
            padding: "0 10px",
          }}
        >
          {/* Forty Hadith Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "clamp(25px, 5vw, 40px)",
              textAlign: "center",
              minHeight: "auto",
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
                fontSize: "clamp(3rem, 10vw, 5rem)",
                marginBottom: "clamp(15px, 4vw, 25px)",
                filter: "drop-shadow(0 0 20px rgba(255, 216, 155, 0.6))",
              }}
            >
              📚
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "clamp(1.5rem, 4vw, 2.3rem)",
                marginBottom: "clamp(10px, 3vw, 20px)",
                fontWeight: "600",
                fontFamily: "'Lora', serif",
              }}
            >
              Forty Hadith
            </h3>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
                lineHeight: "1.7",
                marginBottom: "clamp(20px, 4vw, 35px)",
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
                padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                border: "none",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                cursor: "pointer",
                marginTop: "clamp(10px, 3vw, 20px)",
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
              padding: "clamp(25px, 5vw, 40px)",
              textAlign: "center",
              minHeight: "auto",
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
                fontSize: "clamp(3rem, 10vw, 5rem)",
                marginBottom: "clamp(15px, 4vw, 25px)",
                filter: "drop-shadow(0 0 20px rgba(255, 216, 155, 0.6))",
              }}
            >
              💎
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "clamp(1.5rem, 4vw, 2.3rem)",
                marginBottom: "clamp(10px, 3vw, 20px)",
                fontWeight: "600",
                fontFamily: "'Lora', serif",
              }}
            >
              Ayatollah Bahjat Sayings
            </h3>
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
                lineHeight: "1.7",
                marginBottom: "clamp(20px, 4vw, 35px)",
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
                padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                border: "none",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                cursor: "pointer",
                marginTop: "clamp(10px, 3vw, 20px)",
              }}
            >
              Begin Journey →
            </button>
          </div>
        </div>

        {/* EXPLORE BY TOPIC */}
        <div style={{ marginTop: "clamp(40px, 10vw, 80px)" }}>
          <h2
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              marginBottom: "clamp(30px, 8vw, 60px)",
              letterSpacing: "clamp(1px, 0.3vw, 2px)",
              fontFamily: "'Lora', serif",
            }}
          >
            Explore by Topic
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "clamp(20px, 4vw, 30px)",
              marginBottom: "clamp(40px, 8vw, 60px)",
              padding: "0 10px",
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
                  padding: "clamp(20px, 4vw, 30px)",
                  minHeight: "auto",
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
                      fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
                      marginBottom: "clamp(15px, 3vw, 20px)",
                      textAlign: "center",
                    }}
                  >
                    {topic.icon}
                  </div>
                  <h4
                    style={{
                      color: "white",
                      fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
                      marginBottom: "clamp(10px, 2vw, 15px)",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {topic.title}
                  </h4>
                  <p
                    style={{
                      color: "#c0c0c0",
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      marginBottom: "clamp(15px, 3vw, 25px)",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    {topic.desc}
                  </p>
                </div>
                <button
                  style={{
                    padding: "clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)",
                    background: "rgba(255, 216, 155, 0.1)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "20px",
                    color: "#ffd89b",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "clamp(0.85rem, 2vw, 1rem)",
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
            padding: "clamp(30px, 6vw, 60px) clamp(20px, 5vw, 40px)",
            margin: "clamp(40px, 10vw, 80px) auto clamp(30px, 8vw, 60px) auto",
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
              fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              marginBottom: "clamp(15px, 3vw, 20px)",
              fontWeight: "700",
            }}
          >
            Begin Your Spiritual Journey
          </h3>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              maxWidth: "700px",
              margin: "0 auto clamp(20px, 4vw, 35px) auto",
              lineHeight: "1.8",
              padding: "0 15px",
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
            fontSize: "clamp(0.85rem, 2vw, 1rem)",
            padding: "clamp(20px, 5vw, 40px) 15px clamp(10px, 3vw, 20px) 15px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            marginTop: "clamp(30px, 8vw, 60px)",
          }}
        >
          <p
            style={{
              marginBottom: "15px",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
            }}
          >
            🌙{" "}
            <span
              style={{
                color: "#ffd89b",
                fontWeight: "700",
                fontSize: "clamp(1.1rem, 2.8vw, 1.2rem)",
              }}
            >
              Al-Ulamaa Library
            </span>
          </p>
          <p
            style={{
              color: "#666",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              lineHeight: "1.6",
            }}
          >
            A digital sanctuary for Islamic wisdom and spiritual enlightenment
            <br />
            Crafted with reverence and modern excellence
          </p>
          <div style={{ marginTop: "clamp(15px, 3vw, 25px)" }}>
            <span
              style={{
                color: "#555",
                fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
              }}
            >
              © 2025 Al-Ulamaa Library | All Rights Reserved
            </span>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
            zIndex: 1000,
            display: window.innerWidth < 768 ? "none" : "block",
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
