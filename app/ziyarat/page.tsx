"use client";

import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { ziyaratList } from "./data/ziyarat-list";

export default function AllZiyaratPage() {
  const router = useRouter();

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
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "clamp(20px, 4vw, 30px)" }}>
          <button
            onClick={() => router.push("/")}
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
            ← Back to Home
          </button>
        </div>

        {/* Page Title */}
        <div
          style={{
            textAlign: "center",
            padding: "clamp(20px, 5vw, 40px) 15px",
            marginBottom: "clamp(20px, 5vw, 40px)",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              marginBottom: "15px",
              color: "white",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            🕋 All Ziyarat
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
              color: "#d0d0d0",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Sacred visitations and salutations to the Holy Prophet and Ahlul
            Bayt (AS)
          </p>
        </div>

        {/* Ziyarat Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(15px, 3vw, 25px)",
            marginBottom: "clamp(40px, 8vw, 60px)",
          }}
        >
          {ziyaratList.map((ziyarat) => (
            <div
              key={ziyarat.id}
              onClick={() => router.push(`/ziyarat/${ziyarat.slug}`)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 216, 155, 0.2)",
                borderRadius: "20px",
                padding: "clamp(20px, 4vw, 30px)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 15px 40px rgba(255, 216, 155, 0.3)";
                e.currentTarget.style.borderColor = "rgba(255, 216, 155, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255, 216, 155, 0.2)";
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 3rem)",
                    marginBottom: "15px",
                    textAlign: "center",
                  }}
                >
                  {ziyarat.icon}
                </div>

                <h3
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    marginBottom: "8px",
                    textAlign: "center",
                    fontWeight: "700",
                  }}
                >
                  {ziyarat.title}
                </h3>

                <p
                  style={{
                    color: "#b0b0b0",
                    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                    marginBottom: "12px",
                    textAlign: "center",
                    fontFamily: "Arabic, serif",
                  }}
                >
                  {ziyarat.titleArabic}
                </p>

                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255, 216, 155, 0.1)",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#ffd89b",
                      fontSize: "clamp(0.8rem, 2vw, 0.85rem)",
                      fontWeight: "600",
                    }}
                  >
                    {ziyarat.category}
                  </span>
                </div>

                <p
                  style={{
                    color: "#d0d0d0",
                    fontSize: "clamp(0.9rem, 2vw, 0.95rem)",
                    lineHeight: "1.6",
                    marginBottom: "15px",
                  }}
                >
                  {ziyarat.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                      color: "#c0c0c0",
                    }}
                  >
                    ⏱️ {ziyarat.duration}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                      color: "#c0c0c0",
                    }}
                  >
                    🕐 {ziyarat.bestTime}
                  </span>
                </div>
              </div>

              <button
                style={{
                  padding: "clamp(10px, 2vw, 12px) 20px",
                  background:
                    "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Read Ziyarat →
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div
          style={{
            background: "rgba(25, 84, 123, 0.2)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "15px",
            padding: "clamp(20px, 4vw, 30px)",
            marginBottom: "clamp(40px, 8vw, 60px)",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#ffd89b",
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              marginBottom: "15px",
            }}
          >
            📖 About Ziyarat
          </h3>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              lineHeight: "1.8",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Ziyarat are beautiful prayers and salutations offered to the Holy
            Prophet Muhammad (SAWW) and the blessed Ahlul Bayt (AS). Each
            ziyarat carries immense spiritual blessings and connects us deeply
            with our beloved Imams.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
            padding: "20px 0",
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
