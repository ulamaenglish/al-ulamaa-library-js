"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import PrayerNotificationSettings from "./PrayerNotificationSettings";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scholarsDropdownOpen, setScholarsDropdownOpen] = useState(false);
  const [khomeiniDropdownOpen, setKhomeiniDropdownOpen] = useState(false);
  const [worshipDropdownOpen, setWorshipDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] =
    useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const navFontFamily =
    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 216, 155, 0.2)",
          padding: "15px 20px",
          fontFamily: navFontFamily,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "900",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                cursor: "pointer",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              📖 ULAMA
            </div>
          </Link>

          {/* Desktop Menu */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
            className="desktop-menu"
          >
            {/* Home */}
            <Link
              href="/"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "500",
                transition: "color 0.3s",
                fontFamily: navFontFamily,
              }}
            >
              🏠 Home
            </Link>

            {/* Scholars Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setScholarsDropdownOpen(true)}
              onMouseLeave={() => setScholarsDropdownOpen(false)}
            >
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e0e0e0",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: navFontFamily,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffd89b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#e0e0e0")}
              >
                📚 Scholars {scholarsDropdownOpen ? "▴" : "▾"}
              </button>

              {scholarsDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "10px",
                    background: "rgba(20, 20, 20, 0.98)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "10px",
                    padding: "10px 0",
                    minWidth: "220px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <Link
                    href="/ayatollah-bahjat"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    Ayatollah Bahjat
                  </Link>

                  {/* Imam Khomeini Nested Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setKhomeiniDropdownOpen(true)}
                    onMouseLeave={() => setKhomeiniDropdownOpen(false)}
                  >
                    <div
                      style={{
                        padding: "10px 20px",
                        color: "#e0e0e0",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: navFontFamily,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 216, 155, 0.1)";
                        e.currentTarget.style.color = "#ffd89b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#e0e0e0";
                      }}
                    >
                      <span>Imam Khomeini</span>
                      <span>{khomeiniDropdownOpen ? "▸" : "▸"}</span>
                    </div>

                    {khomeiniDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          marginLeft: "5px",
                          background: "rgba(20, 20, 20, 0.98)",
                          border: "1px solid rgba(255, 216, 155, 0.3)",
                          borderRadius: "10px",
                          padding: "10px 0",
                          minWidth: "200px",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <Link
                          href="/imam-khomeini-hadith"
                          style={{
                            display: "block",
                            padding: "10px 20px",
                            color: "#e0e0e0",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            fontFamily: navFontFamily,
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255, 216, 155, 0.1)";
                            e.currentTarget.style.color = "#ffd89b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#e0e0e0";
                          }}
                        >
                          📜 40 Hadith & Adab
                        </Link>
                        <Link
                          href="/imam-khomeini-poems"
                          style={{
                            display: "block",
                            padding: "10px 20px",
                            color: "#e0e0e0",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            fontFamily: navFontFamily,
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255, 216, 155, 0.1)";
                            e.currentTarget.style.color = "#ffd89b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#e0e0e0";
                          }}
                        >
                          ✍️ Poems
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/shahid-mutahhari"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    Shahid Mutahhari
                  </Link>

                  <Link
                    href="/stories-ulama"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    Stories of Ulama
                  </Link>
                </div>
              )}
            </div>

            {/* Worship Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setWorshipDropdownOpen(true)}
              onMouseLeave={() => setWorshipDropdownOpen(false)}
            >
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e0e0e0",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: navFontFamily,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffd89b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#e0e0e0")}
              >
                🕌 Worship {worshipDropdownOpen ? "▴" : "▾"}
              </button>

              {worshipDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "10px",
                    background: "rgba(20, 20, 20, 0.98)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "10px",
                    padding: "10px 0",
                    minWidth: "240px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <Link
                    href="/prayer-maasumeen"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    🙏 Prayer of Maasumeen
                  </Link>
                  <Link
                    href="/mafatih-worship"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    📿 Mafatih Worship
                  </Link>
                  <Link
                    href="/necessity-supplications"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    📖 Necessity of Supplications
                  </Link>
                  <Link
                    href="/worship-list"
                    style={{
                      display: "block",
                      padding: "10px 20px",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      fontFamily: navFontFamily,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 216, 155, 0.1)";
                      e.currentTarget.style.color = "#ffd89b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    📋 Worship List
                  </Link>
                </div>
              )}
            </div>

            {/* Audiobooks */}
            <Link
              href="/audiobooks"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "500",
                transition: "color 0.3s",
                fontFamily: navFontFamily,
              }}
            >
              🎧 Audiobooks
            </Link>

            {/* Subscription */}
            <Link
              href="/subscription"
              style={{
                color: "#ffd89b",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "600",
                transition: "all 0.3s",
                fontFamily: navFontFamily,
                padding: "6px 12px",
                background: "rgba(255, 216, 155, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 216, 155, 0.3)",
              }}
            >
              ⭐ Subscription
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: "rgba(255, 216, 155, 0.1)",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#ffd89b",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s",
                fontFamily: navFontFamily,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 216, 155, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 216, 155, 0.1)";
              }}
            >
              🔍 Search
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.7,
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Ctrl+K
              </span>
            </button>

            {/* Prayer Notifications Button */}
            <button
              onClick={() =>
                setNotificationSettingsOpen(!notificationSettingsOpen)
              }
              style={{
                background: "rgba(147, 197, 253, 0.1)",
                border: "1px solid rgba(147, 197, 253, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#93c5fd",
                cursor: "pointer",
                fontSize: "1.2rem",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(147, 197, 253, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(147, 197, 253, 0.1)";
              }}
            >
              🔔
            </button>

            {/* User Menu - Dropdown */}
            {user ? (
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255, 216, 155, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.4)",
                    borderRadius: "8px",
                    color: "#ffd89b",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    fontFamily: navFontFamily,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  👤 {user.name} {userMenuOpen ? "▴" : "▾"}
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "10px",
                      background: "rgba(20, 20, 20, 0.98)",
                      border: "1px solid rgba(255, 216, 155, 0.3)",
                      borderRadius: "10px",
                      padding: "10px 0",
                      minWidth: "180px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <Link
                      href="/dashboard"
                      style={{
                        display: "block",
                        padding: "10px 20px",
                        color: "#e0e0e0",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        fontFamily: navFontFamily,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 216, 155, 0.1)";
                        e.currentTarget.style.color = "#ffd89b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#e0e0e0";
                      }}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      href="/my-library"
                      style={{
                        display: "block",
                        padding: "10px 20px",
                        color: "#e0e0e0",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        fontFamily: navFontFamily,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 216, 155, 0.1)";
                        e.currentTarget.style.color = "#ffd89b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#e0e0e0";
                      }}
                    >
                      📚 My Library
                    </Link>
                    <Link
                      href="/profile"
                      style={{
                        display: "block",
                        padding: "10px 20px",
                        color: "#e0e0e0",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        fontFamily: navFontFamily,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 216, 155, 0.1)";
                        e.currentTarget.style.color = "#ffd89b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#e0e0e0";
                      }}
                    >
                      ⚙️ Profile
                    </Link>
                    <div
                      style={{
                        borderTop: "1px solid rgba(255, 216, 155, 0.2)",
                        margin: "5px 0",
                      }}
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "10px 20px",
                        background: "transparent",
                        border: "none",
                        color: "#fca5a5",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        fontFamily: navFontFamily,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #19547b, #ffd89b)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  fontFamily: navFontFamily,
                }}
              >
                🔐 Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              display: "none",
            }}
            className="mobile-menu-button"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(10, 10, 10, 0.98)",
              border: "1px solid rgba(255, 216, 155, 0.2)",
              padding: "20px",
              display: "none",
              fontFamily: navFontFamily,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            className="mobile-menu-dropdown"
          >
            {/* Mobile Search & Notifications */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "rgba(255, 216, 155, 0.2)",
                  border: "1px solid rgba(255, 216, 155, 0.4)",
                  borderRadius: "8px",
                  color: "#ffd89b",
                  cursor: "pointer",
                  fontFamily: navFontFamily,
                  fontWeight: "500",
                }}
              >
                🔍 Search
              </button>
              <button
                onClick={() => {
                  setNotificationSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: "10px 20px",
                  background: "rgba(147, 197, 253, 0.2)",
                  border: "1px solid rgba(147, 197, 253, 0.4)",
                  borderRadius: "8px",
                  color: "#93c5fd",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                🔔
              </button>
            </div>

            <Link
              href="/"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>

            <div
              style={{
                marginTop: "10px",
                marginBottom: "5px",
                color: "#999",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              SCHOLARS
            </div>
            <Link
              href="/ayatollah-bahjat"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ayatollah Bahjat
            </Link>
            <Link
              href="/imam-khomeini-hadith"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Imam Khomeini - 40 Hadith
            </Link>
            <Link
              href="/imam-khomeini-poems"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Imam Khomeini - Poems
            </Link>
            <Link
              href="/shahid-mutahhari"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shahid Mutahhari
            </Link>
            <Link
              href="/stories-ulama"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Stories of Ulama
            </Link>

            <div
              style={{
                marginTop: "15px",
                marginBottom: "5px",
                color: "#999",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              WORSHIP
            </div>
            <Link
              href="/prayer-maasumeen"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🙏 Prayer of Maasumeen
            </Link>
            <Link
              href="/mafatih-worship"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📿 Mafatih Worship
            </Link>
            <Link
              href="/necessity-supplications"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📖 Necessity of Supplications
            </Link>
            <Link
              href="/worship-list"
              style={{
                display: "block",
                padding: "8px 0 8px 15px",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📋 Worship List
            </Link>

            <div
              style={{
                borderTop: "1px solid rgba(255, 216, 155, 0.2)",
                margin: "15px 0",
              }}
            />

            <Link
              href="/audiobooks"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "500",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🎧 Audiobooks
            </Link>

            <Link
              href="/subscription"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#ffd89b",
                textDecoration: "none",
                fontFamily: navFontFamily,
                fontWeight: "600",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⭐ Subscription
            </Link>

            <div
              style={{
                borderTop: "1px solid rgba(255, 216, 155, 0.2)",
                margin: "15px 0",
              }}
            />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    display: "block",
                    padding: "10px 0",
                    color: "#ffd89b",
                    textDecoration: "none",
                    fontFamily: navFontFamily,
                    fontWeight: "600",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/my-library"
                  style={{
                    display: "block",
                    padding: "10px 0",
                    color: "#ffd89b",
                    textDecoration: "none",
                    fontFamily: navFontFamily,
                    fontWeight: "600",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📚 My Library
                </Link>
                <Link
                  href="/profile"
                  style={{
                    display: "block",
                    padding: "10px 0",
                    color: "#ffd89b",
                    textDecoration: "none",
                    fontFamily: navFontFamily,
                    fontWeight: "600",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    cursor: "pointer",
                    marginTop: "10px",
                    fontFamily: navFontFamily,
                    fontWeight: "600",
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                style={{
                  display: "block",
                  padding: "10px",
                  background: "linear-gradient(135deg, #19547b, #ffd89b)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  textDecoration: "none",
                  textAlign: "center",
                  marginTop: "10px",
                  fontFamily: navFontFamily,
                  fontWeight: "600",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "20px",
            paddingTop: "80px",
            overflowY: "auto",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <GlobalSearchModal onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Prayer Notifications Settings Modal */}
      {notificationSettingsOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setNotificationSettingsOpen(false)}
        >
          <PrayerNotificationSettings
            onClose={() => setNotificationSettingsOpen(false)}
            prayerTimes={null}
          />
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap");

        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .mobile-menu-dropdown {
            display: block !important;
          }
        }

        a:hover {
          color: #ffd89b !important;
        }

        html,
        body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
      `}</style>
    </>
  );
}
