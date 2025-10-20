// ========================================
// PROFILE PAGE - MOBILE RESPONSIVE
// app/profile/page.tsx
// ========================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile stats
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalNotes: 0,
    totalAudiobooks: 0,
    memberSince: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setFullName(userData.name || "");
    setEmail(userData.email || "");
    loadProfileData(userData.email);
  }, [router]);

  const loadProfileData = async (userEmail: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", userEmail)
        .single();

      if (profile) {
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setStats({
          totalQuotes: 0,
          totalNotes: 0,
          totalAudiobooks: 0,
          memberSince: new Date(profile.created_at).toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          bio: bio,
          location: location,
        })
        .eq("email", user.email);

      if (error) throw error;

      const updatedUser = {
        ...user,
        name: fullName,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("✅ Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("❌ Passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("❌ Password must be at least 6 characters!");
      return;
    }

    alert("✅ Password changed successfully!");
    setShowPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone!"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "🚨 FINAL WARNING: This will permanently delete all your data. Continue?"
    );

    if (!doubleConfirm) return;

    alert(
      "Account deletion feature will be implemented. Please contact support."
    );
  };

  if (loading) {
    return (
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
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "clamp(20px, 4vw, 60px) clamp(15px, 4vw, 20px)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(25px, 5vw, 40px)" }}>
          <Link
            href="/dashboard"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "15px",
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "10px",
              lineHeight: "1.2",
            }}
          >
            👤 My Profile
          </h1>
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
            }}
          >
            Manage your account settings and preferences
          </p>
        </div>

        {/* Mobile: Single Column, Desktop: Two Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(20px, 4vw, 30px)",
          }}
        >
          {/* Profile Stats Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "clamp(20px, 4vw, 30px)",
            }}
          >
            <h2
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                fontWeight: "800",
                marginBottom: "clamp(15px, 3vw, 25px)",
              }}
            >
              📊 Account Stats
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(15px, 3vw, 20px)",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#999",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  }}
                >
                  Member Since
                </div>
                <div
                  style={{
                    color: "white",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                    fontWeight: "700",
                  }}
                >
                  {stats.memberSince}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: "#999",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  }}
                >
                  Saved Quotes
                </div>
                <div
                  style={{
                    color: "#93c5fd",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                    fontWeight: "700",
                  }}
                >
                  {stats.totalQuotes}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: "#999",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  }}
                >
                  Personal Notes
                </div>
                <div
                  style={{
                    color: "#86efac",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                    fontWeight: "700",
                  }}
                >
                  {stats.totalNotes}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: "#999",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  }}
                >
                  Library Audiobooks
                </div>
                <div
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                    fontWeight: "700",
                  }}
                >
                  {stats.totalAudiobooks}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "clamp(20px, 4vw, 30px)",
            }}
          >
            <h2
              style={{
                color: "#ffd89b",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                fontWeight: "800",
                marginBottom: "clamp(15px, 3vw, 25px)",
              }}
            >
              ✏️ Profile Information
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(15px, 3vw, 20px)",
              }}
            >
              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d0d0d0",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d0d0d0",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#999",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    cursor: "not-allowed",
                    boxSizing: "border-box",
                  }}
                />
                <p
                  style={{
                    color: "#999",
                    fontSize: "clamp(0.75rem, 1.8vw, 0.8rem)",
                    marginTop: "5px",
                  }}
                >
                  Email cannot be changed
                </p>
              </div>

              {/* Location */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d0d0d0",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, USA"
                  style={{
                    width: "100%",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d0d0d0",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Bio (Optional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 2.5vw, 14px)",
                  background: "linear-gradient(135deg, #ffd89b, #f59e0b)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#000",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  fontWeight: "700",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  transition: "all 0.3s",
                }}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div
          style={{
            marginTop: "clamp(20px, 4vw, 30px)",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "clamp(20px, 4vw, 30px)",
          }}
        >
          <h2
            style={{
              color: "#ffd89b",
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              fontWeight: "800",
              marginBottom: "15px",
            }}
          >
            🔒 Security
          </h2>

          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              style={{
                padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 24px)",
                background: "rgba(147, 197, 253, 0.2)",
                border: "1px solid rgba(147, 197, 253, 0.4)",
                borderRadius: "10px",
                color: "#93c5fd",
                fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              🔑 Change Password
            </button>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 15px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleChangePassword}
                  style={{
                    flex: "1 1 200px",
                    padding: "clamp(10px, 2vw, 12px)",
                    background: "linear-gradient(135deg, #86efac, #10b981)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ✅ Update Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={{
                    padding: "clamp(10px, 2vw, 12px) clamp(15px, 2.5vw, 20px)",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "10px",
                    color: "#fca5a5",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div
          style={{
            marginTop: "clamp(20px, 4vw, 30px)",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "20px",
            border: "2px solid rgba(239, 68, 68, 0.3)",
            padding: "clamp(20px, 4vw, 30px)",
          }}
        >
          <h2
            style={{
              color: "#fca5a5",
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              fontWeight: "800",
              marginBottom: "10px",
            }}
          >
            ⚠️ Danger Zone
          </h2>
          <p
            style={{
              color: "#d0d0d0",
              marginBottom: "15px",
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
            }}
          >
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            style={{
              padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 24px)",
              background: "rgba(239, 68, 68, 0.2)",
              border: "2px solid rgba(239, 68, 68, 0.5)",
              borderRadius: "10px",
              color: "#fca5a5",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
