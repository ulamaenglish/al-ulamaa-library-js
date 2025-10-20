"use client";

import { useState, useEffect } from "react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  schedulePrayerNotifications,
  PrayerNotificationSettings as PrayerSettings,
} from "@/lib/notificationManager";

interface PrayerNotificationSettingsProps {
  onClose: () => void;
  prayerTimes: any;
}

export default function PrayerNotificationSettings({
  onClose,
  prayerTimes,
}: PrayerNotificationSettingsProps) {
  const [settings, setSettings] = useState<PrayerSettings>(
    getNotificationSettings()
  );
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== "undefined" && Notification.permission === "granted"
  );

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);

    if (granted) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);

      if (prayerTimes) {
        schedulePrayerNotifications(prayerTimes);
      }

      alert(
        "✅ Notifications enabled! You'll be notified before prayer times."
      );
    } else {
      alert("❌ Please allow notifications in your browser settings");
    }
  };

  const handleToggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (newSettings.enabled && prayerTimes) {
      schedulePrayerNotifications(prayerTimes);
    }
  };

  const handleTogglePrayer = (prayer: keyof typeof settings.prayers) => {
    const newSettings = {
      ...settings,
      prayers: {
        ...settings.prayers,
        [prayer]: !settings.prayers[prayer],
      },
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (settings.enabled && prayerTimes) {
      schedulePrayerNotifications(prayerTimes);
    }
  };

  const handleReminderChange = (minutes: number) => {
    const newSettings = { ...settings, reminderMinutes: minutes };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (settings.enabled && prayerTimes) {
      schedulePrayerNotifications(prayerTimes);
    }
  };

  const handleToggleSound = () => {
    const newSettings = { ...settings, sound: !settings.sound };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  return (
    <div
      style={{
        background: "rgba(20, 20, 20, 0.98)",
        border: "2px solid rgba(147, 197, 253, 0.3)",
        borderRadius: "20px",
        maxWidth: "550px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "30px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ marginBottom: "25px", textAlign: "center" }}>
        <h2
          style={{
            color: "#93c5fd",
            fontSize: "2rem",
            marginBottom: "10px",
            fontWeight: "800",
          }}
        >
          🔔 Prayer Notifications
        </h2>
        <p style={{ color: "#999", fontSize: "0.95rem" }}>
          Get reminded before each prayer time
        </p>
      </div>

      {/* Enable Notifications */}
      {!permissionGranted ? (
        <div
          style={{
            background: "rgba(255, 216, 155, 0.1)",
            border: "1px solid rgba(255, 216, 155, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔔</div>
          <p
            style={{
              color: "#ffd89b",
              marginBottom: "15px",
              fontSize: "1.05rem",
            }}
          >
            Enable browser notifications to get prayer reminders
          </p>
          <button
            onClick={handleEnableNotifications}
            style={{
              padding: "12px 25px",
              background: "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "700",
              width: "100%",
            }}
          >
            Enable Notifications
          </button>
        </div>
      ) : (
        <>
          {/* Master Toggle */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                Notifications
              </div>
              <div style={{ color: "#999", fontSize: "0.85rem" }}>
                {settings.enabled ? "Enabled" : "Disabled"}
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              style={{
                padding: "8px 18px",
                background: settings.enabled
                  ? "rgba(134, 239, 172, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
                border: `1px solid ${
                  settings.enabled
                    ? "rgba(134, 239, 172, 0.4)"
                    : "rgba(239, 68, 68, 0.4)"
                }`,
                borderRadius: "8px",
                color: settings.enabled ? "#86efac" : "#fca5a5",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {settings.enabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Prayer Selection */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                color: "#93c5fd",
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "15px",
              }}
            >
              Select Prayers to be Notified
            </div>
            {Object.entries(settings.prayers).map(([prayer, enabled]) => (
              <div
                key={prayer}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "10px",
                  padding: "12px 15px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "white", textTransform: "capitalize" }}>
                  {prayer}
                </span>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() =>
                      handleTogglePrayer(
                        prayer as keyof typeof settings.prayers
                      )
                    }
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Reminder Time */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                color: "#93c5fd",
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "15px",
              }}
            >
              Remind me before
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
              }}
            >
              {[5, 10, 15, 30].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleReminderChange(minutes)}
                  style={{
                    padding: "10px",
                    background:
                      settings.reminderMinutes === minutes
                        ? "rgba(255, 216, 155, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${
                      settings.reminderMinutes === minutes
                        ? "rgba(255, 216, 155, 0.4)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                    borderRadius: "8px",
                    color:
                      settings.reminderMinutes === minutes ? "#ffd89b" : "#999",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ color: "white", fontSize: "1rem", fontWeight: "600" }}
              >
                Sound
              </div>
              <div style={{ color: "#999", fontSize: "0.85rem" }}>
                Play sound with notifications
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              style={{
                padding: "8px 18px",
                background: settings.sound
                  ? "rgba(134, 239, 172, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
                border: `1px solid ${
                  settings.sound
                    ? "rgba(134, 239, 172, 0.4)"
                    : "rgba(239, 68, 68, 0.4)"
                }`,
                borderRadius: "8px",
                color: settings.sound ? "#86efac" : "#fca5a5",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {settings.sound ? "ON" : "OFF"}
            </button>
          </div>
        </>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "rgba(147, 197, 253, 0.2)",
          border: "1px solid rgba(147, 197, 253, 0.4)",
          borderRadius: "10px",
          color: "#93c5fd",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "1rem",
        }}
      >
        Close
      </button>
    </div>
  );
}
