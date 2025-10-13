"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [khomeiniDropdownOpen, setKhomeiniDropdownOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

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
            <Link
              href="/"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              🏠 Home
            </Link>

            <Link
              href="/ayatollah-bahjat"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              📚 Ayatollah Bahjat
            </Link>

            {/* Imam Khomeini Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setKhomeiniDropdownOpen(true)}
              onMouseLeave={() => setKhomeiniDropdownOpen(false)}
            >
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e0e0e0",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                📖 Imam Khomeini ▾
              </button>

              {khomeiniDropdownOpen && (
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
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              📚 Shahid Mutahhari
            </Link>

            <Link
              href="/prayer-maasumeen"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              🙏 Prayer of Maasumeen
            </Link>

            <Link
              href="/mafatih-worship"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              🕌 Mafatih Worship
            </Link>

            <Link
              href="/necessity-supplications"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              📖 Necessity of Supplications
            </Link>

            <Link
              href="/stories-ulama"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              📚 Stories of Ulama
            </Link>

            <Link
              href="/worship-list"
              style={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.3s",
              }}
            >
              🕌 Worship List
            </Link>

            {/* User Menu */}
            {user ? (
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  alignItems: "center",
                  marginLeft: "20px",
                }}
              >
                <Link
                  href="/dashboard"
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255, 216, 155, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.4)",
                    borderRadius: "8px",
                    color: "#ffd89b",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  🚪 Logout
                </button>
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
                  marginLeft: "20px",
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
            }}
            className="mobile-menu-dropdown"
          >
            <Link
              href="/"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>
            <Link
              href="/ayatollah-bahjat"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📚 Ayatollah Bahjat
            </Link>
            <Link
              href="/imam-khomeini-hadith"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📖 Imam Khomeini - 40 Hadith
            </Link>
            <Link
              href="/imam-khomeini-poems"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              ✍️ Imam Khomeini - Poems
            </Link>
            <Link
              href="/shahid-mutahhari"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📚 Shahid Mutahhari
            </Link>
            <Link
              href="/prayer-maasumeen"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🙏 Prayer of Maasumeen
            </Link>
            <Link
              href="/mafatih-worship"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🕌 Mafatih Worship
            </Link>
            <Link
              href="/necessity-supplications"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📖 Necessity of Supplications
            </Link>
            <Link
              href="/stories-ulama"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              📚 Stories of Ulama
            </Link>
            <Link
              href="/worship-list"
              style={{
                display: "block",
                padding: "10px 0",
                color: "#e0e0e0",
                textDecoration: "none",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🕌 Worship List
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
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Dashboard
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
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Login
              </Link>
            )}
          </div>
        )}
      </nav>

      <style jsx global>{`
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
      `}</style>
    </>
  );
}
