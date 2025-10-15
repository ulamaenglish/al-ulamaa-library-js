import nlp from "compromise";

export interface Intent {
  type:
    | "navigation"
    | "question"
    | "emotion"
    | "prayer"
    | "recommendation"
    | "general";
  confidence: number;
  entities: string[];
  emotion?:
    | "happy"
    | "sad"
    | "anxious"
    | "grateful"
    | "angry"
    | "confused"
    | "peaceful"
    | "worried";
  keywords: string[];
}

const INTENT_PATTERNS = {
  navigation: [
    /(?:show|take|go to|navigate|open|view|display|find|where is) (?:me )?(?:the )?(.+)/i,
    /(?:i want to see|looking for|search for) (.+)/i,
    /(?:calendar|ziyarat|prayer|dua|dashboard|home)/i,
  ],

  emotion: {
    sad: [
      /(?:i(?:'m| am) )?(?:feeling|feel) (?:sad|down|depressed|low|unhappy|miserable)/i,
      /(?:i(?:'m| am) )?(?:sad|depressed|down|heartbroken)/i,
      /(?:feeling )?(?:grief|sorrow|mourning)/i,
    ],
    anxious: [
      /(?:i(?:'m| am) )?(?:feeling|feel) (?:anxious|worried|nervous|stressed|overwhelmed)/i,
      /(?:anxiety|stress|worry|fear|panic)/i,
      /(?:i(?:'m| am) )?(?:anxious|worried|stressed|nervous)/i,
    ],
    happy: [
      /(?:i(?:'m| am) )?(?:feeling|feel) (?:happy|good|great|blessed|joyful|grateful)/i,
      /(?:alhamdulillah|thank (?:god|allah)|blessed)/i,
    ],
    grateful: [
      /(?:thank|thanks|grateful|appreciate|alhamdulillah)/i,
      /(?:i(?:'m| am) )?(?:thankful|grateful)/i,
    ],
    angry: [
      /(?:i(?:'m| am) )?(?:feeling|feel) (?:angry|mad|frustrated|irritated)/i,
      /(?:anger|rage|frustration)/i,
    ],
    confused: [
      /(?:i(?:'m| am) )?(?:confused|lost|uncertain|unsure|don't know)/i,
      /(?:what should i do|need guidance|help me decide)/i,
    ],
    worried: [
      /(?:worried about|concerned about|scared of|afraid of)/i,
      /(?:i(?:'m| am) )?(?:worried|concerned|scared|afraid)/i,
    ],
  },

  prayer: [
    /(?:what|which|show me|tell me about) (?:prayer|dua|supplication|ziyarat)/i,
    /(?:how do i pray|teach me to pray|prayer times)/i,
    /(?:salat|namaz|dua|ziyarat|dhikr)/i,
    /(?:when is|what time is) (?:fajr|dhuhr|asr|maghrib|isha)/i,
  ],

  recommendation: [
    /(?:what should i|recommend|suggest|advice|guide me)/i,
    /(?:i need|looking for|searching for) (?:help|guidance|advice)/i,
    /(?:best|good) (?:prayer|dua|ziyarat|practice)/i,
  ],

  question: [
    /(?:what|when|where|who|why|how|which|can you)/i,
    /(?:tell me|explain|describe|teach)/i,
    /\?$/,
  ],
};

const EMOTION_KEYWORDS = {
  sad: [
    "sad",
    "down",
    "depressed",
    "grief",
    "sorrow",
    "heartbroken",
    "lonely",
    "upset",
    "crying",
  ],
  anxious: [
    "anxious",
    "worried",
    "stress",
    "nervous",
    "overwhelmed",
    "panic",
    "fear",
    "scared",
  ],
  happy: [
    "happy",
    "joy",
    "blessed",
    "good",
    "great",
    "wonderful",
    "amazing",
    "alhamdulillah",
  ],
  grateful: ["thank", "grateful", "appreciate", "thankful", "blessing"],
  angry: ["angry", "mad", "furious", "frustrated", "irritated", "rage"],
  confused: ["confused", "lost", "uncertain", "unsure", "don't know", "help"],
  worried: ["worried", "concerned", "afraid", "scared", "anxious"],
  peaceful: ["peace", "calm", "tranquil", "serene", "content", "relaxed"],
};

export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  const doc = nlp(message);

  let intent: Intent = {
    type: "general",
    confidence: 0,
    entities: [],
    keywords: [],
  };

  // Extract entities
  const places = doc.places().out("array");
  const people = doc.people().out("array");
  const topics = doc.topics().out("array");
  intent.entities = [...places, ...people, ...topics];

  // Detect emotion
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const patterns =
      INTENT_PATTERNS.emotion[emotion as keyof typeof INTENT_PATTERNS.emotion];

    // Check patterns
    if (patterns && patterns.some((pattern) => pattern.test(lowerMessage))) {
      intent.emotion = emotion as any;
      intent.type = "emotion";
      intent.confidence = 0.9;
      intent.keywords = keywords.filter((k) => lowerMessage.includes(k));
      return intent;
    }

    // Check keywords
    const matchedKeywords = keywords.filter((keyword) =>
      lowerMessage.includes(keyword)
    );
    if (matchedKeywords.length >= 1) {
      intent.emotion = emotion as any;
      intent.type = "emotion";
      intent.confidence = 0.7 + matchedKeywords.length * 0.1;
      intent.keywords = matchedKeywords;
      return intent;
    }
  }

  // Detect navigation
  if (
    INTENT_PATTERNS.navigation.some((pattern) => pattern.test(lowerMessage))
  ) {
    intent.type = "navigation";
    intent.confidence = 0.85;
    intent.keywords = extractNavigationKeywords(lowerMessage);
    return intent;
  }

  // Detect prayer intent
  if (INTENT_PATTERNS.prayer.some((pattern) => pattern.test(lowerMessage))) {
    intent.type = "prayer";
    intent.confidence = 0.85;
    intent.keywords = extractPrayerKeywords(lowerMessage);
    return intent;
  }

  // Detect recommendation request
  if (
    INTENT_PATTERNS.recommendation.some((pattern) => pattern.test(lowerMessage))
  ) {
    intent.type = "recommendation";
    intent.confidence = 0.8;
    return intent;
  }

  // Detect question
  if (INTENT_PATTERNS.question.some((pattern) => pattern.test(lowerMessage))) {
    intent.type = "question";
    intent.confidence = 0.7;
    return intent;
  }

  // Default to general
  intent.confidence = 0.5;
  return intent;
}

function extractNavigationKeywords(message: string): string[] {
  const keywords = [];
  const navTerms = [
    "calendar",
    "ziyarat",
    "prayer",
    "dua",
    "dashboard",
    "home",
    "library",
    "imam",
  ];

  for (const term of navTerms) {
    if (message.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}

function extractPrayerKeywords(message: string): string[] {
  const keywords = [];
  const prayerTerms = [
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
    "salat",
    "namaz",
    "dua",
    "ziyarat",
    "dhikr",
  ];

  for (const term of prayerTerms) {
    if (message.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}

export function extractKeywords(message: string): string[] {
  const doc = nlp(message);
  const nouns = doc.nouns().out("array");
  const verbs = doc.verbs().out("array");
  const adjectives = doc.adjectives().out("array");

  return [...new Set([...nouns, ...verbs, ...adjectives])];
}
