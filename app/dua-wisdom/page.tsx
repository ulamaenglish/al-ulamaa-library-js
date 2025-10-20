"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

interface Dua {
  id: number;
  title: string;
  titleArabic: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  whenToRecite: string;
  benefits: string;
  audioFile?: string; // For future audio implementation
}

const DUAS: Dua[] = [
  {
    id: 1,
    title: "Morning Dua",
    titleArabic: "دعاء الصباح",
    category: "Daily",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ",
    transliteration:
      "Asbahna wa asbahal-mulku lillahi rabbil-'alamin. Allahumma inni as'aluka khayra hadhal-yawmi fat-hahu wa nasrahu wa nurahu wa barakatahu wa hudah",
    translation:
      "We have entered the morning and with it all dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day, its victory, its help, its light, its blessings, and its guidance.",
    whenToRecite: "Every morning after Fajr prayer",
    benefits: "Seeking Allah's blessings and protection for the day ahead",
    audioFile: "/audio/duas/morning-dua.mp3",
  },
  {
    id: 2,
    title: "Evening Dua",
    titleArabic: "دعاء المساء",
    category: "Daily",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا",
    transliteration:
      "Amsayna wa amsal-mulku lillahi rabbil-'alamin. Allahumma inni as'aluka khayra hadhihil-laylati fat-haha wa nasraha wa nuraha wa barakataha wa hudaha",
    translation:
      "We have entered the evening and with it all dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this night, its victory, its help, its light, its blessings, and its guidance.",
    whenToRecite: "Every evening after Maghrib prayer",
    benefits: "Seeking Allah's protection and blessings for the night",
    audioFile: "/audio/duas/evening-dua.mp3",
  },
  {
    id: 3,
    title: "Before Eating",
    titleArabic: "دعاء قبل الطعام",
    category: "Meals",
    arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    transliteration: "Bismillahi wa 'ala barakatillah",
    translation: "In the name of Allah and with the blessings of Allah",
    whenToRecite: "Before every meal",
    benefits:
      "Seeking Allah's blessings in sustenance and expressing gratitude",
    audioFile: "/audio/duas/before-eating.mp3",
  },
  {
    id: 4,
    title: "After Eating",
    titleArabic: "دعاء بعد الطعام",
    category: "Meals",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration:
      "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    translation:
      "All praise is due to Allah who has given us food and drink and made us Muslims",
    whenToRecite: "After finishing a meal",
    benefits: "Expressing gratitude to Allah for His blessings",
    audioFile: "/audio/duas/after-eating.mp3",
  },
  {
    id: 5,
    title: "Travel Dua",
    titleArabic: "دعاء السفر",
    category: "Travel",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ",
    transliteration:
      "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    translation:
      "Glory be to Him who has subjected this to us, and we could never have it by our efforts. Surely, to our Lord we are returning.",
    whenToRecite: "When starting a journey",
    benefits: "Seeking Allah's protection during travel",
    audioFile: "/audio/duas/travel-dua.mp3",
  },
  {
    id: 6,
    title: "When Anxious or Distressed",
    titleArabic: "دعاء الكرب",
    category: "Relief",
    arabic:
      "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation:
      "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers. (Dua of Prophet Yunus)",
    whenToRecite: "When feeling anxious, worried, or in distress",
    benefits: "Relief from anxiety and hardship, answered prayers",
    audioFile: "/audio/duas/anxiety-dua.mp3",
  },
  {
    id: 7,
    title: "Before Sleep",
    titleArabic: "دعاء النوم",
    category: "Daily",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your name, O Allah, I die and I live",
    whenToRecite: "Before going to sleep",
    benefits: "Protection during sleep and hoping for a blessed awakening",
    audioFile: "/audio/duas/sleep-dua.mp3",
  },
  {
    id: 8,
    title: "Ayat al-Kursi (Verse of the Throne)",
    titleArabic: "آية الكرسي",
    category: "Protection",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    transliteration:
      "Allahu la ilaha illa Huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
    whenToRecite:
      "After every prayer, before sleep, or when seeking protection",
    benefits:
      "Powerful protection from all harm, blessed by the Prophet (pbuh)",
    audioFile: "/audio/duas/ayat-kursi.mp3",
  },
  {
    id: 9,
    title: "Tasbih al-Zahra",
    titleArabic: "تسبيح الزهراء",
    category: "After Prayer",
    arabic:
      "اللهُ أَكْبَرُ (34 مرة) - الْحَمْدُ لِلَّهِ (33 مرة) - سُبْحَانَ اللَّهِ (33 مرة)",
    transliteration:
      "Allahu Akbar (34 times) - Alhamdulillah (33 times) - SubhanAllah (33 times)",
    translation:
      "Allah is the Greatest (34 times) - All praise is due to Allah (33 times) - Glory be to Allah (33 times)",
    whenToRecite: "After every obligatory prayer",
    benefits:
      "Beloved practice taught by Prophet Muhammad (pbuh) to Lady Fatima (as), brings immense rewards",
    audioFile: "/audio/duas/tasbih-zahra.mp3",
  },
  {
    id: 10,
    title: "Dua al-Faraj (For Relief & Imam Mahdi)",
    titleArabic: "دعاء الفرج",
    category: "Relief",
    arabic:
      "اللَّهُمَّ كُنْ لِوَلِيِّكَ الْحُجَّةِ بْنِ الْحَسَنِ صَلَوَاتُكَ عَلَيْهِ وَعَلَى آبَائِهِ فِي هَذِهِ السَّاعَةِ وَفِي كُلِّ سَاعَةٍ وَلِيّاً وَحَافِظاً وَقَائِداً وَنَاصِراً وَدَلِيلاً وَعَيْناً حَتَّى تُسْكِنَهُ أَرْضَكَ طَوْعاً وَتُمَتِّعَهُ فِيهَا طَوِيلاً",
    transliteration:
      "Allahumma kun liwali yikal-hujjatibnil-Hasan, salawatuka 'alayhi wa 'ala aba'ihi, fi hadhihis-sa'ati wa fi kulli sa'atin waliyyan wa hafizan wa qa'idan wa nasiran wa dalilan wa 'aynan, hatta tuskinahu ardaka taw'an wa tumatti'ahu fiha tawila",
    translation:
      "O Allah, be for Your representative, the Hujjat (proof), son of Al-Hasan, Your blessings be on him and his forefathers, in this hour and in every hour, a guardian, a protector, a leader, a helper, a guide, and an eye until You make him live on the earth, in obedience, and cause him to enjoy it for a long time.",
    whenToRecite: "Daily, especially after prayers",
    benefits:
      "Hastening the reappearance of Imam Mahdi (as) and seeking relief from difficulties",
    audioFile: "/audio/duas/dua-faraj.mp3",
  },
  {
    id: 11,
    title: "For Guidance",
    titleArabic: "دعاء الهداية",
    category: "Guidance",
    arabic:
      "اللَّهُمَّ أَرِنَا الْحَقَّ حَقًّا وَارْزُقْنَا اتِّبَاعَهُ، وَأَرِنَا الْبَاطِلَ بَاطِلًا وَارْزُقْنَا اجْتِنَابَهُ",
    transliteration:
      "Allahumma arinal-haqqa haqqan warzuqnat-tiba'ah, wa arinal-batila batilan warzuqnaj-tinabah",
    translation:
      "O Allah, show us the truth as truth and grant us the ability to follow it, and show us falsehood as falsehood and grant us the ability to avoid it",
    whenToRecite: "When seeking clarity and guidance in decisions",
    benefits: "Seeking divine guidance to distinguish truth from falsehood",
    audioFile: "/audio/duas/guidance-dua.mp3",
  },
  {
    id: 12,
    title: "For Parents",
    titleArabic: "دعاء للوالدين",
    category: "Family",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani saghira",
    translation:
      "My Lord, have mercy upon them as they brought me up when I was small",
    whenToRecite: "Anytime, especially in prayer",
    benefits: "Seeking Allah's mercy and blessings for one's parents",
    audioFile: "/audio/duas/parents-dua.mp3",
  },
];

