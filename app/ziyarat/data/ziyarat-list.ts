export interface Ziyarat {
  id: string;
  slug: string;
  title: string;
  titleArabic: string;
  category: string;
  description: string;
  benefits: string[];
  bestTime: string;
  duration: string;
  icon: string;
  audioUrl?: string;
}

export const ziyaratList: Ziyarat[] = [
  // 1. ZIYARAT ASHURA
  {
    id: "1",
    slug: "ashura",
    title: "Ziyarat Ashura",
    titleArabic: "زيارة عاشوراء",
    category: "For Imam Hussain (AS)",
    description:
      "The most famous and rewarding ziyarat, recited daily by many believers for immense spiritual blessings.",
    benefits: [
      "Forgiveness of sins",
      "Protection from calamities and hardships",
      "Fulfillment of wishes and needs",
      "Intercession on the Day of Judgment",
      "Increased sustenance and blessings",
    ],
    bestTime: "Any time, especially after Fajr prayer",
    duration: "15-20 minutes",
    icon: "🕋",
    audioUrl: "/audio/ashura.mp3",
  },

  // 2. ZIYARAT WARITHA
  {
    id: "2",
    slug: "waritha",
    title: "Ziyarat Waritha",
    titleArabic: "زيارة وارثة",
    category: "For All Imams (AS)",
    description:
      "A comprehensive ziyarat acknowledging the Imams as inheritors of all Prophets' knowledge and wisdom.",
    benefits: [
      "Strengthens connection with the Ahlul Bayt",
      "Spiritual elevation and purification",
      "Acceptance of deeds and prayers",
      "Protection and divine guidance",
    ],
    bestTime: "Any time, especially near the shrines",
    duration: "10-15 minutes",
    icon: "✨",
    audioUrl: "/audio/waritha.mp3",
  },

  // 3. ZIYARAT AAL YASIN
  {
    id: "3",
    slug: "aal-yasin",
    title: "Ziyarat Aal Yasin",
    titleArabic: "زيارة آل ياسين",
    category: "For Imam Mahdi (AJ)",
    description:
      "Special ziyarat for Imam Mahdi, may Allah hasten his blessed reappearance.",
    benefits: [
      "Connection with Imam of our time",
      "Hastening the reappearance",
      "Spiritual preparedness",
      "Divine protection",
    ],
    bestTime: "Friday afternoons, especially after Asr",
    duration: "10 minutes",
    icon: "🌙",
    audioUrl: "/audio/aal-yasin.mp3",
  },

  // 4. ZIYARAT JAMI'AH KABIRAH
  {
    id: "4",
    slug: "jamiah-kabirah",
    title: "Ziyarat Jami'ah Kabirah",
    titleArabic: "زيارة الجامعة الكبيرة",
    category: "For All Imams (AS)",
    description:
      "The most comprehensive ziyarat containing deep theological and philosophical meanings about the Imams.",
    benefits: [
      "Complete understanding of Imamate",
      "Spiritual enlightenment",
      "Closeness to the Ahlul Bayt",
      "Protection from misguidance",
    ],
    bestTime: "Any time, requires focus and contemplation",
    duration: "30-40 minutes",
    icon: "🌟",
    audioUrl: "/audio/jamiah-kabirah.mp3",
  },

  // 5. ZIYARAT AMINULLAH
  {
    id: "5",
    slug: "aminullah",
    title: "Ziyarat Aminullah",
    titleArabic: "زيارة أمين الله",
    category: "For Imam Hussain (AS)",
    description:
      "A beautiful and eloquent ziyarat specifically for Imam Hussain, emphasizing his trustworthiness.",
    benefits: [
      "Deep connection with Imam Hussain",
      "Spiritual purification",
      "Forgiveness of sins",
      "High spiritual station",
    ],
    bestTime: "Especially on Thursdays and during Muharram",
    duration: "15 minutes",
    icon: "💫",
    audioUrl: "/audio/aminullah.mp3",
  },

  // 6. ZIYARAT IMAM ALI (AS)
  {
    id: "6",
    slug: "imam-ali",
    title: "Ziyarat Imam Ali",
    titleArabic: "زيارة الإمام علي",
    category: "For Imam Ali (AS)",
    description:
      "Special ziyarat for the Commander of the Faithful, the gate of knowledge and wisdom.",
    benefits: [
      "Increased knowledge and wisdom",
      "Courage and steadfastness",
      "Justice in all affairs",
      "Protection from enemies",
    ],
    bestTime: "21st of Ramadan, and any time",
    duration: "12 minutes",
    icon: "⚔️",
    audioUrl: "/audio/imam-ali.mp3",
  },

  // 7. ZIYARAT BIBI FATIMA (SA)
  {
    id: "7",
    slug: "fatima-zahra",
    title: "Ziyarat Fatima al-Zahra",
    titleArabic: "زيارة فاطمة الزهراء",
    category: "For Lady Fatima (SA)",
    description:
      "Special ziyarat for the chief of all women, daughter of the Prophet (SAWW).",
    benefits: [
      "Intercession of Lady Fatima",
      "Blessings in family life",
      "Spiritual purity",
      "High station in Paradise",
    ],
    bestTime: "3rd of Jumada al-Thani (her martyrdom)",
    duration: "10 minutes",
    icon: "🌹",
    audioUrl: "/audio/fatima-zahra.mp3",
  },

  // 8. ZIYARAT IMAM HASSAN (AS)
  {
    id: "8",
    slug: "imam-hassan",
    title: "Ziyarat Imam Hassan",
    titleArabic: "زيارة الإمام الحسن",
    category: "For Imam Hassan (AS)",
    description:
      "Ziyarat for the second Imam, known for his peace treaty and wisdom.",
    benefits: [
      "Wisdom in decisions",
      "Peace and harmony",
      "Patience in difficulties",
      "Leadership qualities",
    ],
    bestTime: "28th of Safar (his martyrdom)",
    duration: "10 minutes",
    icon: "🕊️",
    audioUrl: "/audio/imam-hassan.mp3",
  },

  // 9. ZIYARAT IMAM REZA (AS)
  {
    id: "9",
    slug: "imam-reza",
    title: "Ziyarat Imam Reza",
    titleArabic: "زيارة الإمام الرضا",
    category: "For Imam Reza (AS)",
    description:
      "Special ziyarat for the eighth Imam, buried in Mashhad, Iran.",
    benefits: [
      "Fulfillment of needs",
      "Cure from illnesses",
      "Safety in travels",
      "Knowledge and understanding",
    ],
    bestTime: "Any time, especially when visiting Mashhad",
    duration: "12 minutes",
    icon: "🏛️",
    audioUrl: "/audio/imam-reza.mp3",
  },

  // 10. ZIYARAT IMAM JAWAD (AS)
  {
    id: "10",
    slug: "imam-jawad",
    title: "Ziyarat Imam Jawad",
    titleArabic: "زيارة الإمام الجواد",
    category: "For Imam Jawad (AS)",
    description:
      "Ziyarat for the ninth Imam, who became Imam at a very young age.",
    benefits: [
      "Wisdom beyond years",
      "Success in youth",
      "Divine guidance",
      "Protection from ignorance",
    ],
    bestTime: "29th of Dhul Qa'dah (his martyrdom)",
    duration: "8 minutes",
    icon: "💎",
    audioUrl: "/audio/imam-jawad.mp3",
  },

  // 11. ZIYARAT IMAM HADI (AS)
  {
    id: "11",
    slug: "imam-hadi",
    title: "Ziyarat Imam Hadi",
    titleArabic: "زيارة الإمام الهادي",
    category: "For Imam Hadi (AS)",
    description:
      "Ziyarat for the tenth Imam, who guided the community during difficult times.",
    benefits: [
      "Guidance in confusion",
      "Steadfastness in faith",
      "Patience in oppression",
      "Knowledge and wisdom",
    ],
    bestTime: "3rd of Rajab (his martyrdom)",
    duration: "10 minutes",
    icon: "🌟",
    audioUrl: "/audio/imam-hadi.mp3",
  },

  // 12. ZIYARAT IMAM ASKARI (AS)
  {
    id: "12",
    slug: "imam-askari",
    title: "Ziyarat Imam Askari",
    titleArabic: "زيارة الإمام العسكري",
    category: "For Imam Askari (AS)",
    description: "Ziyarat for the eleventh Imam, father of Imam Mahdi (AJ).",
    benefits: [
      "Connection to Imam Mahdi",
      "Patience in waiting",
      "Spiritual preparation",
      "Divine protection",
    ],
    bestTime: "8th of Rabi al-Awwal (his martyrdom)",
    duration: "10 minutes",
    icon: "🌙",
    audioUrl: "/audio/imam-askari.mp3",
  },

  // 13. ZIYARAT IMAM SAJJAD (AS)
  {
    id: "13",
    slug: "imam-sajjad",
    title: "Ziyarat Imam Sajjad",
    titleArabic: "زيارة الإمام السجاد",
    category: "For Imam Sajjad (AS)",
    description:
      "Ziyarat for the fourth Imam, known for his supplications and worship.",
    benefits: [
      "Excellence in worship",
      "Patience in suffering",
      "Eloquence in supplication",
      "Spiritual elevation",
    ],
    bestTime: "25th of Muharram (his martyrdom)",
    duration: "12 minutes",
    icon: "📿",
    audioUrl: "/audio/imam-sajjad.mp3",
  },

  // 14. ZIYARAT IMAM BAQIR (AS)
  {
    id: "14",
    slug: "imam-baqir",
    title: "Ziyarat Imam Baqir",
    titleArabic: "زيارة الإمام الباقر",
    category: "For Imam Baqir (AS)",
    description:
      "Ziyarat for the fifth Imam, who split open knowledge and spread Islamic sciences.",
    benefits: [
      "Deep understanding of Islam",
      "Academic success",
      "Wisdom in teaching",
      "Clarity of thought",
    ],
    bestTime: "7th of Dhul Hijjah (his martyrdom)",
    duration: "10 minutes",
    icon: "📚",
    audioUrl: "/audio/imam-baqir.mp3",
  },

  // 15. ZIYARAT IMAM SADIQ (AS)
  {
    id: "15",
    slug: "imam-sadiq",
    title: "Ziyarat Imam Sadiq",
    titleArabic: "زيارة الإمام الصادق",
    category: "For Imam Sadiq (AS)",
    description:
      "Ziyarat for the sixth Imam, who established the school of Ahlul Bayt jurisprudence.",
    benefits: [
      "Increase in knowledge",
      "Understanding of Islamic law",
      "Truthfulness in all matters",
      "Academic excellence",
    ],
    bestTime: "25th of Shawwal (his martyrdom)",
    duration: "12 minutes",
    icon: "⚖️",
    audioUrl: "/audio/imam-sadiq.mp3",
  },
];
