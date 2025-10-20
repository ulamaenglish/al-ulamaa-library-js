// Search engine for all content across the website

export interface SearchResult {
  id: string;
  title: string;
  titleArabic?: string;
  content: string;
  category: string;
  path: string;
  relevance: number;
}

// Mock data - Replace with your actual data sources
const SEARCH_DATA = {
  ziyarat: [
    {
      id: "ziyarat-1",
      title: "Ziyarat Ashura",
      titleArabic: "زيارة عاشوراء",
      content: "Sacred visitation to Imam Hussain (as)",
      category: "Ziyarat",
      path: "/ziyarat/imam-hussain",
    },
    {
      id: "ziyarat-2",
      title: "Ziyarat Waritha",
      titleArabic: "زيارة وارثة",
      content: "Visitation of the inheritor",
      category: "Ziyarat",
      path: "/ziyarat/imam-hussain",
    },
    {
      id: "ziyarat-3",
      title: "Ziyarat Imam Ali",
      titleArabic: "زيارة الإمام علي",
      content: "Sacred visitation to Imam Ali (as)",
      category: "Ziyarat",
      path: "/ziyarat/imam-ali",
    },
    {
      id: "ziyarat-4",
      title: "Ziyarat Imam Reza",
      titleArabic: "زيارة الإمام الرضا",
      content: "Sacred visitation to Imam Reza (as)",
      category: "Ziyarat",
      path: "/ziyarat/imam-reza",
    },
    {
      id: "ziyarat-5",
      title: "Ziyarat Lady Fatima",
      titleArabic: "زيارة السيدة فاطمة",
      content: "Sacred visitation to Lady Fatima (as)",
      category: "Ziyarat",
      path: "/ziyarat/lady-fatima",
    },
  ],
  duas: [
    {
      id: "dua-1",
      title: "Morning Dua",
      titleArabic: "دعاء الصباح",
      content: "Daily morning supplication for blessings",
      category: "Duas",
      path: "/dua-wisdom",
    },
    {
      id: "dua-2",
      title: "Evening Dua",
      titleArabic: "دعاء المساء",
      content: "Daily evening supplication for protection",
      category: "Duas",
      path: "/dua-wisdom",
    },
    {
      id: "dua-3",
      title: "Dua Kumayl",
      titleArabic: "دعاء كميل",
      content: "Powerful supplication taught by Imam Ali",
      category: "Duas",
      path: "/dua-wisdom",
    },
    {
      id: "dua-4",
      title: "Dua al-Faraj",
      titleArabic: "دعاء الفرج",
      content: "Prayer for relief and Imam Mahdi",
      category: "Duas",
      path: "/dua-wisdom",
    },
  ],
  hadiths: [
    {
      id: "hadith-1",
      title: "First Hadith - Self Awareness",
      titleArabic: "الحديث الأول",
      content: "On knowing yourself and spiritual reflection by Imam Khomeini",
      category: "Hadiths",
      path: "/imam-khomeini-hadith",
    },
    {
      id: "hadith-2",
      title: "Hadith on Humility",
      titleArabic: "حديث التواضع",
      content: "The importance of humility in spiritual growth",
      category: "Hadiths",
      path: "/imam-khomeini-hadith",
    },
  ],
  poems: [
    {
      id: "poem-1",
      title: "Divine Love Poem",
      titleArabic: "قصيدة الحب الإلهي",
      content: "Mystical poetry by Imam Khomeini about divine love",
      category: "Poems",
      path: "/imam-khomeini-poems",
    },
  ],
  sayings: [
    {
      id: "saying-1",
      title: "Ayatollah Bahjat on Patience",
      titleArabic: "آية الله بهجت عن الصبر",
      content: "Wisdom on patience and trust in Allah",
      category: "Sayings",
      path: "/ayatollah-bahjat",
    },
    {
      id: "saying-2",
      title: "Shahid Mutahhari on Knowledge",
      titleArabic: "الشهيد مطهري عن العلم",
      content: "The importance of seeking knowledge",
      category: "Sayings",
      path: "/shahid-mutahhari",
    },
  ],
  calendar: [
    {
      id: "event-1",
      title: "Birth of Imam Ali",
      titleArabic: "ولادة الإمام علي",
      content: "13th Rajab - Birth anniversary of Imam Ali (as)",
      category: "Calendar",
      path: "/calendar",
    },
    {
      id: "event-2",
      title: "Day of Ashura",
      titleArabic: "يوم عاشوراء",
      content: "10th Muharram - Martyrdom of Imam Hussain (as)",
      category: "Calendar",
      path: "/calendar",
    },
  ],
};

export function searchContent(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const allResults: SearchResult[] = [];

  // Search across all categories
  Object.values(SEARCH_DATA).forEach((categoryData) => {
    categoryData.forEach((item) => {
      let relevance = 0;

      // Check title match
      if (item.title.toLowerCase().includes(searchTerm)) {
        relevance += 10;
      }

      // Check Arabic title match
      if (item.titleArabic && item.titleArabic.includes(searchTerm)) {
        relevance += 10;
      }

      // Check content match
      if (item.content.toLowerCase().includes(searchTerm)) {
        relevance += 5;
      }

      // Check category match
      if (item.category.toLowerCase().includes(searchTerm)) {
        relevance += 3;
      }

      // Add to results if relevant
      if (relevance > 0) {
        allResults.push({
          ...item,
          relevance,
        });
      }
    });
  });

  // Sort by relevance (highest first)
  return allResults.sort((a, b) => b.relevance - a.relevance);
}

export function getRecentSearches(): string[] {
  const searches = localStorage.getItem("recentSearches");
  return searches ? JSON.parse(searches) : [];
}

export function saveRecentSearch(query: string): void {
  const searches = getRecentSearches();
  const updated = [query, ...searches.filter((s) => s !== query)].slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(updated));
}

export function clearRecentSearches(): void {
  localStorage.removeItem("recentSearches");
}
