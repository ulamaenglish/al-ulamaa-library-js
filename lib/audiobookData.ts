export interface AudiobookChapter {
  title: string;
  startTime: string; // Format: "HH:MM:SS"
  startSeconds: number;
}

export interface Audiobook {
  id: string;
  title: string;
  titleArabic?: string;
  author: string;
  authorArabic?: string;
  description: string;
  duration: string; // Format: "HH:MM:SS"
  durationSeconds: number;
  narrator: string;
  category: string;
  language: string;
  coverImage: string;
  audioFile: string;
  premium: boolean;
  chapters: AudiobookChapter[];
}

// Helper function to convert time string to seconds
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return 0;
}

// Sample audiobook data (we'll add more later)
export const AUDIOBOOKS: Audiobook[] = [
  {
    id: "40-hadith-imam-khomeini",
    title: "40 Hadith",
    titleArabic: "الأحاديث الأربعون",
    author: "Imam Khomeini",
    authorArabic: "الإمام الخميني",
    description:
      "A profound spiritual journey through 40 authentic hadiths, with detailed commentary on self-purification and spiritual growth. This masterpiece guides readers through the path of Islamic mysticism and ethics.",
    duration: "8:45:30",
    durationSeconds: timeToSeconds("8:45:30"),
    narrator: "AI Voice (English)",
    category: "Hadith",
    language: "English",
    coverImage: "/images/audiobooks/40hadith.jpg",
    audioFile: "/audio/40hadith.mp3",
    premium: false,
    chapters: [
      {
        title: "Introduction",
        startTime: "0:00:00",
        startSeconds: 0,
      },
      {
        title: "First Hadith: Self-Knowledge",
        startTime: "0:15:30",
        startSeconds: timeToSeconds("0:15:30"),
      },
      {
        title: "Second Hadith: Purification of the Heart",
        startTime: "0:45:20",
        startSeconds: timeToSeconds("0:45:20"),
      },
      {
        title: "Third Hadith: Repentance",
        startTime: "1:20:15",
        startSeconds: timeToSeconds("1:20:15"),
      },
      {
        title: "Fourth Hadith: Love for Allah",
        startTime: "2:00:00",
        startSeconds: timeToSeconds("2:00:00"),
      },
      {
        title: "Fifth Hadith: Remembrance of Death",
        startTime: "2:35:45",
        startSeconds: timeToSeconds("2:35:45"),
      },
    ],
  },
  {
    id: "adab-as-salat",
    title: "Adab as-Salat",
    titleArabic: "آداب الصلاة",
    author: "Imam Khomeini",
    authorArabic: "الإمام الخميني",
    description:
      "The inner dimensions and spiritual secrets of prayer, revealing the mystical aspects of worship. A comprehensive guide to achieving presence of heart in prayer.",
    duration: "12:30:00",
    durationSeconds: timeToSeconds("12:30:00"),
    narrator: "AI Voice (English)",
    category: "Spirituality",
    language: "English",
    coverImage: "/images/audiobooks/adab-salat.jpg",
    audioFile: "/audio/adab-salat.mp3",
    premium: true,
    chapters: [
      {
        title: "Introduction to the Secrets of Prayer",
        startTime: "0:00:00",
        startSeconds: 0,
      },
      {
        title: "The Reality of Prayer",
        startTime: "0:30:00",
        startSeconds: timeToSeconds("0:30:00"),
      },
      {
        title: "Presence of Heart",
        startTime: "1:15:00",
        startSeconds: timeToSeconds("1:15:00"),
      },
      {
        title: "Spiritual Ascension Through Prayer",
        startTime: "2:00:00",
        startSeconds: timeToSeconds("2:00:00"),
      },
    ],
  },
  {
    id: "prayers-maasumeen",
    title: "Prayers of Maasumeen",
    titleArabic: "أدعية المعصومين",
    author: "The 14 Infallibles",
    authorArabic: "المعصومون الأربعة عشر",
    description:
      "Collection of authentic supplications from the Prophet Muhammad and the 12 Imams, beautifully recited with English translations. Connect with the words of the Ahlul Bayt.",
    duration: "6:20:00",
    durationSeconds: timeToSeconds("6:20:00"),
    narrator: "AI Voice (Arabic & English)",
    category: "Dua",
    language: "Bilingual",
    coverImage: "/images/audiobooks/maasumeen-prayers.jpg",
    audioFile: "/audio/maasumeen-prayers.mp3",
    premium: false,
    chapters: [
      {
        title: "Morning Supplications",
        startTime: "0:00:00",
        startSeconds: 0,
      },
      {
        title: "Evening Supplications",
        startTime: "1:30:00",
        startSeconds: timeToSeconds("1:30:00"),
      },
      {
        title: "Dua Kumayl",
        startTime: "2:45:00",
        startSeconds: timeToSeconds("2:45:00"),
      },
      {
        title: "Dua Tawassul",
        startTime: "3:30:00",
        startSeconds: timeToSeconds("3:30:00"),
      },
      {
        title: "Dua Faraj",
        startTime: "4:15:00",
        startSeconds: timeToSeconds("4:15:00"),
      },
    ],
  },
];

// Get audiobook by ID
export function getAudiobookById(id: string): Audiobook | undefined {
  return AUDIOBOOKS.find((book) => book.id === id);
}

// Get free audiobooks
export function getFreeAudiobooks(): Audiobook[] {
  return AUDIOBOOKS.filter((book) => !book.premium);
}

// Get premium audiobooks
export function getPremiumAudiobooks(): Audiobook[] {
  return AUDIOBOOKS.filter((book) => book.premium);
}

// Get audiobooks by category
export function getAudiobooksByCategory(category: string): Audiobook[] {
  return AUDIOBOOKS.filter((book) => book.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
  const categories = AUDIOBOOKS.map((book) => book.category);
  return Array.from(new Set(categories));
}
