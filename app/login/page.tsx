"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { loginUser, registerUser } from "@/lib/database";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!loginUsername || !loginPassword) {
      setMessage({ type: "error", text: "❌ Please fill in all fields" });
      setLoading(false);
      return;
    }

    try {
      const result = await loginUser(loginUsername, loginPassword);

      if (result.success && result.user) {
        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(result.user));

        setMessage({
          type: "success",
          text: "✅ Login successful! Redirecting...",
        });

        setTimeout(() => {
          router.push("/");
          // Force reload to update navbar
          window.location.href = "/";
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "❌ Invalid username or password",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: "❌ An error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (
      !regUsername ||
      !regFullName ||
      !regEmail ||
      !regPassword ||
      !regConfirmPassword
    ) {
      setMessage({ type: "error", text: "❌ Please fill in all fields" });
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(regUsername)) {
      setMessage({
        type: "error",
        text: "❌ Username must be 3-20 characters (letters, numbers, underscore only)",
      });
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(regEmail)) {
      setMessage({
        type: "error",
        text: "❌ Please enter a valid email address",
      });
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setMessage({
        type: "error",
        text: "❌ Password must be at least 6 characters long",
      });
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setMessage({ type: "error", text: "❌ Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(
        regUsername,
        regEmail,
        regPassword,
        regFullName
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: "✅ Account created! Please check your email to confirm your account before logging in.",
        });

        // Clear form
        setRegUsername("");
        setRegFullName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");

        // Switch to login tab after 3 seconds
        setTimeout(() => {
          setActiveTab("login");
          setMessage(null);
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text:
            result.message || "❌ Error creating account. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: "❌ An error occurred. Please try again.",
      });
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <Particles />

      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Title at TOP */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              marginBottom: "30px",
              background:
                "linear-gradient(to right, #ffffff, #ffd89b, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 20px rgba(255, 216, 155, 0.6)",
            }}
          >
            Al-Ulamaa Library
          </h1>

          <p
            style={{
              color: "#d0d0d0",
              fontSize: "1.1rem",
              marginBottom: "0",
            }}
          >
            A curated collection of Islamic spiritual works and scholarly wisdom
          </p>
        </div>

        {/* Card with LOTS of padding */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "30px",
            padding: "50px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Tabs with space */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "10px",
              marginBottom: "40px",
            }}
          >
            <button
              onClick={() => {
                setActiveTab("login");
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: "15px 25px",
                borderRadius: "25px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s",
                background:
                  activeTab === "login"
                    ? "rgba(255, 216, 155, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                color: activeTab === "login" ? "#ffd89b" : "#9ca3af",
                border:
                  activeTab === "login"
                    ? "1px solid rgba(255, 216, 155, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              🔐 Login
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: "15px 25px",
                borderRadius: "25px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s",
                background:
                  activeTab === "register"
                    ? "rgba(255, 216, 155, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                color: activeTab === "register" ? "#ffd89b" : "#9ca3af",
                border:
                  activeTab === "register"
                    ? "1px solid rgba(255, 216, 155, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              📝 Register
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: "30px",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
                background:
                  message.type === "success"
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(239, 68, 68, 0.2)",
                color: message.type === "success" ? "#86efac" : "#fca5a5",
                border:
                  message.type === "success"
                    ? "1px solid rgba(34, 197, 94, 0.4)"
                    : "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              <div>{message.text}</div>

              {/* If email already registered, show switch to login button */}
              {message.text.includes("already registered") && (
                <button
                  onClick={() => {
                    setActiveTab("login");
                    setMessage(null);
                  }}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    background: "rgba(255, 216, 155, 0.3)",
                    border: "1px solid rgba(255, 216, 155, 0.5)",
                    borderRadius: "8px",
                    color: "#ffd89b",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                  }}
                >
                  → Switch to Login
                </button>
              )}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  marginBottom: "40px",
                }}
              >
                Welcome Back
              </h2>

              <div style={{ marginBottom: "30px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ffd89b",
                    fontWeight: "600",
                    marginBottom: "10px",
                    fontSize: "1rem",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "40px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ffd89b",
                    fontWeight: "600",
                    marginBottom: "10px",
                    fontSize: "1rem",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "linear-gradient(to right, #1e3a8a, #ffd89b)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {loading ? "Logging in..." : "🔓 Login"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  marginBottom: "30px",
                }}
              >
                Create Account
              </h2>

              {[
                {
                  label: "Username*",
                  value: regUsername,
                  setter: setRegUsername,
                  type: "text",
                  placeholder: "Choose a username (3-20 characters)",
                },
                {
                  label: "Full Name*",
                  value: regFullName,
                  setter: setRegFullName,
                  type: "text",
                  placeholder: "Enter your full name",
                },
                {
                  label: "Email*",
                  value: regEmail,
                  setter: setRegEmail,
                  type: "email",
                  placeholder: "Enter your email",
                },
                {
                  label: "Password*",
                  value: regPassword,
                  setter: setRegPassword,
                  type: "password",
                  placeholder: "Choose a strong password",
                },
                {
                  label: "Confirm Password*",
                  value: regConfirmPassword,
                  setter: setRegConfirmPassword,
                  type: "password",
                  placeholder: "Re-enter your password",
                },
              ].map((field, index) => (
                <div key={index} style={{ marginBottom: "25px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#ffd89b",
                      fontWeight: "600",
                      marginBottom: "10px",
                      fontSize: "1rem",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      color: "white",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginTop: "10px",
                  background: "linear-gradient(to right, #1e3a8a, #ffd89b)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {loading ? "Creating account..." : "📝 Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
