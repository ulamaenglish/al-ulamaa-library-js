"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

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
              width: "60px",
              height: "60px",
              border: "5px solid rgba(255, 216, 155, 0.2)",
              borderTop: "5px solid #ffd89b",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#d0d0d0", fontSize: "1.1rem" }}>
            Processing your subscription...
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
          maxWidth: "600px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "60px 40px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 216, 155, 0.3)",
        }}
      >
        <div
          style={{
            fontSize: "5rem",
            marginBottom: "30px",
          }}
        >
          🎉
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            color: "#ffd89b",
            marginBottom: "20px",
            lineHeight: "1.2",
          }}
        >
          Welcome to Premium!
        </h1>

        <p
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
            color: "#d0d0d0",
            marginBottom: "30px",
            lineHeight: "1.6",
          }}
        >
          Your subscription has been activated successfully. You now have
          unlimited access to all audiobooks in our library!
        </p>

        <div
          style={{
            background: "rgba(134, 239, 172, 0.1)",
            border: "1px solid rgba(134, 239, 172, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              color: "#86efac",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            ✅ Payment confirmed
            <br />
            ✅ Premium access activated
            <br />✅ All audiobooks unlocked
          </p>
        </div>

        {sessionId && (
          <p
            style={{
              fontSize: "0.9rem",
              color: "#999",
              marginBottom: "30px",
            }}
          >
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}

        <Link
          href="/audiobooks"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
            borderRadius: "12px",
            color: "#000",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "1.1rem",
            boxShadow: "0 4px 15px rgba(255, 216, 155, 0.3)",
            transition: "all 0.3s",
          }}
        >
          Start Listening Now →
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Loading...
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