export default function DuaWisdomPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const categories = [
    "All",
    "Daily",
    "Meals",
    "Travel",
    "Relief",
    "Protection",
    "After Prayer",
    "Guidance",
    "Family",
  ];

  const filteredDuas = DUAS.filter((dua) => {
    const matchesCategory =
      selectedCategory === "All" || dua.category === selectedCategory;
    const matchesSearch =
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.titleArabic.includes(searchQuery) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDuaClick = (dua: Dua) => {
    setSelectedDua(dua);
    setShowModal(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dua-card {
          animation: fadeInUp 0.5s ease-out;
          transition: all 0.3s;
        }

        .dua-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 216, 155, 0.3);
        }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(20px, 5vw, 40px)",
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
                fontWeight: "600",
              }}
            >
              ← Home
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
                  fontWeight: "600",
                }}
              >
                📊 Dashboard
              </button>
            )}
          </div>

          {user && (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(255, 216, 155, 0.1)",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "10px",
                color: "#ffd89b",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                fontWeight: "600",
              }}
            >
              👤 {user.name}
            </div>
          )}
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
            🤲 Dua Wisdom
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              color: "#d0d0d0",
            }}
          >
            Essential Daily Supplications from Authentic Sources
          </p>
        </div>

        {/* Search Bar */}
        <div
          style={{
            marginBottom: "30px",
            maxWidth: "600px",
            margin: "0 auto 30px",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search duas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "15px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "15px",
              color: "white",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "10px 20px",
                background:
                  selectedCategory === category
                    ? "rgba(255, 216, 155, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${
                  selectedCategory === category
                    ? "rgba(255, 216, 155, 0.4)"
                    : "rgba(255, 255, 255, 0.1)"
                }`,
                borderRadius: "20px",
                color: selectedCategory === category ? "#ffd89b" : "white",
                cursor: "pointer",
                fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                fontWeight: "600",
                transition: "all 0.3s",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Duas Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
            gap: "25px",
          }}
        >
          {filteredDuas.map((dua, index) => (
            <div
              key={dua.id}
              className="dua-card"
              onClick={() => handleDuaClick(dua)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "clamp(20px, 4vw, 25px)",
                cursor: "pointer",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Category Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 12px",
                  background: "rgba(255, 216, 155, 0.2)",
                  border: "1px solid rgba(255, 216, 155, 0.4)",
                  borderRadius: "15px",
                  color: "#ffd89b",
                  fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                {dua.category}
              </div>

              {/* Title */}
              <h3
                style={{
                  color: "white",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                {dua.title}
              </h3>

              {/* Arabic Title */}
              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                  fontFamily: "Arabic, serif",
                  marginBottom: "15px",
                  textAlign: "right",
                }}
              >
                {dua.titleArabic}
              </div>

              {/* When to Recite */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#93c5fd",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  marginBottom: "10px",
                }}
              >
                <span>🕐</span>
                <span>{dua.whenToRecite}</span>
              </div>

              {/* Translation Preview */}
              <p
                style={{
                  color: "#d0d0d0",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  lineHeight: "1.6",
                  marginBottom: "15px",
                }}
              >
                {dua.translation.substring(0, 100)}...
              </p>

              {/* View Details Button */}
              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span>View Full Dua</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDuas.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#888",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🤲</div>
            <p style={{ fontSize: "1.2rem" }}>
              No duas found matching your search
            </p>
          </div>
        )}

        {/* Modal for Full Dua */}
        {showModal && selectedDua && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              overflow: "auto",
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(25, 84, 123, 0.95) 0%, rgba(255, 216, 155, 0.95) 100%)",
                border: "2px solid rgba(255, 216, 155, 0.6)",
                borderRadius: "20px",
                padding: "clamp(25px, 5vw, 40px)",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
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

              {/* Category Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 15px",
                  background: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "20px",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  marginBottom: "20px",
                }}
              >
                {selectedDua.category}
              </div>

              {/* Title */}
              <h2
                style={{
                  color: "white",
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: "800",
                  marginBottom: "10px",
                }}
              >
                {selectedDua.title}
              </h2>

              {/* Arabic Title */}
              <div
                style={{
                  color: "#ffd89b",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontFamily: "Arabic, serif",
                  marginBottom: "25px",
                  textAlign: "right",
                }}
              >
                {selectedDua.titleArabic}
              </div>

              {/* Arabic Text */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "20px",
                  borderRadius: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                    fontFamily: "Arabic, serif",
                    lineHeight: "2",
                    textAlign: "right",
                  }}
                >
                  {selectedDua.arabic}
                </div>
              </div>

              {/* Transliteration */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    color: "#ffd89b",
                    fontSize: "1.1rem",
                    marginBottom: "10px",
                  }}
                >
                  Transliteration:
                </h3>
                <p
                  style={{
                    color: "white",
                    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                    lineHeight: "1.8",
                    fontStyle: "italic",
                  }}
                >
                  {selectedDua.transliteration}
                </p>
              </div>

              {/* Translation */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    color: "#ffd89b",
                    fontSize: "1.1rem",
                    marginBottom: "10px",
                  }}
                >
                  Translation:
                </h3>
                <p
                  style={{
                    color: "white",
                    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                    lineHeight: "1.8",
                  }}
                >
                  {selectedDua.translation}
                </p>
              </div>

              {/* When to Recite */}
              <div
                style={{
                  background: "rgba(147, 197, 253, 0.2)",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                <h3
                  style={{
                    color: "#93c5fd",
                    fontSize: "1rem",
                    marginBottom: "8px",
                  }}
                >
                  🕐 When to Recite:
                </h3>
                <p style={{ color: "white", fontSize: "0.95rem" }}>
                  {selectedDua.whenToRecite}
                </p>
              </div>

              {/* Benefits */}
              <div
                style={{
                  background: "rgba(134, 239, 172, 0.2)",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    color: "#86efac",
                    fontSize: "1rem",
                    marginBottom: "8px",
                  }}
                >
                  ✨ Benefits:
                </h3>
                <p style={{ color: "white", fontSize: "0.95rem" }}>
                  {selectedDua.benefits}
                </p>
              </div>

              {/* Audio Player Placeholder */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "15px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#999", fontSize: "0.9rem" }}>
                  🎵 Audio recitation coming soon
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                  }}
                >
                  File: {selectedDua.audioFile}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
