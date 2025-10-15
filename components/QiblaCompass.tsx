"use client";

import { useState, useEffect } from "react";

interface QiblaCompassProps {
  userLat?: number;
  userLng?: number;
}

export default function QiblaCompass({ userLat, userLng }: QiblaCompassProps) {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  const requestLocation = () => {
    setIsLoadingLocation(true);
    setPermissionDenied(false);
    setError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError("");
          setPermissionDenied(false);
          setIsLoadingLocation(false);
        },
        (err) => {
          setIsLoadingLocation(false);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setError("Location access denied.");
            // Default to Qom, Iran if location is denied
            setLocation({ lat: 34.6416, lng: 50.8746 });
          } else {
            setError("Unable to get your location.");
            setLocation({ lat: 34.6416, lng: 50.8746 });
          }
        }
      );
    } else {
      setIsLoadingLocation(false);
      setError("Geolocation is not supported by your browser.");
      setLocation({ lat: 34.6416, lng: 50.8746 });
    }
  };

  useEffect(() => {
    if (userLat && userLng) {
      setLocation({ lat: userLat, lng: userLng });
      setIsLoadingLocation(false);
    } else {
      requestLocation();
    }
  }, [userLat, userLng]);

  useEffect(() => {
    if (location) {
      const qibla = calculateQiblaDirection(location.lat, location.lng);
      setQiblaDirection(qibla);
    }
  }, [location]);

  // Calculate Qibla direction using spherical trigonometry
  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRad(lat);
    const lng1 = toRad(lng);
    const lat2 = toRad(KAABA_LAT);
    const lng2 = toRad(KAABA_LNG);

    const dLng = lng2 - lng1;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
  };

  // Get device compass heading (if available)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDeviceHeading(360 - event.alpha); // Adjust for direction
      }
    };

    // Check if device orientation is supported
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      // For iOS 13+ devices, need to request permission
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        // iOS 13+ devices
        // Note: This requires user interaction (button click) to work
      } else {
        // Non-iOS 13+ devices
        window.addEventListener("deviceorientation", handleOrientation);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  if (isLoadingLocation) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#999",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
        }}
      >
        📍 Getting your location...
      </div>
    );
  }

  if (!location || qiblaDirection === null) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#999",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
        }}
      >
        📍 Getting your location...
      </div>
    );
  }

  const arrowRotation = qiblaDirection - deviceHeading;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        padding: "clamp(20px, 4vw, 25px)",
      }}
    >
      <h3
        style={{
          color: "#ffd89b",
          fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
          marginBottom: "20px",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        🧭 Qibla Direction
      </h3>

      {permissionDenied && (
        <div
          style={{
            marginBottom: "15px",
            padding: "12px",
            background: "rgba(255, 193, 7, 0.2)",
            border: "1px solid rgba(255, 193, 7, 0.4)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#ffc107",
              fontSize: "0.9rem",
              marginBottom: "10px",
            }}
          >
            ⚠️ Location access denied. Using default location (Qom, Iran).
          </div>
          <button
            onClick={requestLocation}
            style={{
              padding: "8px 16px",
              background: "rgba(255, 193, 7, 0.3)",
              border: "1px solid rgba(255, 193, 7, 0.6)",
              borderRadius: "8px",
              color: "#ffc107",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            🔄 Enable Location Access
          </button>
        </div>
      )}

      {/* Compass */}
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "200px",
          margin: "0 auto 20px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "50%",
          border: "2px solid rgba(255, 216, 155, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Compass ring */}
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Cardinal directions */}
          <div
            style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
          >
            N
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#999",
              fontSize: "0.8rem",
            }}
          >
            S
          </div>
          <div
            style={{
              position: "absolute",
              right: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: "0.8rem",
            }}
          >
            E
          </div>
          <div
            style={{
              position: "absolute",
              left: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: "0.8rem",
            }}
          >
            W
          </div>
        </div>

        {/* Qibla arrow */}
        <div
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: "80px solid #ffd89b",
            transform: `rotate(${arrowRotation}deg)`,
            transformOrigin: "center bottom",
            bottom: "50%",
            transition: "transform 0.3s ease",
            filter: "drop-shadow(0 0 10px rgba(255, 216, 155, 0.8))",
          }}
        />

        {/* Center dot */}
        <div
          style={{
            width: "12px",
            height: "12px",
            background: "#ffd89b",
            borderRadius: "50%",
            zIndex: 10,
          }}
        />
      </div>

      {/* Direction Info */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#ffd89b",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: "900",
            marginBottom: "5px",
          }}
        >
          {Math.round(qiblaDirection)}°
        </div>
        <div
          style={{ color: "#d0d0d0", fontSize: "0.9rem", marginBottom: "5px" }}
        >
          Direction to Kaaba, Mecca
        </div>
        <div style={{ color: "#999", fontSize: "0.8rem" }}>
          📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "rgba(255, 216, 155, 0.1)",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#999",
          }}
        >
          📱 For best accuracy, hold your device flat and away from magnetic
          objects
        </div>
      </div>
    </div>
  );
}
