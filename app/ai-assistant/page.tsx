"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import ReactMarkdown from "react-markdown";
import { detectIntent } from "@/lib/chatbot/intentDetector";
import { generateResponse, BotResponse } from "@/lib/chatbot/responseGenerator";
import { ContextManager } from "@/lib/chatbot/contextManager";
import {
  generateProactiveSuggestions,
  ProactiveSuggestion,
} from "@/lib/chatbot/proactiveSuggestions";
import { getCurrentHijriDate, getPrayerTimes } from "@/lib/islamicCalendar";
import { getEventForDay } from "@/app/calendar/data/shia-events";
import { saveAIResponse } from "@/lib/database";

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: BotResponse;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    icon: "🤲",
    title: "Prayer Recommendation",
    prompt:
      "I'm going through a difficult time. What prayers or ziyarat would you recommend?",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: "📖",
    title: "Learn About Ashura",
    prompt:
      "Can you explain the significance of the Day of Ashura and why it's important?",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: "🕌",
    title: "Best Ziyarat",
    prompt: "Which ziyarat should I recite for my current situation?",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: "💭",
    title: "Seeking Guidance",
    prompt: "I need guidance on making an important life decision",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    icon: "🌙",
    title: "Ramadan Practices",
    prompt: "What are the most important spiritual practices during Ramadan?",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    icon: "✨",
    title: "Daily Duas",
    prompt: "What are some essential daily prayers I should memorize?",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  },
];

