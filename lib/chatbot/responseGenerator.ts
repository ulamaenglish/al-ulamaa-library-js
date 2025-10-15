import { Intent } from "./intentDetector";
import { IslamicEvent } from "@/app/calendar/data/shia-events";

export interface BotResponse {
  text: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    type: "navigate" | "show" | "external";
    target: string;
  }>;
  quickReplies?: string[];
  richContent?: {
    type: "card" | "list" | "calendar";
    data: any;
  };
}

const GREETINGS = [
  "السلام عليكم ورحمة الله وبركاته! 🌙",
  "Peace be upon you! 🕊️",
  "Assalamu Alaikum! ✨",
];

const EMOTION_RESPONSES = {
  sad: {
    messages: [
      "I understand you're going through a difficult time. May Allah ease your heart and grant you peace. 🤲\n\nIn times of sadness, remember: *'Verily, with hardship comes ease'* (Quran 94:6)",
      "Your feelings are valid, and Allah is closer to you than your jugular vein. Let me suggest some prayers that bring comfort. 💫",
      "During times of grief, the Ahlul Bayt (AS) teach us that patience and prayer are our greatest strengths. 🕊️",
    ],
    duas: [
      {
        title: "Dua for Relief from Grief",
        description: "A powerful prayer for comfort during sadness",
        path: "/dua/relief",
      },
      {
        title: "Ziyarat Imam Hussain",
        description: "Visit the Master of Martyrs for solace",
        path: "/ziyarat/imam-hussain",
      },
    ],
    suggestions: [
      "Read Dua-e-Faraj for relief",
      "Listen to Ziyarat Ashura",
      "View today's Islamic calendar",
      "Find a nearby mosque",
    ],
  },

  anxious: {
    messages: [
      "Anxiety can be overwhelming, but remember: *'Allah does not burden a soul beyond what it can bear'* (Quran 2:286). You are stronger than you know. 💪",
      "Take a deep breath. Let me guide you to prayers that bring tranquility and peace of mind. 🌿",
      "In moments of worry, Imam Ali (AS) said: 'Your remedy is within you, but you do not sense it.' Let's find that peace together. ✨",
    ],
    duas: [
      {
        title: "Dua for Peace of Mind",
        description: "Calm your heart with this powerful supplication",
        path: "/dua/peace",
      },
      {
        title: "Tasbih of Lady Fatima",
        description: "The dhikr that brings serenity",
        path: "/dhikr/tasbih-fatima",
      },
    ],
    suggestions: [
      "Practice Tasbih (33-33-34)",
      "Read Ayatul Kursi",
      "View Ziyarat for protection",
      "Learn breathing techniques",
    ],
  },

  happy: {
    messages: [
      "Alhamdulillah! 🌟 How beautiful it is to see gratitude! Remember to thank Allah for His blessings.",
      "May your happiness be everlasting! This is a wonderful moment to increase your worship and gratitude. ✨",
      "Your joy is a blessing! Imam Ali (AS) said: 'Happiness is a blessing, and showing gratitude for it increases it.' 🎉",
    ],
    duas: [
      {
        title: "Dua of Gratitude",
        description: "Express thankfulness to Allah",
        path: "/dua/gratitude",
      },
      {
        title: "Prayers of Celebration",
        description: "Special prayers for joyful occasions",
        path: "/prayers/celebration",
      },
    ],
    suggestions: [
      "Share your blessings with others",
      "Perform extra prayers",
      "Give charity (Sadaqah)",
      "Read Surah Ad-Duha",
    ],
  },

  grateful: {
    messages: [
      "Alhamdulillah! Gratitude is the key to more blessings. *'If you are grateful, I will surely increase you [in favor]'* (Quran 14:7) 🌟",
      "Your thankfulness is beautiful! Let's explore ways to express and increase your gratitude. ✨",
    ],
    duas: [
      {
        title: "Dua Shukr (Thanksgiving)",
        description: "The ultimate prayer of gratitude",
        path: "/dua/shukr",
      },
    ],
    suggestions: [
      "Perform two rak'ah Salat al-Shukr",
      "Keep a gratitude journal",
      "Share your blessings",
    ],
  },

  confused: {
    messages: [
      "When we're confused, seeking Allah's guidance is the best path. Let me help you find clarity. 🧭",
      "Imam Ali (AS) said: 'Ask Allah for guidance, and He will show you the way.' Let's explore your options together. 💡",
    ],
    duas: [
      {
        title: "Salat al-Istikharah",
        description: "Prayer for seeking guidance in decisions",
        path: "/prayer/istikhara",
      },
      {
        title: "Dua for Wisdom",
        description: "Ask Allah for clarity and understanding",
        path: "/dua/wisdom",
      },
    ],
    suggestions: [
      "Perform Salat al-Istikharah",
      "Consult with knowledgeable people",
      "Read Quran for guidance",
      "Make sincere dua",
    ],
  },

  worried: {
    messages: [
      "Worry is natural, but remember Allah's promise: *'Do not despair of the mercy of Allah'* (Quran 39:53). Let me help you find peace. 🕊️",
      "In times of worry, increased remembrance of Allah brings comfort. Let's find the right prayers for you. 🤲",
    ],
    duas: [
      {
        title: "Dua for Protection",
        description: "Seek Allah's protection from worries",
        path: "/dua/protection",
      },
      {
        title: "Dua-e-Tawassul",
        description: "Seek intercession of the Prophet and Imams",
        path: "/dua/tawassul",
      },
    ],
    suggestions: [
      "Recite Ayatul Kursi",
      "Increase dhikr",
      "Trust in Allah's plan",
      "Talk to someone you trust",
    ],
  },
};

