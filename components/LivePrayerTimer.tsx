"use client";

import { useState, useEffect } from "react";

interface PrayerTimerProps {
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  } | null;
}

export default function LivePrayerTimer({ prayerTimes }: PrayerTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: string;
    countdown: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Sunrise", time: prayerTimes.sunrise },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ];

    const prayerMinutes = prayers.map((prayer) => {
      const [time, period] = prayer.time.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }

      return {
        ...prayer,
        minutes: totalMinutes,
      };
    });

    // Find next prayer
    let next = prayerMinutes.find((p) => p.minutes > currentMinutes);

    if (!next) {
      // Next prayer is tomorrow's Fajr
      next = prayerMinutes[0];
      const minutesUntil = 24 * 60 - currentMinutes + next.minutes;
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      setNextPrayer({
        name: next.name,
        time: next.time,
        countdown: `${hours}h ${mins}m`,
      });
    } else {
      const minutesUntil = next.minutes - currentMinutes;
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      setNextPrayer({
        name: next.name,
        time: next.time,
        countdown: `${hours}h ${mins}m`,
      });
    }
  }, [currentTime, prayerTimes]);

  if (!nextPrayer) return null;

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 216, 155, 0.2) 0%, rgba(25, 84, 123, 0.2) 100%)",
        border: "2px solid rgba(255, 216, 155, 0.5)",
        borderRadius: "15px",
        padding: "20px",
        marginBottom: "20px",
        textAlign: "center",
        boxShadow: "0 8px 25px rgba(255, 216, 155, 0.3)",
      }}
    >
      <div
        style={{
          color: "#d0d0d0",
          fontSize: "clamp(0.9rem, 2vw, 1rem)",
          marginBottom: "8px",
        }}
      >
        Next Prayer
      </div>
      <div
        style={{
          color: "#ffd89b",
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          fontWeight: "900",
          marginBottom: "8px",
        }}
      >
        {nextPrayer.name}
      </div>
      <div
        style={{
          color: "white",
          fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
          fontWeight: "900",
          marginBottom: "5px",
          textShadow: "0 0 20px rgba(255, 216, 155, 0.6)",
        }}
      >
        {nextPrayer.countdown}
      </div>
      <div
        style={{
          color: "#999",
          fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
        }}
      >
        at {nextPrayer.time}
      </div>
    </div>
  );
}
