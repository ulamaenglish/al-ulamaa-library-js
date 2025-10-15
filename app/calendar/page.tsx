"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import LivePrayerTimer from "@/components/LivePrayerTimer";
import QiblaCompass from "@/components/QiblaCompass";
import {
  getCurrentHijriDate,
  getHijriCalendar,
  getPrayerTimes,
} from "@/lib/islamicCalendar";
import {
  shiaEvents,
  getEventForDay,
  islamicMonths,
  IslamicEvent,
} from "./data/shia-events";
import { downloadICS } from "@/lib/calendarExport";
import {
  translations,
  Language,
  TranslationKey,
  getTranslation,
} from "@/lib/translations";

// Major cities for prayer times
const CITIES = [
  { name: "Qom", country: "Iran", label: "Qom, Iran 🇮🇷" },
  { name: "Najaf", country: "Iraq", label: "Najaf, Iraq 🇮🇶" },
  { name: "Karbala", country: "Iraq", label: "Karbala, Iraq 🇮🇶" },
  { name: "Mashhad", country: "Iran", label: "Mashhad, Iran 🇮🇷" },
  { name: "Tehran", country: "Iran", label: "Tehran, Iran 🇮🇷" },
  { name: "Mecca", country: "Saudi Arabia", label: "Mecca, Saudi Arabia 🇸🇦" },
  { name: "Medina", country: "Saudi Arabia", label: "Medina, Saudi Arabia 🇸🇦" },
  { name: "Dearborn", country: "USA", label: "Dearborn, USA 🇺🇸" },
  { name: "London", country: "United Kingdom", label: "London, UK 🇬🇧" },
  { name: "Toronto", country: "Canada", label: "Toronto, Canada 🇨🇦" },
  { name: "Montreal", country: "Canada", label: "Montreal, Canada 🇨🇦" },
  { name: "Ottawa", country: "Canada", label: "Ottawa, Canada 🇨🇦" },
  { name: "Sydney", country: "Australia", label: "Sydney, Australia 🇦🇺" },
  { name: "Dubai", country: "United Arab Emirates", label: "Dubai, UAE 🇦🇪" },
  { name: "Lahore", country: "Pakistan", label: "Lahore, Pakistan 🇵🇰" },
  { name: "Mumbai", country: "India", label: "Mumbai, India 🇮🇳" },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export default function IslamicCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentHijriDate, setCurrentHijriDate] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(1447);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<IslamicEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IslamicEvent[]>([]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [loadingPrayer, setLoadingPrayer] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IslamicEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: TranslationKey) => getTranslation(language, key);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load saved language
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }

    loadCalendarData();
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadCalendarMonth(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedCity) {
      loadPrayerTimes(selectedCity.name, selectedCity.country);
    }
  }, [selectedCity]);

  // Update upcoming events when selected month changes
  useEffect(() => {
    if (currentHijriDate) {
      const isCurrentMonth =
        selectedMonth === currentHijriDate.month &&
        selectedYear === currentHijriDate.year;

      if (isCurrentMonth) {
        // Show events from today onwards
        const upcoming = getUpcomingEvents(
          currentHijriDate.day,
          currentHijriDate.month,
          currentHijriDate.year,
          false
        );
        setUpcomingEvents(upcoming);
      } else {
        // Show events from the beginning of selected month
        const upcoming = getUpcomingEvents(
          1,
          selectedMonth,
          selectedYear,
          true
        );
        setUpcomingEvents(upcoming);
      }
    }
  }, [selectedMonth, selectedYear, currentHijriDate]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const loadCalendarData = async () => {
    try {
      setLoading(true);

      const hijriDate = await getCurrentHijriDate();
      if (hijriDate) {
        setCurrentHijriDate(hijriDate);
        setSelectedMonth(hijriDate.month);
        setSelectedYear(hijriDate.year);

        const eventsToday = shiaEvents.filter(
          (event) =>
            event.day === hijriDate.day && event.month === hijriDate.month
        );
        setTodayEvents(eventsToday);

        const upcoming = getUpcomingEvents(
          hijriDate.day,
          hijriDate.month,
          hijriDate.year,
          false
        );
        setUpcomingEvents(upcoming);
      }

      await loadPrayerTimes(selectedCity.name, selectedCity.country);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrayerTimes = async (city: string, country: string) => {
    try {
      setLoadingPrayer(true);
      const prayers = await getPrayerTimes(city, country);
      if (prayers) {
        setPrayerTimes(prayers);
      }
    } catch (error) {
      console.error("Error loading prayer times:", error);
    } finally {
      setLoadingPrayer(false);
    }
  };

  const loadCalendarMonth = async (month: number, year: number) => {
    try {
      const calendar = await getHijriCalendar(month, year);
      if (calendar && Array.isArray(calendar)) {
        setCalendarDays(calendar);
      } else {
        generateFallbackCalendar(month, year);
      }
    } catch (error) {
      console.error("Error loading month:", error);
      generateFallbackCalendar(month, year);
    }
  };

  const generateFallbackCalendar = (month: number, year: number) => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      days.push({
        hijri: {
          day: i.toString().padStart(2, "0"),
          month: { number: month, en: islamicMonths[month - 1]?.name },
          year: year.toString(),
        },
      });
    }
    setCalendarDays(days);
  };

  const getUpcomingEvents = (
    currentDay: number,
    currentMonth: number,
    currentYear: number,
    fromSelectedMonth: boolean = false
  ): IslamicEvent[] => {
    const upcoming: IslamicEvent[] = [];
    let dayCounter = fromSelectedMonth ? 1 : currentDay;
    let monthCounter = currentMonth;
    let yearCounter = currentYear;

    // If we're looking from selected month, start from current day if same month
    if (fromSelectedMonth && currentHijriDate) {
      if (
        selectedMonth === currentHijriDate.month &&
        selectedYear === currentHijriDate.year
      ) {
        dayCounter = currentHijriDate.day;
      }
    }

    for (let i = 0; i < 90; i++) {
      dayCounter++;
      if (dayCounter > 30) {
        dayCounter = 1;
        monthCounter++;
        if (monthCounter > 12) {
          monthCounter = 1;
          yearCounter++;
        }
      }

      const event = getEventForDay(dayCounter, monthCounter);
      if (event) {
        upcoming.push({
          ...event,
          day: dayCounter,
          month: monthCounter,
          year: yearCounter,
        });
        if (upcoming.length >= 10) break;
      }
    }

    return upcoming;
  };

  // Get events for the currently selected month
  const getEventsForSelectedMonth = (): IslamicEvent[] => {
    const monthEvents: IslamicEvent[] = [];

    for (let day = 1; day <= 30; day++) {
      const event = getEventForDay(day, selectedMonth);
      if (event) {
        monthEvents.push({
          ...event,
          day: day,
          month: selectedMonth,
          year: selectedYear,
        });
      }
    }

    return monthEvents;
  };

  const changeMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const goToToday = () => {
    if (currentHijriDate) {
      setSelectedMonth(currentHijriDate.month);
      setSelectedYear(currentHijriDate.year);
    }
  };

  const handleExportCalendar = () => {
    downloadICS(selectedYear);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "birth":
        return "#86efac";
      case "martyrdom":
        return "#dc2626";
      case "celebration":
        return "#ffd89b";
      case "special":
        return "#93c5fd";
      default:
        return "#ffd89b";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "birth":
        return "🌟";
      case "martyrdom":
        return "🕊️";
      case "celebration":
        return "🎉";
      case "special":
        return "✨";
      case "fasting":
        return "🌙";
      default:
        return "📅";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Particles />
        <div style={{ fontSize: "1.5rem", zIndex: 10 }}>⏳ {t("loading")}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        padding: "clamp(20px, 5vw, 40px)",
      }}
    >
      <Particles />

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "clamp(30px, 6vw, 40px)",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
              ← {t("home")}
            </button>

            {user && (
              <button
                onClick={() => router.push("/dashboard")}
                style={{
                  padding: "10px 20px",
                  background: "rgba(255, 216, 155, 0.2)",
                  border: "1px solid rgba(255, 216, 155, 0.4)",
                  borderRadius: "10px",
                  color: "#ffd89b",
                  cursor: "pointer",
                  fontSize: "clamp(0.85rem, 2vw, 1rem)",
                }}
              >
                📊 {t("dashboard")}
              </button>
            )}
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            style={{
              padding: "10px 15px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
            }}
          >
            {LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                style={{ background: "#1a1a1a" }}
              >
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              color: "white",
              marginBottom: "10px",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            🌙 {t("title")}
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              color: "#d0d0d0",
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Today's Date Card */}
        {currentHijriDate && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 216, 155, 0.2) 0%, rgba(25, 84, 123, 0.2) 100%)",
              border: "2px solid rgba(255, 216, 155, 0.4)",
              borderRadius: "20px",
              padding: "clamp(20px, 4vw, 30px)",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#d0d0d0",
                marginBottom: "10px",
              }}
            >
              {t("todayDate")}
            </div>
            <div
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#ffd89b",
                fontWeight: "900",
                marginBottom: "5px",
              }}
            >
              {currentHijriDate.day} {currentHijriDate.monthName}{" "}
              {currentHijriDate.year}
            </div>
            <div
              style={{
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                color: "#ffd89b",
                marginBottom: "10px",
                fontFamily: "Arabic, serif",
              }}
            >
              {currentHijriDate.monthNameArabic}
            </div>
            <div
              style={{ color: "#999", fontSize: "clamp(0.9rem, 2vw, 1rem)" }}
            >
              {currentHijriDate.gregorianDate}
            </div>
          </div>
        )}

        {/* Export Button */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={handleExportCalendar}
            style={{
              padding: "12px 30px",
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(76, 175, 80, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            📥 {t("exportCalendar")}
          </button>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
            gap: "clamp(20px, 4vw, 30px)",
            marginBottom: "40px",
            alignItems: "start",
          }}
        >
          {/* Calendar - SAME AS BEFORE */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "clamp(20px, 4vw, 30px)",
            }}
          >
            {/* Month Selector */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => changeMonth(-1)}
                style={{
                  padding: "10px 15px",
                  background: "rgba(255, 216, 155, 0.2)",
                  border: "1px solid rgba(255, 216, 155, 0.4)",
                  borderRadius: "10px",
                  color: "#ffd89b",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ←
              </button>

              <div style={{ textAlign: "center", flex: "1" }}>
                <div
                  style={{
                    color: "#ffd89b",
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    fontWeight: "700",
                  }}
                >
                  {islamicMonths[selectedMonth - 1]?.name} {selectedYear}
                </div>
                <div
                  style={{
                    color: "#d0d0d0",
                    fontSize: "clamp(1rem, 2vw, 1.2rem)",
                    fontFamily: "Arabic, serif",
                  }}
                >
                  {islamicMonths[selectedMonth - 1]?.arabic}
                </div>
              </div>

              <button
                onClick={() => changeMonth(1)}
                style={{
                  padding: "10px 15px",
                  background: "rgba(255, 216, 155, 0.2)",
                  border: "1px solid rgba(255, 216, 155, 0.4)",
                  borderRadius: "10px",
                  color: "#ffd89b",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                →
              </button>
            </div>

            {/* Go to Today Button */}
            {currentHijriDate &&
              (selectedMonth !== currentHijriDate.month ||
                selectedYear !== currentHijriDate.year) && (
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <button
                    onClick={goToToday}
                    style={{
                      padding: "10px 20px",
                      background:
                        "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                      border: "none",
                      borderRadius: "10px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      fontWeight: "600",
                      boxShadow: "0 4px 15px rgba(255, 216, 155, 0.3)",
                    }}
                  >
                    📅 {t("goToToday")}
                  </button>
                </div>
              )}

            {/* Calendar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "5px",
              }}
            >
              {/* Weekday Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    color: "#999",
                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                    fontWeight: "600",
                    padding: "10px 5px",
                  }}
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {Array.isArray(calendarDays) && calendarDays.length > 0 ? (
                calendarDays.map((dayData, index) => {
                  const hijriDay = parseInt(dayData.hijri.day);
                  const event = getEventForDay(hijriDay, selectedMonth);
                  const isToday =
                    currentHijriDate &&
                    hijriDay === currentHijriDate.day &&
                    selectedMonth === currentHijriDate.month;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (event) {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }
                      }}
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isToday
                          ? "rgba(255, 216, 155, 0.3)"
                          : event
                          ? `${event.color}22`
                          : "rgba(255, 255, 255, 0.03)",
                        border: isToday
                          ? "2px solid #ffd89b"
                          : event
                          ? `1px solid ${event.color}66`
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        cursor: event ? "pointer" : "default",
                        transition: "all 0.3s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (event) {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.borderColor = event.color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (event) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.borderColor = `${event.color}66`;
                        }
                      }}
                      title={event ? event.title : ""}
                    >
                      <div
                        style={{
                          color: isToday ? "#ffd89b" : "white",
                          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                          fontWeight: isToday ? "900" : "600",
                        }}
                      >
                        {hijriDay}
                      </div>
                      {event && (
                        <div
                          style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.8rem)" }}
                        >
                          {getEventTypeIcon(event.type)}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                  }}
                >
                  {t("loading")}
                </div>
              )}
            </div>

            {/* Legend */}
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  color: "#d0d0d0",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  marginBottom: "10px",
                  fontWeight: "600",
                }}
              >
                {t("legend")}:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "8px",
                }}
              >
                {[
                  { type: "birth", label: t("birth"), color: "#86efac" },
                  {
                    type: "martyrdom",
                    label: t("martyrdom"),
                    color: "#dc2626",
                  },
                  {
                    type: "celebration",
                    label: t("celebration"),
                    color: "#ffd89b",
                  },
                  { type: "special", label: t("special"), color: "#93c5fd" },
                ].map((item) => (
                  <div
                    key={item.type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        background: item.color,
                        borderRadius: "3px",
                      }}
                    />
                    <span
                      style={{
                        color: "#d0d0d0",
                        fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Live Prayer Timer */}
            <LivePrayerTimer prayerTimes={prayerTimes} />

            {/* Qibla Compass */}
            <QiblaCompass />

            {/* Today's Events */}
            {todayEvents.length > 0 && (
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
                  }}
                >
                  🌟 {t("todayEvents")}
                </h3>
                {todayEvents.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      background: `${event.color}22`,
                      border: `1px solid ${event.color}66`,
                      borderRadius: "12px",
                      padding: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {getEventTypeIcon(event.type)}
                      </span>
                      <div
                        style={{
                          color: event.color,
                          fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                          fontWeight: "700",
                        }}
                      >
                        {event.title}
                      </div>
                    </div>
                    <div
                      style={{
                        color: "#ffd89b",
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        marginBottom: "8px",
                        fontFamily: "Arabic, serif",
                      }}
                    >
                      {event.titleArabic}
                    </div>
                    <div
                      style={{
                        color: "#d0d0d0",
                        fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      {event.description}
                    </div>
                    {event.recommendedZiyarat && (
                      <button
                        onClick={() => {
                          if (!event.recommendedZiyarat) return;

                          const validZiyarats = [
                            "imam-hussain",
                            "imam-ali",
                            "imam-reza",
                            "lady-fatima",
                            "imam-mahdi",
                            "prophet-muhammad",
                          ];

                          if (
                            validZiyarats.includes(event.recommendedZiyarat)
                          ) {
                            router.push(`/ziyarat/${event.recommendedZiyarat}`);
                          } else {
                            router.push("/ziyarat");
                          }
                        }}
                        style={{
                          marginTop: "10px",
                          padding: "8px 15px",
                          background: "rgba(255, 216, 155, 0.2)",
                          border: "1px solid rgba(255, 216, 155, 0.4)",
                          borderRadius: "8px",
                          color: "#ffd89b",
                          cursor: "pointer",
                          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                          fontWeight: "600",
                        }}
                      >
                        🕌 {t("recommendedZiyarat")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* This Month's Events - Show when not current month */}
            {selectedMonth !== currentHijriDate?.month ||
            selectedYear !== currentHijriDate?.year ? (
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
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  📆 Events in {islamicMonths[selectedMonth - 1]?.name}
                </h3>
                {getEventsForSelectedMonth().length > 0 ? (
                  getEventsForSelectedMonth().map((event, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        borderLeft: `3px solid ${event.color}`,
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "12px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "5px",
                        }}
                      >
                        <span>{getEventTypeIcon(event.type)}</span>
                        <div
                          style={{
                            color: "white",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                            fontWeight: "600",
                          }}
                        >
                          {event.title}
                        </div>
                      </div>
                      <div
                        style={{
                          color: "#999",
                          fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
                        }}
                      >
                        {event.day} {islamicMonths[event.month - 1]?.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                      fontSize: "0.9rem",
                    }}
                  >
                    No events this month
                  </div>
                )}
              </div>
            ) : null}

            {/* Upcoming Events */}
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
                }}
              >
                📅 {t("upcomingEvents")}
              </h3>
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderLeft: `3px solid ${event.color}`,
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "5px",
                    }}
                  >
                    <span>{getEventTypeIcon(event.type)}</span>
                    <div
                      style={{
                        color: "white",
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        fontWeight: "600",
                      }}
                    >
                      {event.title}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#999",
                      fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
                    }}
                  >
                    {event.day} {islamicMonths[event.month - 1]?.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Prayer Times with Location Selector - KEEPING THIS AS IS */}
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
                  marginBottom: "15px",
                  fontWeight: "700",
                }}
              >
                🕌 {t("prayerTimes")}
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    color: "#d0d0d0",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  📍 {t("selectLocation")}:
                </label>
                <select
                  value={CITIES.findIndex((c) => c.name === selectedCity.name)}
                  onChange={(e) =>
                    setSelectedCity(CITIES[parseInt(e.target.value)])
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 216, 155, 0.3)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    cursor: "pointer",
                  }}
                >
                  {CITIES.map((city, index) => (
                    <option
                      key={index}
                      value={index}
                      style={{ background: "#1a1a1a" }}
                    >
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {loadingPrayer ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                  }}
                >
                  ⏳ {t("loading")}...
                </div>
              ) : prayerTimes ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    { name: "Fajr", time: prayerTimes.fajr },
                    { name: "Sunrise", time: prayerTimes.sunrise },
                    { name: "Dhuhr", time: prayerTimes.dhuhr },
                    { name: "Asr", time: prayerTimes.asr },
                    { name: "Maghrib", time: prayerTimes.maghrib },
                    { name: "Isha", time: prayerTimes.isha },
                  ].map((prayer) => (
                    <div
                      key={prayer.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "#d0d0d0",
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        }}
                      >
                        {prayer.name}
                      </span>
                      <span
                        style={{
                          color: "#ffd89b",
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          fontWeight: "600",
                        }}
                      >
                        {prayer.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                  }}
                >
                  Unable to load prayer times
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Modal - KEEPING AS IS (too long, but unchanged) */}
        {showEventModal && selectedEvent && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setShowEventModal(false)}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(25, 84, 123, 0.9) 0%, rgba(255, 216, 155, 0.9) 100%)",
                border: "2px solid rgba(255, 216, 155, 0.6)",
                borderRadius: "20px",
                padding: "clamp(25px, 5vw, 40px)",
                maxWidth: "600px",
                width: "100%",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "none",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  color: "white",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>

              <div
                style={{
                  fontSize: "4rem",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {getEventTypeIcon(selectedEvent.type)}
              </div>

              <h2
                style={{
                  color: "white",
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: "800",
                  textAlign: "center",
                  marginBottom: "10px",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                {selectedEvent.title}
              </h2>

              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                  textAlign: "center",
                  marginBottom: "20px",
                  fontFamily: "Arabic, serif",
                }}
              >
                {selectedEvent.titleArabic}
              </div>

              <div
                style={{
                  display: "inline-block",
                  padding: "8px 15px",
                  background: `${selectedEvent.color}33`,
                  border: `2px solid ${selectedEvent.color}`,
                  borderRadius: "20px",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    color: selectedEvent.color,
                    fontWeight: "700",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  }}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
                </span>
              </div>

              <p
                style={{
                  color: "white",
                  fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                  lineHeight: "1.7",
                  marginBottom: "25px",
                  textAlign: "center",
                }}
              >
                {selectedEvent.description}
              </p>

              {selectedEvent.recommendedZiyarat && (
                <button
                  onClick={() => {
                    if (!selectedEvent.recommendedZiyarat) return;

                    const validZiyarats = [
                      "imam-hussain",
                      "imam-ali",
                      "imam-reza",
                      "lady-fatima",
                      "imam-mahdi",
                      "prophet-muhammad",
                    ];

                    if (
                      validZiyarats.includes(selectedEvent.recommendedZiyarat)
                    ) {
                      router.push(
                        `/ziyarat/${selectedEvent.recommendedZiyarat}`
                      );
                    } else {
                      router.push("/ziyarat");
                    }
                    setShowEventModal(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "15px 25px",
                    background:
                      "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  🕌 {t("recommendedZiyarat")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            color: "#888",
            fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
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