const NAVIGATION_MAP: Record<string, { path: string; description: string }> = {
  calendar: {
    path: "/calendar",
    description: "Islamic Calendar with holy days and events",
  },
  ziyarat: {
    path: "/ziyarat",
    description: "Collection of Ziyarat for the Imams",
  },
  "imam hussain": {
    path: "/ziyarat/imam-hussain",
    description: "Ziyarat of Imam Hussain (AS)",
  },
  "imam ali": {
    path: "/ziyarat/imam-ali",
    description: "Ziyarat of Imam Ali (AS)",
  },
  "imam reza": {
    path: "/ziyarat/imam-reza",
    description: "Ziyarat of Imam Reza (AS)",
  },
  "imam mahdi": {
    path: "/ziyarat/imam-mahdi",
    description: "Ziyarat of Imam Mahdi (AS)",
  },
  "lady fatima": {
    path: "/ziyarat/lady-fatima",
    description: "Ziyarat of Lady Fatima (AS)",
  },
  prophet: {
    path: "/ziyarat/prophet-muhammad",
    description: "Ziyarat of Prophet Muhammad (PBUH)",
  },
  dashboard: {
    path: "/dashboard",
    description: "Your personal spiritual dashboard",
  },
  home: {
    path: "/",
    description: "Return to homepage",
  },
  prayer: {
    path: "/calendar",
    description: "Prayer times and calendar",
  },
};

export function generateResponse(
  intent: Intent,
  message: string,
  context?: {
    currentDate?: any;
    todayEvents?: IslamicEvent[];
    prayerTimes?: any;
    userName?: string;
  }
): BotResponse {
  // Handle emotions
  if (intent.type === "emotion" && intent.emotion) {
    return generateEmotionResponse(intent.emotion, context);
  }

  // Handle navigation
  if (intent.type === "navigation") {
    return generateNavigationResponse(intent.keywords, context);
  }

  // Handle prayer requests
  if (intent.type === "prayer") {
    return generatePrayerResponse(intent.keywords, context);
  }

  // Handle recommendations
  if (intent.type === "recommendation") {
    return generateRecommendationResponse(context);
  }

  // Handle questions
  if (intent.type === "question") {
    return generateQuestionResponse(message, context);
  }

  // Default general response
  return generateGeneralResponse(message, context);
}

function generateEmotionResponse(emotion: string, context?: any): BotResponse {
  const emotionData =
    EMOTION_RESPONSES[emotion as keyof typeof EMOTION_RESPONSES];

  if (!emotionData) {
    return {
      text: "I'm here to support you. How can I help you today? 🤲",
      quickReplies: ["Show me prayers", "View calendar", "Need guidance"],
    };
  }

  const randomMessage =
    emotionData.messages[
      Math.floor(Math.random() * emotionData.messages.length)
    ];

  const actions = emotionData.duas.map((dua) => ({
    label: dua.title,
    type: "navigate" as const,
    target: dua.path,
  }));

  return {
    text: randomMessage,
    actions,
    suggestions: emotionData.suggestions,
    quickReplies: [
      "Tell me more",
      "Show other prayers",
      "View today's events",
      "I need different help",
    ],
  };
}

