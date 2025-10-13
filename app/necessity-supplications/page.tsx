"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

interface Section {
  title: string;
  content: string;
  hasImage?: boolean;
  imagePath?: string;
  isQuote?: boolean;
}

const SECTIONS: Section[] = [
  {
    title: "📖 Intellectual Proof",
    content:
      "In the case of possibility, it is obligatory on us to keep ourselves from loss. On the other hand, every person certainly faces loss in this world. This is because each one of us comes across such issues which engage our minds, disturb our thoughts and harm us. These issues either emerge from our inner-self, such as a stimulus that causes our body to fall sick, or from an external stimulus such as the oppression of the oppressors, and those unpleasant things that we suffer from our neighbours and partners.\n\nIf someone is not suffering from these losses at present, then his intellect indicates towards the possibility of its occurrence in the future. How can we deny this reality while humans live in an accident prone atmosphere and this place never remains in one condition constantly and its difficulties cannot be separated from it?\n\nTherefore, the worldly calamities have certainly affected the human life or will affect him. And in the case of possibility and ability, we should remove each of them. It is with supplications that such an ability is achieved. Because supplications are in the boundaries of our ability, a man should regularly supplicate irrespective of his condition.",
  },
  {
    title: "✨ Words of Imam Ali (A.S.)",
    content:
      'The leader of the faithful, Imam Ali (A.S.), informed us:\n\n"One who has been entangled by calamities, though his calamities may be great, is worthier of supplicating than someone who is in good health, because even he is not safe from such calamities"\n\n"Duaa is the shield of a believer. When you knock the door excessively, it will at last open for you"',
    hasImage: true,
    imagePath: "/images/imamali.jpg",
    isQuote: true,
  },
  {
    title: "📚 Traditional Proof",
    content:
      "From the traditional perspective, it is evident that each one of us is in need of supplications, regardless of whether we have suffered a calamity or not. Supplications benefit us either by the removal of such calamities that have occurred or by distancing the evil that has reached us, or for the purpose of achieving a profit or benefit that we desire; or for the purpose of stabilizing, preserving and preventing our good things from destruction.\n\nThis is because our Holy Leaders (A.S.) have described Duaa (supplication) using the word Silaah (armour), and Silaah is a means of benefit and elimination of loss. Similarly, they have described supplication with the word Turs (shield), and Turs is something that stops the undesirable things from reaching a person.",
  },
  {
    title: "☪️ The Holy Prophet (P.B.U.H.)",
    content:
      'The Holy Prophet (P.B.U.H.) said:\n\n"Do you want me to guide you towards an armour which will rescue you from the enemies and increase your sustenance? They said: Yes, O Messenger of Allah! He replied: Call upon your Lord each day and night. Because Duaa is the armour for the faithful."',
    hasImage: true,
    imagePath: "/images/prophetmuhamad.jpg",
    isQuote: true,
  },
  {
    title: "🌟 Imam Kazim (A.S.)",
    content:
      'Imam Kazim (A.S.) is reported to have said:\n\n"I recommend you towards Duaa, indeed Duaa and supplicating the Almighty God keeps away the calamity while it has been destined and the Divine decree has been announced regarding it but only its application is awaited, and if the Almighty is invocated and one seeks the cancellation of calamity from Him, He will cancel it"',
    hasImage: true,
    imagePath: "/images/imamkazim.jpg",
  },
  {
    title: "🙏 Seeking Intercession (Shifaat)",
    content:
      'Our leader, Imam Kazim (A.S.) has said:\n\n"O Lord! I request you for the sake of Mohammad (S.A.W.S.) and Ali (A.S.), because these two honorable personalities hold dignity, status, importance and high regard in Your Presence. Thus, send your blessings on them for the sake of the dignity and status they hold near You and act upon my request."',
  },
  {
    title: "📿 The Right Way for Duaa",
    content:
      'Imam (A.S.) said:\n\n"First exaltation and then request and demand from God. Thus, when you call the Almighty God (S.W.T.), begin by praising, exalting and glorifying Him."\n\nThe narrator asked: How should I glorify Him?\n\nImam (A.S.) said:\n\n"Say: \'O He who is nearer to me than my jugular vein, O He who intervenes between man and his heart, O He who is in a High perspective, O He alike whom there is nothing\'."',
  },
  {
    title: "💡 An Admonition From Hajj Sheikh Rajab Ali Al-Khayat",
    content:
      '"After we have clarified the necessity for offering prayer for the leader of the time (may our soul be sacrificed for him) it is compulsory for us not to focus our intention when supplicating only to reach some prestige rather we should pray to God seeking for His pleasure, nearness to Him and the awaiting leader (peace be upon him). Then you should be aware of this matter."\n\nSayyid Ashsharafi (may Allah be pleased with him) said:\n\n"We do travel to different countries for the purpose of propagating Islam. In one of our journeys which was very close to the holy month of Ramadan, I was along with some of my friends under the service of Hajj Sheikh Rajab Ali Al-Khayyat, we demanded him to teach and admonish us, he taught us how to use this holy verse: {And whosoever fears God}"\n\n"He said: we should first give alms (sadaqah), fast for forty days and recite the verse while fasting. In a nutshell what was important in his explanation (may Allah raise his position) is as follows: This duty must be with the intention of nearness to the eighth Imam (peace be upon him) and should not be done seeking for materials."\n\nSayyid Ashsharafi said:\n\n"I commenced the assignment but was not able to conclude it while I stopped, but my friend completed the assignment and he later travelled to the holy city of Mash\'had to visit Imam Ali Rida, the eighth Imam (peace be upon him) and saw him in a form of light and after a while he was able to witness and talk with the Imam (peace be upon him)."\n\nIt is then incumbent upon anybody that offers prayers not to misuse the opportunity rather he should offer his prayers as worship without interfering in the issues concerning God and should not try to attract people to himself.',
    hasImage: true,
    imagePath: "/images/alikhayat.jpg",
  },
];

