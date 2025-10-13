"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

interface Story {
  title: string;
  emoji: string;
  content: string;
  image: string;
}

const STORIES: { [key: string]: Story } = {
  story1: {
    title: "Grand Ayatullah Khoei - The Miracle of Bismillah",
    emoji: "✨",
    content: `Late Mirza Shirazi had another servant named Sheikh Mohammad, who turned himself aloof of people after the death of Mirza. One day, a person went to Sheikh Mohammad and saw that he filled his lamp with water at the time of sunset and turned it on. He became extremely astonished and asked him the reason behind his act.

Sheikh Mohammad said in reply: After the death of Late Mirza, I disconnected myself from people and remained at home due to the grief and sorrow I felt by the departure of that great person. My heart was deeply aggrieved and my entire being was consumed by extreme sadness and sorrow. In the late hours of a day, a youth, who seemed to be an Arab student, came to me and gained attachment, and remained near me till sunset.

I was so overwhelmed by his words that all my sadness and sorrow flew away. He visited me for a few days until I became attached to him. On one of the days while he was talking to me, it came to my memory that my lamp does not have oil. As the tradition was at those times that all the shops were shut down by the sunset, so were they at night. Therefore, I was caught by the thought that if I leave my house to purchase oil, I would be deprived of his precious words. And if I do not purchase oil, I will have to spend the night in dark.

When he found me confused, he turned to me and said: What has happened to you that you do not lend ears to my words attentively? I said: I am attentive towards your speech. He said: Absolutely not, you do not pay appropriate attention to what I am saying. I said: Actually, my lamp does not have oil tonight. He said: It is a matter of extreme astonishment that we have recited so many Hadith for you and talked about the merits of Bismillahir Rahmanir Raheem, but you haven't benefitted even to such an extent that you can become independent of oil?

I said: I cannot recollect if you mentioned a Hadith in this regard! He said: Have you forgotten what I told you regarding the benefits and attributes of Bismillahir Rahmanir Raheem that when you recite it with a specific intention, that intention is attained? Fill your lamp with water but with the intention that the water attains the attributes of oil, say Bismillahir Rahmanir Raheem.

I accepted his word, then stood up and filled the lamp with water while I said Bismillahir Rahmanir Raheem at the same time with the same intention. When I turned on the lamp, it ignited and caught flame. Since that time, whenever the lamp becomes empty, I fill it with water and say Bismillahir Rahmanir Raheem, and it ignites.

After narrating this incident, Late Ayatullah Khoei said: What is worth astonishment is that after this incident became widespread and known between the people, the act performed by Sheikh Mohammad did not lose its effect. As you read above, the impact of reciting Bismillahir Rahmanir Raheem even once with certainty, is absolutely astonishing and unusual.

Those who possess the knowledge of Ism e Aazam (the great name), who are very few in number, also make use of those names which are common between the people. But that which differentiates their act from others, is their certainty, because certainty plays the most significant role in the effectiveness of the name pronounced.`,
    image: "/images/ayatollahkhoei.jpg",
  },
  story2: {
    title: "Hujjatul Islam Hajj Ismail Ashsharafi - Meeting the Imam",
    emoji: "🌙",
    content: `I went to the sacred place of Karbala to visit the lord of the martyrs (peace be upon him). I was then offering (Ziyarah) prayer and it occurred to me that visitor's prayer is accepted if he offers it at the blessed head position of Imam Husein. I then requested from Allah to grant me the opportunity of seeing my master, the leader of the time (peace be upon him).

When I was still engaged offering my (Ziyarah) prayer, his beautiful Sun rises even though I didn't know him but my mind inclines towards him. I went closer and saluted him inquiring from him who are you?

He said: "I am the most oppressed in this world!"

Then I didn't understand what he meant by his statement and I inspired to myself that he may be one of the learned scholars in Najaf whom people did not pay him attention, that is why he feels to be the first oppressed in the world!

He then went out of my sight hence I believe that God has accepted my prayer and that was my master the leader of the time whom I have just met with.`,
    image: "/images/hujatulislam.jpg",
  },
  story3: {
    title: "Hujjatul Islam Sayyid Ahmad Musawi - The Depressed Heart",
    emoji: "💚",
    content: `Hujjatul Islam Sayyid Ahmad Musawi (he is among those who are eager to see the leader of the time - May Almighty Allah hasten his reappearance) reported from Hujjatul Islam Sheikh Muhammad Ja'afar Al-Jawadi. The latter was opportune to witness the awaiting Imam (May our souls be sacrificed for him) but he was very depressed. He inquired from him about his condition (Peace be upon him).

Imam replied him: "My heart is filled up with blood, my heart is filled up with blood"

Meaning that he is depressed (peace be upon him).

Imam Husein (peace be upon him) said to one scholar in Qum through the unveiled world: "Our Mahdi is oppressed in his time, so therefore preach and write about the personality."`,
    image: "/images/ahmad.jpg",
  },
};