function generateNavigationResponse(
  keywords: string[],
  context?: any
): BotResponse {
  const keyword = keywords[0]?.toLowerCase() || "";

  // Find matching navigation
  for (const [key, nav] of Object.entries(NAVIGATION_MAP)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return {
        text: `I'll take you to the ${nav.description}. 🧭\n\nThis page contains valuable resources to enhance your spiritual journey.`,
        actions: [
          {
            label: `Go to ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            type: "navigate",
            target: nav.path,
          },
        ],
        quickReplies: [
          "Tell me more about this",
          "Show me something else",
          "Go back",
        ],
      };
    }
  }

  // General navigation response
  return {
    text: "I can help you navigate to different parts of the website. Where would you like to go? 🧭",
    actions: [
      { label: "📅 Islamic Calendar", type: "navigate", target: "/calendar" },
      { label: "🕌 Ziyarat Library", type: "navigate", target: "/ziyarat" },
      { label: "📊 Dashboard", type: "navigate", target: "/dashboard" },
      { label: "🏠 Home", type: "navigate", target: "/" },
    ],
    quickReplies: ["Show all pages", "What can you do?", "Help"],
  };
}

function generatePrayerResponse(
  keywords: string[],
  context?: any
): BotResponse {
  const prayerTimes = context?.prayerTimes;
  const currentHour = new Date().getHours();

  let nextPrayer = "Fajr";
  if (currentHour >= 5 && currentHour < 12) nextPrayer = "Dhuhr";
  else if (currentHour >= 12 && currentHour < 15) nextPrayer = "Asr";
  else if (currentHour >= 15 && currentHour < 18) nextPrayer = "Maghrib";
  else if (currentHour >= 18 && currentHour < 21) nextPrayer = "Isha";

  let text = `🕌 **Prayer Times & Guidance**\n\n`;

  if (prayerTimes) {
    text += `Today's Prayer Times:\n`;
    text += `• Fajr: ${prayerTimes.fajr}\n`;
    text += `• Dhuhr: ${prayerTimes.dhuhr}\n`;
    text += `• Asr: ${prayerTimes.asr}\n`;
    text += `• Maghrib: ${prayerTimes.maghrib}\n`;
    text += `• Isha: ${prayerTimes.isha}\n\n`;
    text += `⏰ Next prayer: **${nextPrayer}**`;
  } else {
    text += `I can help you with prayers and supplications. What would you like to know?`;
  }

  return {
    text,
    actions: [
      {
        label: "📅 Full Prayer Schedule",
        type: "navigate",
        target: "/calendar",
      },
      { label: "🤲 Daily Duas", type: "navigate", target: "/dua" },
      { label: "🕌 Ziyarat Collection", type: "navigate", target: "/ziyarat" },
    ],
    quickReplies: [
      "How to pray correctly?",
      "Show me duas",
      "Qibla direction",
      "Prayer importance",
    ],
  };
}

function generateRecommendationResponse(context?: any): BotResponse {
  const todayEvents = context?.todayEvents || [];
  const currentDate = context?.currentDate;

  let text = `🌟 **Personalized Recommendations**\n\n`;

  if (todayEvents.length > 0) {
    text += `Today is special! We have ${todayEvents.length} important event(s):\n`;
    todayEvents.forEach((event: IslamicEvent) => {
      text += `• ${event.title}\n`;
    });
    text += `\nI recommend visiting the related Ziyarat pages.`;
  } else {
    text += `Based on your spiritual journey, here are my recommendations:\n\n`;
    text += `📖 **Daily Practice:**\n`;
    text += `• Morning: Recite Surah Al-Fajr\n`;
    text += `• Afternoon: Tasbih of Lady Fatima\n`;
    text += `• Evening: Dua-e-Kumayl (Thursdays)\n\n`;
    text += `🕌 **This Week:**\n`;
    text += `• Read Ziyarat Ashura\n`;
    text += `• Learn a new Dua\n`;
    text += `• Reflect on a Hadith`;
  }

  return {
    text,
    actions: [
      { label: "📅 View Calendar", type: "navigate", target: "/calendar" },
      { label: "🕌 Browse Ziyarat", type: "navigate", target: "/ziyarat" },
      { label: "📖 Daily Duas", type: "navigate", target: "/dua" },
    ],
    quickReplies: [
      "Tell me more",
      "Other recommendations",
      "Why these?",
      "Set reminders",
    ],
  };
}

function generateQuestionResponse(message: string, context?: any): BotResponse {
  const lowerMessage = message.toLowerCase();

  // Common questions database
  const qaDatabase: Record<string, string> = {
    "who are you":
      "I'm your Islamic spiritual assistant, here to guide you through prayers, ziyarat, and Islamic teachings. I can help you navigate the website, recommend prayers based on your needs, and answer questions about Islam. 🤖✨",

    "what can you do":
      "I can help you with many things! 🌟\n\n• Navigate to different pages\n• Recommend prayers and ziyarat\n• Show Islamic calendar and events\n• Provide prayer times\n• Answer Islamic questions\n• Guide you spiritually\n• Track important dates\n\nJust ask me anything!",

    ashura:
      "Ashura (10th of Muharram) commemorates the martyrdom of Imam Hussain (AS) at Karbala in 680 CE. It's the most sacred day of mourning for Shia Muslims, representing the stand for truth and justice against oppression.\n\n*'Every day is Ashura, every land is Karbala'*",

    "imam hussain":
      "Imam Hussain (AS) is the third Imam and grandson of Prophet Muhammad (PBUH). He sacrificed everything at Karbala to preserve Islam and stand against injustice. His message of truth, courage, and sacrifice continues to inspire millions.\n\nWould you like to read his Ziyarat?",

    ramadan:
      "Ramadan is the 9th month of the Islamic calendar, a time of fasting, prayer, and spiritual reflection. The Quran was revealed during this blessed month. It's a time to strengthen your relationship with Allah, give charity, and seek forgiveness.",

    "prayer times":
      "Prayer times are based on the sun's position and vary by location. The five daily prayers are:\n\n• Fajr (Dawn)\n• Dhuhr (Noon)\n• Asr (Afternoon)\n• Maghrib (Sunset)\n• Isha (Night)\n\nWould you like to see today's times?",
  };

  // Search for matching question
  for (const [key, answer] of Object.entries(qaDatabase)) {
    if (lowerMessage.includes(key)) {
      return {
        text: answer,
        actions: [
          { label: "📅 View Calendar", type: "navigate", target: "/calendar" },
          { label: "🕌 Read Ziyarat", type: "navigate", target: "/ziyarat" },
        ],
        quickReplies: [
          "Tell me more",
          "Ask another question",
          "Show related content",
        ],
      };
    }
  }

  // Default question response
  return {
    text: "That's an excellent question! While I may not have all the answers, I can guide you to resources that might help. 📚\n\nWould you like me to:\n• Show you relevant Ziyarat?\n• Check the Islamic calendar?\n• Provide general guidance?",
    actions: [
      { label: "🕌 Browse Ziyarat", type: "navigate", target: "/ziyarat" },
      { label: "📅 View Calendar", type: "navigate", target: "/calendar" },
      { label: "📖 Learn More", type: "navigate", target: "/" },
    ],
    quickReplies: ["Show ziyarat", "View calendar", "Ask differently"],
  };
}

function generateGeneralResponse(message: string, context?: any): BotResponse {
  const greetingPatterns = [/^(hi|hello|hey|salam|assalam)/i, /^السلام/];

  if (greetingPatterns.some((pattern) => pattern.test(message))) {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    return {
      text: `${greeting}\n\nI'm your Islamic spiritual companion. How can I assist you on your spiritual journey today?`,
      suggestions: [
        "Show me prayers for today",
        "What's special about today?",
        "I need spiritual guidance",
        "View Islamic calendar",
      ],
      quickReplies: ["Help", "What can you do?", "Show me around"],
    };
  }

  return {
    text: "I'm here to help! I can:\n\n🕌 Guide you to prayers and ziyarat\n📅 Show Islamic calendar and events\n🤲 Recommend spiritual practices\n🧭 Help navigate the website\n💬 Answer Islamic questions\n\nWhat would you like to explore?",
    actions: [
      { label: "📅 Islamic Calendar", type: "navigate", target: "/calendar" },
      { label: "🕌 Ziyarat Library", type: "navigate", target: "/ziyarat" },
      { label: "📊 My Dashboard", type: "navigate", target: "/dashboard" },
    ],
    quickReplies: [
      "Show me prayers",
      "Today's events",
      "I need help",
      "Guide me",
    ],
  };
}