export default function NecessitySupplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Load user from localStorage and track page view (run once on mount)
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Track page view immediately after loading user
      addToHistory(userData.username, "Importance of Supplication");
    }
  }, []); // Empty dependency array = run only once!

  const handleSaveSection = async (title: string, content: string) => {
    if (!user) {
      alert("Please login to save sections!");
      router.push("/login");
      return;
    }

    try {
      const result = await saveQuote(user.username, title, content);
      if (result.success) {
        alert("Section saved successfully!");
      } else {
        alert(result.message || "Already saved");
      }
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  const handleAddNote = async (title: string) => {
    if (!user) {
      alert("Please login to add notes!");
      router.push("/login");
      return;
    }

    if (!noteText.trim()) {
      alert("Please enter a note!");
      return;
    }

    try {
      await addNote(user.username, title, noteText);
      alert("Note saved!");
      setAddingNoteFor(null);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        padding: "20px",
      }}
    >
      <Particles />

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
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
            }}
          >
            &larr; Back
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
              }}
            >
              📊 Dashboard
            </button>
          )}
        </div>

        {/* Page Title */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 20px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.8rem",
              fontWeight: "900",
              marginBottom: "5px",
              letterSpacing: "2px",
              color: "white",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            🤲 The Importance of Supplication
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Understanding the Power of Duaa
          </p>
        </div>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 216, 155, 0.5), transparent)",
            margin: "40px 0",
          }}
        />

        {/* Content Sections */}
        {SECTIONS.map((section, index) => (
          <div key={index}>
            <h2
              style={{
                color: "#ffd89b",
                fontSize: "1.8rem",
                marginTop: "40px",
                marginBottom: "20px",
                textAlign: "center",
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {section.title}
            </h2>

            {/* Image if exists */}
            {section.hasImage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ maxWidth: "500px", width: "100%" }}>
                  <img
                    src={section.imagePath}
                    alt={section.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "15px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content Box */}
            <div
              style={{
                background: section.isQuote
                  ? "linear-gradient(135deg, rgba(25, 84, 123, 0.3) 0%, rgba(255, 216, 155, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                borderRadius: "15px",
                border: "2px solid rgba(255, 216, 155, 0.3)",
                padding: "30px",
                margin: "20px 0",
                color: "#f5f5f5",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                fontFamily: "'Georgia', serif",
                fontSize: "17px",
                lineHeight: "1.9",
                textAlign: "justify",
                backdropFilter: "blur(10px)",
                borderLeft: section.isQuote ? "5px solid #ffd89b" : "none",
                whiteSpace: "pre-wrap",
              }}
            >
              {section.content}
            </div>

            {/* Action Buttons */}
            {user && (
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                  marginBottom: "40px",
                }}
              >
                <button
                  onClick={() =>
                    handleSaveSection(section.title, section.content)
                  }
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255, 216, 155, 0.2)",
                    border: "1px solid rgba(255, 216, 155, 0.4)",
                    borderRadius: "10px",
                    color: "#ffd89b",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  💾 Save
                </button>

                <button
                  onClick={() => setAddingNoteFor(section.title)}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  📝 Add Note
                </button>

                {/* Add Note Form */}
                {addingNoteFor === section.title && (
                  <div style={{ width: "100%", marginTop: "10px" }}>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Your reflection..."
                      style={{
                        width: "100%",
                        padding: "15px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "10px",
                        color: "white",
                        fontSize: "15px",
                        minHeight: "100px",
                        marginBottom: "10px",
                        fontFamily: "inherit",
                      }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleAddNote(section.title)}
                        style={{
                          padding: "10px 20px",
                          background:
                            "linear-gradient(135deg, #19547b, #ffd89b)",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => {
                          setAddingNoteFor(null);
                          setNoteText("");
                        }}
                        style={{
                          padding: "10px 20px",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "10px",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {index < SECTIONS.length - 1 && (
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 216, 155, 0.5), transparent)",
                  margin: "40px 0",
                }}
              />
            )}
          </div>
        ))}

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            color: "#888",
            fontSize: "0.9rem",
            padding: "20px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p style={{ marginBottom: "5px" }}>
            © 2025{" "}
            <span style={{ color: "#ffd89b", fontWeight: "600" }}>ULAMA</span> |
            All rights reserved
          </p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            May Allah accept our supplications
          </p>
        </div>
      </div>
    </div>
  );
}