const TYPING_SPEED = 30; // milliseconds per character

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [contextManager] = useState(() => new ContextManager());
  const [proactiveSuggestions, setProactiveSuggestions] = useState<
    ProactiveSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, currentTypingMessage]);

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      contextManager.setUserName(userData.name);
    }

    // Load Islamic context
    loadIslamicContext();

    // Welcome message
    if (messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }

    // Generate proactive suggestions
    updateProactiveSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIslamicContext = async () => {
    try {
      const hijriDate = await getCurrentHijriDate();
      const todayEvents = hijriDate
        ? [getEventForDay(hijriDate.day, hijriDate.month)].filter(Boolean)
        : [];
      const prayerTimes = await getPrayerTimes("Qom", "Iran");

      contextManager.updateIslamicContext({
        currentHijriDate: hijriDate,
        todayEvents,
        prayerTimes,
      });

      updateProactiveSuggestions();
    } catch (error) {
      console.error("Error loading Islamic context:", error);
    }
  };

  const updateProactiveSuggestions = () => {
    const context = contextManager.getContext();
    const suggestions = generateProactiveSuggestions(context);
    setProactiveSuggestions(suggestions.slice(0, 3)); // Show top 3
  };

  const generateWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "السلام عليكم ورحمة الله وبركاته";

    if (hour < 12) greeting += "\n\n🌅 Good morning!";
    else if (hour < 18) greeting += "\n\n☀️ Good afternoon!";
    else greeting += "\n\n🌙 Good evening!";

    return `${greeting}\n\nI'm your Islamic spiritual companion, here to guide you with:\n\n🤲 **Personalized Prayer Recommendations**\n🕌 **Ziyarat Guidance**\n📅 **Islamic Calendar & Events**\n💭 **Spiritual Counseling**\n🧭 **Website Navigation**\n\nHow may I illuminate your spiritual path today?`;
  };

  const typeMessage = async (text: string, callback: () => void) => {
    setIsTyping(true);
    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setCurrentTypingMessage(currentText);
      await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
    }

    setIsTyping(false);
    setCurrentTypingMessage("");
    callback();
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();

    if (!textToSend || isLoading) return;

    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Detect intent
      const intent = detectIntent(textToSend);

      // Add to context
      await contextManager.addMessage("user", textToSend, intent);

      if (intent.emotion) {
        contextManager.setCurrentEmotion(intent.emotion);
      }

      // Generate response
      const context = contextManager.getContext();
      const botResponse = generateResponse(intent, textToSend, {
        currentDate: context.islamicContext.currentHijriDate,
        todayEvents: context.islamicContext.todayEvents,
        prayerTimes: context.islamicContext.prayerTimes,
        userName: context.userName,
      });

      // Type out the response
      await typeMessage(botResponse.text, () => {
        const assistantMessage: Message = {
          role: "assistant",
          content: botResponse.text,
          response: botResponse,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        contextManager.addMessage("assistant", botResponse.text);
        updateProactiveSuggestions();
      });
    } catch (error: any) {
      console.error("Error:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please try again. 🙏",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    contextManager.clearHistory();
    const welcomeMessage = generateWelcomeMessage();
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
    updateProactiveSuggestions();
  };

  const handleAction = (action: {
    label: string;
    type: string;
    target: string;
  }) => {
    if (action.type === "navigate") {
      router.push(action.target);
    } else if (action.type === "external") {
      window.open(action.target, "_blank");
    }
  };

  const handleSaveResponse = async (
    questionContent: string,
    answerContent: string
  ) => {
    if (!user) {
      alert("⚠️ Please login to save responses");
      return;
    }

    try {
      const result = await saveAIResponse(
        user.username,
        questionContent,
        answerContent
      );

      if (result.success) {
        alert("✅ Response saved successfully!");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      alert("❌ Failed to save response");
      console.error("Save error:", error);
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

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .message-enter {
          animation: fadeInUp 0.5s ease-out;
        }

        .typing-indicator {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .quick-prompt {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-prompt:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 30px rgba(255, 216, 155, 0.3);
        }

        .action-button {
          transition: all 0.3s;
        }

        .action-button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(255, 216, 155, 0.4);
        }

        .suggestion-card {
          transition: all 0.3s;
        }

        .suggestion-card:hover {
          transform: translateX(5px);
          border-color: rgba(255, 216, 155, 0.5);
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 216, 155, 0.3);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 216, 155, 0.5);
        }

        @keyframes bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "clamp(20px, 5vw, 40px)",
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "clamp(20px, 4vw, 30px)",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                transition: "all 0.3s",
              }}
            >
              ← Home
            </button>

            {user && (
              <div
                style={{
                  padding: "10px 15px",
                  background: "rgba(255, 216, 155, 0.1)",
                  border: "1px solid rgba(255, 216, 155, 0.3)",
                  borderRadius: "10px",
                  color: "#ffd89b",
                  fontSize: "clamp(0.85rem, 2vw, 1rem)",
                }}
              >
                👤 {user.name}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {user && (
              <button
                onClick={() => router.push("/saved-responses")}
                style={{
                  padding: "10px 20px",
                  background: "rgba(134, 239, 172, 0.2)",
                  border: "1px solid rgba(134, 239, 172, 0.4)",
                  borderRadius: "10px",
                  color: "#86efac",
                  cursor: "pointer",
                  fontSize: "clamp(0.85rem, 2vw, 1rem)",
                  transition: "all 0.3s",
                }}
              >
                💾 Saved Responses
              </button>
            )}
            <button
              onClick={clearChat}
              style={{
                padding: "10px 20px",
                background: "rgba(220, 38, 38, 0.2)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                borderRadius: "10px",
                color: "#fca5a5",
                cursor: "pointer",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                transition: "all 0.3s",
              }}
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
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
            🤖 AI Spiritual Assistant
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "#d0d0d0",
            }}
          >
            Your intelligent companion for Islamic wisdom and spiritual guidance
          </p>
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "20px",
            flex: 1,
          }}
        >
          {/* Chat Area */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Quick Prompts */}
            {showSuggestions && messages.length <= 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "15px",
                  animation: "fadeInUp 0.6s ease-out",
                }}
              >
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.prompt)}
                    disabled={isLoading}
                    className="quick-prompt"
                    style={{
                      padding: "20px",
                      background: prompt.gradient,
                      border: "none",
                      borderRadius: "15px",
                      color: "white",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      textAlign: "left",
                      opacity: isLoading ? 0.5 : 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                      {prompt.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        marginBottom: "8px",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {prompt.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        opacity: 0.9,
                        lineHeight: "1.4",
                      }}
                    >
                      {prompt.prompt}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Chat Container */}
            <div
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "clamp(15px, 3vw, 25px)",
                display: "flex",
                flexDirection: "column",
                minHeight: "500px",
                maxHeight: "600px",
                overflow: "hidden",
              }}
            >
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="message-enter"
                    style={{
                      display: "flex",
                      justifyContent:
                        message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Message Bubble */}
                      <div
                        style={{
                          padding: "15px 20px",
                          background:
                            message.role === "user"
                              ? "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)"
                              : "rgba(255, 255, 255, 0.08)",
                          borderRadius: "15px",
                          color: "white",
                          boxShadow:
                            message.role === "user"
                              ? "0 4px 15px rgba(255, 216, 155, 0.3)"
                              : "0 4px 15px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            components={{
                              p: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <p
                                  style={{
                                    marginBottom: "10px",
                                    lineHeight: "1.7",
                                  }}
                                >
                                  {children}
                                </p>
                              ),
                              strong: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <strong
                                  style={{
                                    color: "#ffd89b",
                                    fontWeight: "700",
                                  }}
                                >
                                  {children}
                                </strong>
                              ),
                              em: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <em
                                  style={{
                                    color: "#93c5fd",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {children}
                                </em>
                              ),
                              ul: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <ul
                                  style={{
                                    marginLeft: "20px",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {children}
                                </ul>
                              ),
                              li: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <li
                                  style={{
                                    marginBottom: "5px",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {children}
                                </li>
                              ),
                              code: ({
                                children,
                              }: {
                                children?: React.ReactNode;
                              }) => (
                                <code
                                  style={{
                                    background: "rgba(0, 0, 0, 0.3)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.9em",
                                    color: "#86efac",
                                  }}
                                >
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div style={{ lineHeight: "1.7", fontSize: "1rem" }}>
                            {message.content}
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "rgba(255, 255, 255, 0.5)",
                            marginTop: "10px",
                            textAlign: "right",
                          }}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {/* 🆕 SAVE RESPONSE BUTTON - Only for assistant messages */}
                      {message.role === "assistant" && index > 0 && (
                        <button
                          onClick={() => {
                            const previousUserMessage = messages[index - 1];
                            const questionContent =
                              previousUserMessage?.role === "user"
                                ? previousUserMessage.content
                                : "Question";
                            handleSaveResponse(
                              questionContent,
                              message.content
                            );
                          }}
                          style={{
                            padding: "10px 18px",
                            background: "rgba(134, 239, 172, 0.2)",
                            border: "1px solid rgba(134, 239, 172, 0.4)",
                            borderRadius: "10px",
                            color: "#86efac",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "fit-content",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(134, 239, 172, 0.3)";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(134, 239, 172, 0.2)";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <span>💾</span>
                          <span>Save This Response</span>
                        </button>
                      )}

                      {/* Action Buttons */}
                      {message.response?.actions &&
                        message.response.actions.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            {message.response.actions.map(
                              (action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  onClick={() => handleAction(action)}
                                  className="action-button"
                                  style={{
                                    padding: "10px 18px",
                                    background: "rgba(255, 216, 155, 0.15)",
                                    border:
                                      "1px solid rgba(255, 216, 155, 0.4)",
                                    borderRadius: "10px",
                                    color: "#ffd89b",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {action.label}
                                </button>
                              )
                            )}
                          </div>
                        )}

                      {/* Quick Replies */}
                      {message.response?.quickReplies &&
                        message.response.quickReplies.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            {message.response.quickReplies.map(
                              (reply, replyIndex) => (
                                <button
                                  key={replyIndex}
                                  onClick={() => sendMessage(reply)}
                                  disabled={isLoading}
                                  style={{
                                    padding: "8px 15px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.2)",
                                    borderRadius: "20px",
                                    color: "#d0d0d0",
                                    cursor: isLoading
                                      ? "not-allowed"
                                      : "pointer",
                                    fontSize: "0.85rem",
                                    transition: "all 0.3s",
                                    opacity: isLoading ? 0.5 : 1,
                                  }}
                                >
                                  {reply}
                                </button>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {/* Typing Animation */}
                {isTyping && (
                  <div
                    className="message-enter"
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "15px 20px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "15px",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }: { children?: React.ReactNode }) => (
                            <p
                              style={{
                                marginBottom: "10px",
                                lineHeight: "1.7",
                              }}
                            >
                              {children}
                            </p>
                          ),
                          strong: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <strong
                              style={{ color: "#ffd89b", fontWeight: "700" }}
                            >
                              {children}
                            </strong>
                          ),
                        }}
                      >
                        {currentTypingMessage}
                      </ReactMarkdown>
                      <span
                        className="typing-indicator"
                        style={{ color: "#ffd89b" }}
                      >
                        ▊
                      </span>
                    </div>
                  </div>
                )}

                {/* Loading Indicator */}
                {isLoading && !isTyping && (
                  <div
                    className="message-enter"
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        padding: "15px 20px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "15px",
                        color: "#ffd89b",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            background: "#ffd89b",
                            borderRadius: "50%",
                            animation: "bounce 1s infinite",
                            animationDelay: "0s",
                          }}
                        />
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            background: "#ffd89b",
                            borderRadius: "50%",
                            animation: "bounce 1s infinite",
                            animationDelay: "0.2s",
                          }}
                        />
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            background: "#ffd89b",
                            borderRadius: "50%",
                            animation: "bounce 1s infinite",
                            animationDelay: "0.4s",
                          }}
                        />
                        <span
                          style={{ marginLeft: "10px", fontSize: "0.9rem" }}
                        >
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                padding: "15px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Islam, prayers, or spiritual guidance..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "white",
                  fontSize: "1rem",
                  resize: "none",
                  minHeight: "50px",
                  maxHeight: "150px",
                  fontFamily: "inherit",
                }}
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  padding: "12px 25px",
                  background:
                    isLoading || !input.trim()
                      ? "rgba(100, 100, 100, 0.3)"
                      : "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor:
                    isLoading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s",
                  boxShadow:
                    isLoading || !input.trim()
                      ? "none"
                      : "0 4px 15px rgba(255, 216, 155, 0.3)",
                }}
              >
                {isLoading ? "⏳" : "Send 📤"}
              </button>
            </div>

            {/* Tip */}
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: "0.85rem",
              }}
            >
              💡 Press{" "}
              <kbd
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Shift+Enter
              </kbd>{" "}
              for new line
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  color: "#ffd89b",
                  fontSize: "1.3rem",
                  marginBottom: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ✨ For You
              </h3>

              {proactiveSuggestions.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {proactiveSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-card"
                      style={{
                        padding: "15px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderLeft: `3px solid ${
                          suggestion.priority === "high"
                            ? "#ffd89b"
                            : suggestion.priority === "medium"
                            ? "#93c5fd"
                            : "#86efac"
                        }`,
                        borderRadius: "10px",
                        cursor: suggestion.action ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (suggestion.action) {
                          router.push(suggestion.action.target);
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                          {suggestion.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              color: "white",
                              fontSize: "0.95rem",
                              fontWeight: "600",
                              marginBottom: "5px",
                            }}
                          >
                            {suggestion.title}
                          </div>
                          <div
                            style={{
                              color: "#999",
                              fontSize: "0.85rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {suggestion.message}
                          </div>
                          {suggestion.action && (
                            <div
                              style={{
                                marginTop: "8px",
                                color: "#ffd89b",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                              }}
                            >
                              {suggestion.action.label} →
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                    fontSize: "0.9rem",
                  }}
                >
                  No suggestions at the moment. Keep chatting! 💬
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  color: "#ffd89b",
                  fontSize: "1.3rem",
                  marginBottom: "15px",
                  fontWeight: "700",
                }}
              >
                📊 Session
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#d0d0d0" }}>Messages</span>
                  <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                    {contextManager.getContext().sessionData.todayInteractions}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#d0d0d0" }}>History</span>
                  <span style={{ color: "#ffd89b", fontWeight: "600" }}>
                    {contextManager.getContext().conversationHistory.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 216, 155, 0.1) 0%, rgba(25, 84, 123, 0.1) 100%)",
                border: "1px solid rgba(255, 216, 155, 0.3)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  color: "#ffd89b",
                  fontSize: "1.2rem",
                  marginBottom: "10px",
                  fontWeight: "700",
                }}
              >
                💡 Tips
              </h3>
              <ul
                style={{
                  color: "#d0d0d0",
                  fontSize: "0.85rem",
                  lineHeight: "1.6",
                  paddingLeft: "20px",
                }}
              >
                <li>Share your feelings for personalized prayers</li>
                <li>Ask about specific Imams or events</li>
                <li>Request navigation to any page</li>
                <li>Get prayer time reminders</li>
                <li>Save helpful responses for later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