export default function StoriesUlamaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSaveStory = async (title: string, content: string) => {
    if (!user) {
      alert("Please login to save stories!");
      router.push("/login");
      return;
    }

    try {
      const result = await saveQuote(user.username, title, content);
      if (result.success) {
        alert("Story saved successfully!");
      } else {
        alert(result.message || "Story already saved");
      }
    } catch (error) {
      console.error("Error saving story:", error);
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

  const handleStoryView = async (title: string) => {
    if (user) {
      await addToHistory(user.username, title);
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
            📚 Stories of the Ulama
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Inspiring Accounts from Our Scholars
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

        {/* Stories List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Object.entries(STORIES).map(([key, story]) => {
            const isExpanded = expandedStory === story.title;

            return (
              <div
                key={key}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  onClick={() => {
                    const newExpanded = isExpanded ? null : story.title;
                    setExpandedStory(newExpanded);
                    if (newExpanded) {
                      handleStoryView(story.title);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "20px",
                    background: "transparent",
                    border: "none",
                    color: "white",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    {story.emoji} {story.title}
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: "0 20px 20px 20px" }}>
                    <h2
                      style={{
                        color: "#ffd89b",
                        fontSize: "1.8rem",
                        marginTop: "20px",
                        marginBottom: "20px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {story.title}
                    </h2>

                    {/* Image */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ maxWidth: "500px", width: "100%" }}>
                        <img
                          src={story.image}
                          alt={story.title}
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

                    {/* Story Content */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                        borderRadius: "15px",
                        border: "2px solid rgba(255, 216, 155, 0.3)",
                        padding: "30px",
                        margin: "20px 0",
                        color: "#f5f5f5",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                        fontFamily: "'Georgia', serif",
                        fontSize: "17px",
                        lineHeight: "2",
                        textAlign: "justify",
                        backdropFilter: "blur(10px)",
                        maxHeight: "500px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {story.content}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginTop: "20px",
                      }}
                    >
                      {user && (
                        <>
                          <button
                            onClick={() =>
                              handleSaveStory(story.title, story.content)
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
                            💾 Save Story
                          </button>

                          <button
                            onClick={() => setAddingNoteFor(story.title)}
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
                        </>
                      )}

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(story.content)
                        }
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
                        📋 Copy
                      </button>
                    </div>

                    {/* Add Note Form */}
                    {addingNoteFor === story.title && (
                      <div style={{ marginTop: "20px" }}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Your reflection on this story..."
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
                            onClick={() => handleAddNote(story.title)}
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
              </div>
            );
          })}

          {/* Coming Soon Stories */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "15px",
              padding: "30px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#ffd89b",
                fontSize: "1.1rem",
                marginBottom: "10px",
              }}
            >
              ⭐ Story 4 - Coming Soon
            </p>
            <p style={{ color: "#b0b0b0" }}>
              More inspiring stories will be added soon...
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "15px",
              padding: "30px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#ffd89b",
                fontSize: "1.1rem",
                marginBottom: "10px",
              }}
            >
              📿 Story 5 - Coming Soon
            </p>
            <p style={{ color: "#b0b0b0" }}>
              More inspiring stories will be added soon...
            </p>
          </div>
        </div>

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
            May we learn from the wisdom of our scholars
          </p>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          width: 10px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 216, 155, 0.3);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 216, 155, 0.5);
        }
      `}</style>
    </div>
  );
}
