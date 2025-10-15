import { Intent } from "./intentDetector";
import {
  saveChatMessage,
  createChatSession,
  getActiveSession,
} from "@/lib/database";

export interface ConversationContext {
  userId?: string;
  userName?: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    message: string;
    intent?: Intent;
    timestamp: Date;
  }>;
  userPreferences: {
    favoriteImams: string[];
    commonEmotions: string[];
    frequentTopics: string[];
    preferredLanguage: "en" | "ar" | "fa" | "ur";
    prayerReminders: boolean;
  };
  sessionData: {
    lastVisitedPage?: string;
    todayInteractions: number;
    sessionStart: Date;
    currentEmotion?: string;
  };
  islamicContext: {
    currentHijriDate?: any;
    todayEvents?: any[];
    nextPrayer?: string;
    prayerTimes?: any;
  };
}

export class ContextManager {
  private context: ConversationContext;
  private sessionId: number | null = null;

  constructor(userId?: string) {
    this.context = this.loadContext(userId);
    this.initSession();
  }

  private async initSession() {
    if (typeof window !== "undefined" && this.context.userName) {
      try {
        // Get or create active session
        const activeSession = await getActiveSession(this.context.userName);

        if (activeSession) {
          this.sessionId = activeSession.id;
          console.log("📱 Using existing session:", this.sessionId);
        } else {
          const newSession = await createChatSession(this.context.userName);
          if (newSession) {
            this.sessionId = newSession.id;
            console.log("✨ Created new session:", this.sessionId);
          }
        }
      } catch (error) {
        console.error("Session init error:", error);
      }
    }
  }

  private loadContext(userId?: string): ConversationContext {
    if (typeof window !== "undefined" && userId) {
      const saved = localStorage.getItem(`chat_context_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.sessionData.sessionStart = new Date(
          parsed.sessionData.sessionStart
        );
        return parsed;
      }
    }

    return {
      userId,
      conversationHistory: [],
      userPreferences: {
        favoriteImams: [],
        commonEmotions: [],
        frequentTopics: [],
        preferredLanguage: "en",
        prayerReminders: false,
      },
      sessionData: {
        todayInteractions: 0,
        sessionStart: new Date(),
      },
      islamicContext: {},
    };
  }

  public saveContext() {
    if (typeof window !== "undefined" && this.context.userId) {
      localStorage.setItem(
        `chat_context_${this.context.userId}`,
        JSON.stringify(this.context)
      );
    }
  }

  public async addMessage(
    role: "user" | "assistant",
    message: string,
    intent?: Intent
  ) {
    this.context.conversationHistory.push({
      role,
      message,
      intent,
      timestamp: new Date(),
    });

    // Keep only last 50 messages
    if (this.context.conversationHistory.length > 50) {
      this.context.conversationHistory =
        this.context.conversationHistory.slice(-50);
    }

    // Update statistics
    if (role === "user") {
      this.context.sessionData.todayInteractions++;

      if (intent) {
        // Track emotions
        if (intent.emotion) {
          const emotions = this.context.userPreferences.commonEmotions;
          emotions.push(intent.emotion);
          this.context.userPreferences.commonEmotions = [
            ...new Set(emotions),
          ].slice(-10); // Keep unique, last 10
        }

        // Track topics
        if (intent.keywords.length > 0) {
          const topics = this.context.userPreferences.frequentTopics;
          topics.push(...intent.keywords);
          this.context.userPreferences.frequentTopics = [
            ...new Set(topics),
          ].slice(-20); // Keep unique, last 20
        }
      }
    }

    // 🆕 SAVE TO DATABASE
    if (this.sessionId && this.context.userName) {
      try {
        await saveChatMessage(
          this.sessionId,
          this.context.userName,
          role,
          message,
          intent?.type,
          intent?.emotion,
          intent?.keywords
        );
        console.log("💾 Message saved to database");
      } catch (error) {
        console.error("Failed to save message to database:", error);
      }
    }

    this.saveContext();
  }

  public updateIslamicContext(
    data: Partial<ConversationContext["islamicContext"]>
  ) {
    this.context.islamicContext = {
      ...this.context.islamicContext,
      ...data,
    };
    this.saveContext();
  }

  public setUserName(name: string) {
    this.context.userName = name;
    this.saveContext();

    // Initialize session when username is set
    this.initSession();
  }

  public setCurrentEmotion(emotion: string) {
    this.context.sessionData.currentEmotion = emotion;
    this.saveContext();
  }

  public getContext(): ConversationContext {
    return this.context;
  }

  public getRecentMessages(count: number = 5) {
    return this.context.conversationHistory.slice(-count);
  }

  public clearHistory() {
    this.context.conversationHistory = [];
    this.context.sessionData.todayInteractions = 0;
    this.saveContext();
  }

  public getUserInsights() {
    const { userPreferences, sessionData } = this.context;

    // Analyze most common emotion
    const emotionCounts: Record<string, number> = {};
    userPreferences.commonEmotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const mostCommonEmotion = Object.entries(emotionCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    // Analyze most frequent topics
    const topicCounts: Record<string, number> = {};
    userPreferences.frequentTopics.forEach((topic) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      mostCommonEmotion,
      topTopics,
      totalInteractions: sessionData.todayInteractions,
      sessionDuration: Date.now() - sessionData.sessionStart.getTime(),
    };
  }

  public getSessionId(): number | null {
    return this.sessionId;
  }
}
