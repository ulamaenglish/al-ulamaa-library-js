export interface IslamicEvent {
  day: number;
  month: number;
  year?: number; // ✅ ADDED
  title: string;
  titleArabic: string;
  description: string;
  type: "birth" | "martyrdom" | "celebration" | "special" | "fasting";
  color: string;
  recommendedZiyarat?: string;
}

export const islamicMonths = [
  { number: 1, name: "Muharram", arabic: "محرم" },
  { number: 2, name: "Safar", arabic: "صفر" },
  { number: 3, name: "Rabi' al-Awwal", arabic: "ربيع الأول" },
  { number: 4, name: "Rabi' al-Thani", arabic: "ربيع الثاني" },
  { number: 5, name: "Jumada al-Awwal", arabic: "جمادى الأولى" },
  { number: 6, name: "Jumada al-Thani", arabic: "جمادى الثانية" },
  { number: 7, name: "Rajab", arabic: "رجب" },
  { number: 8, name: "Sha'ban", arabic: "شعبان" },
  { number: 9, name: "Ramadan", arabic: "رمضان" },
  { number: 10, name: "Shawwal", arabic: "شوال" },
  { number: 11, name: "Dhu al-Qi'dah", arabic: "ذو القعدة" },
  { number: 12, name: "Dhu al-Hijjah", arabic: "ذو الحجة" },
];

export const shiaEvents: IslamicEvent[] = [
  // MUHARRAM (Month 1) - Month of Mourning
  {
    day: 1,
    month: 1,
    title: "Islamic New Year",
    titleArabic: "رأس السنة الهجرية",
    description:
      "The beginning of the Islamic lunar calendar year. A time for reflection and renewal of faith.",
    type: "celebration",
    color: "#ffd89b",
  },
  {
    day: 9,
    month: 1,
    title: "Eve of Ashura - Tasu'a",
    titleArabic: "تاسوعاء",
    description:
      "The day before Ashura, marking the beginning of the tragic events at Karbala. Day of mourning and remembrance.",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 10,
    month: 1,
    title: "Day of Ashura - Martyrdom of Imam Hussain",
    titleArabic: "عاشوراء - شهادة الإمام الحسين",
    description:
      "The most sacred day of mourning for Shia Muslims, commemorating the martyrdom of Imam Hussain and his companions at the Battle of Karbala in 680 CE. A day of deep reflection, mourning processions, and renewal of commitment to truth and justice.",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 20,
    month: 1,
    title: "Arbaeen - 40th Day After Ashura",
    titleArabic: "الأربعين",
    description:
      "Marks 40 days after the martyrdom of Imam Hussain. Millions gather in Karbala for the largest peaceful gathering on Earth. A day of pilgrimage and remembrance.",
    type: "special",
    color: "#93c5fd",
    recommendedZiyarat: "imam-hussain",
  },

  // SAFAR (Month 2)
  {
    day: 20,
    month: 2,
    title: "Arbaeen (40 days after Ashura)",
    titleArabic: "الأربعين",
    description:
      "The 40th day of mourning after Ashura. The largest annual peaceful gathering in the world takes place in Karbala.",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 28,
    month: 2,
    title: "Martyrdom of Prophet Muhammad & Imam Hassan al-Mujtaba",
    titleArabic: "وفاة النبي محمد والإمام الحسن المجتبى",
    description:
      "A day of great sorrow marking the passing of the Holy Prophet and the martyrdom of Imam Hassan (AS).",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "prophet-muhammad",
  },

  // RABI' AL-AWWAL (Month 3)
  {
    day: 8,
    month: 3,
    title: "Martyrdom of Imam Hassan al-Askari",
    titleArabic: "شهادة الإمام الحسن العسكري",
    description:
      "Commemorating the martyrdom of the 11th Imam, father of Imam Mahdi (AS).",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "imam-mahdi",
  },
  {
    day: 17,
    month: 3,
    title: "Birth of Prophet Muhammad & Imam Ja'far al-Sadiq",
    titleArabic: "مولد النبي محمد والإمام جعفر الصادق",
    description:
      "Celebrating the birth of the Holy Prophet Muhammad (PBUH) and Imam Ja'far al-Sadiq (AS), the 6th Imam.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "prophet-muhammad",
  },

  // RAJAB (Month 7) - Sacred Month
  {
    day: 1,
    month: 7,
    title: "Beginning of Rajab - Month of Allah",
    titleArabic: "بداية شهر رجب",
    description:
      "One of the four sacred months. A blessed month for worship, fasting, and seeking forgiveness.",
    type: "special",
    color: "#93c5fd",
  },
  {
    day: 3,
    month: 7,
    title: "Martyrdom of Imam Ali al-Hadi",
    titleArabic: "شهادة الإمام علي الهادي",
    description:
      "Commemorating the martyrdom of the 10th Imam, known for his knowledge and piety.",
    type: "martyrdom",
    color: "#dc2626",
  },
  {
    day: 13,
    month: 7,
    title: "Birth of Imam Ali ibn Abi Talib",
    titleArabic: "مولد الإمام علي بن أبي طالب",
    description:
      "Celebrating the birth of Imam Ali (AS), the first Imam and cousin of Prophet Muhammad. Born inside the Holy Ka'bah.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-ali",
  },
  {
    day: 15,
    month: 7,
    title: "Death of Lady Zainab",
    titleArabic: "وفاة السيدة زينب",
    description:
      "Remembering Lady Zainab, the courageous sister of Imam Hussain, known for her eloquent speeches after Karbala.",
    type: "martyrdom",
    color: "#dc2626",
  },
  {
    day: 27,
    month: 7,
    title: "Be'that - Appointment of Prophet Muhammad",
    titleArabic: "البعثة النبوية",
    description:
      "Commemorating the day Prophet Muhammad received his first revelation and began his prophetic mission.",
    type: "celebration",
    color: "#ffd89b",
    recommendedZiyarat: "prophet-muhammad",
  },

  // SHA'BAN (Month 8)
  {
    day: 3,
    month: 8,
    title: "Birth of Imam Hussain ibn Ali",
    titleArabic: "مولد الإمام الحسين بن علي",
    description:
      "Celebrating the birth of Imam Hussain (AS), the third Imam and the Master of Martyrs.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 4,
    month: 8,
    title: "Birth of Abbas ibn Ali (Al-Abbas)",
    titleArabic: "مولد العباس بن علي",
    description:
      "Celebrating the birth of Abbas (AS), the loyal brother and standard-bearer of Imam Hussain at Karbala.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 5,
    month: 8,
    title: "Birth of Imam Ali al-Akbar",
    titleArabic: "مولد الإمام علي الأكبر",
    description:
      "Celebrating the birth of Ali al-Akbar, the eldest son of Imam Hussain who was martyred at Karbala.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-hussain",
  },
  {
    day: 15,
    month: 8,
    title: "Birth of Imam al-Mahdi",
    titleArabic: "مولد الإمام المهدي",
    description:
      "Celebrating the birth of the 12th Imam, the Awaited Savior who is believed to be in occultation and will return to establish justice.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-mahdi",
  },

  // RAMADAN (Month 9) - Month of Fasting
  {
    day: 1,
    month: 9,
    title: "First Day of Ramadan",
    titleArabic: "أول أيام رمضان",
    description:
      "The beginning of the holy month of fasting, prayer, and spiritual reflection. The month when the Quran was revealed.",
    type: "celebration",
    color: "#ffd89b",
  },
  {
    day: 15,
    month: 9,
    title: "Birth of Imam Hassan ibn Ali",
    titleArabic: "مولد الإمام الحسن بن علي",
    description:
      "Celebrating the birth of Imam Hassan (AS), the second Imam and grandson of Prophet Muhammad.",
    type: "birth",
    color: "#86efac",
  },
  {
    day: 19,
    month: 9,
    title: "Martyrdom of Imam Ali ibn Abi Talib",
    titleArabic: "شهادة الإمام علي بن أبي طالب",
    description:
      "Commemorating the martyrdom of Imam Ali (AS), struck by a poisoned sword while praying in the mosque of Kufa.",
    type: "martyrdom",
    color: "#dc2626",
    recommendedZiyarat: "imam-ali",
  },
  {
    day: 21,
    month: 9,
    title: "Laylat al-Qadr (Night of Power)",
    titleArabic: "ليلة القدر",
    description:
      "One of the holiest nights, when the Quran was first revealed. A night of worship and seeking forgiveness, better than 1000 months.",
    type: "special",
    color: "#93c5fd",
  },
  {
    day: 23,
    month: 9,
    title: "Laylat al-Qadr (Night of Power)",
    titleArabic: "ليلة القدر",
    description:
      "Another possible night of Laylat al-Qadr. A night of intense worship and prayer.",
    type: "special",
    color: "#93c5fd",
  },

  // SHAWWAL (Month 10)
  {
    day: 1,
    month: 10,
    title: "Eid al-Fitr",
    titleArabic: "عيد الفطر",
    description:
      "The Festival of Breaking the Fast, celebrating the completion of Ramadan. A day of joy, charity, and community.",
    type: "celebration",
    color: "#ffd89b",
  },
  {
    day: 25,
    month: 10,
    title: "Martyrdom of Imam Ja'far al-Sadiq",
    titleArabic: "شهادة الإمام جعفر الصادق",
    description:
      "Commemorating the martyrdom of the 6th Imam, renowned for his vast knowledge and the establishment of Islamic jurisprudence.",
    type: "martyrdom",
    color: "#dc2626",
  },

  // DHU AL-QI'DAH (Month 11)
  {
    day: 11,
    month: 11,
    title: "Birth of Imam Ali al-Ridha",
    titleArabic: "مولد الإمام علي الرضا",
    description:
      "Celebrating the birth of the 8th Imam, buried in Mashhad, Iran.",
    type: "birth",
    color: "#86efac",
    recommendedZiyarat: "imam-reza",
  },
  {
    day: 23,
    month: 11,
    title: "Martyrdom of Imam Muhammad al-Jawad",
    titleArabic: "شهادة الإمام محمد الجواد",
    description:
      "Commemorating the martyrdom of the 9th Imam, who became Imam at a young age.",
    type: "martyrdom",
    color: "#dc2626",
  },
  {
    day: 25,
    month: 11,
    title: "Death of Imam Musa al-Kadhim",
    titleArabic: "وفاة الإمام موسى الكاظم",
    description:
      "Commemorating the martyrdom of the 7th Imam, known for his patience and forbearance.",
    type: "martyrdom",
    color: "#dc2626",
  },

  // DHU AL-HIJJAH (Month 12) - Month of Pilgrimage
  {
    day: 1,
    month: 12,
    title: "Beginning of Dhu al-Hijjah",
    titleArabic: "بداية ذو الحجة",
    description:
      "The sacred month of pilgrimage. The first ten days are among the most blessed days of the year.",
    type: "special",
    color: "#93c5fd",
  },
  {
    day: 7,
    month: 12,
    title: "Martyrdom of Imam Muhammad al-Baqir",
    titleArabic: "شهادة الإمام محمد الباقر",
    description:
      "Commemorating the martyrdom of the 5th Imam, known for his deep knowledge and wisdom.",
    type: "martyrdom",
    color: "#dc2626",
  },
  {
    day: 9,
    month: 12,
    title: "Day of Arafah",
    titleArabic: "يوم عرفة",
    description:
      "The most important day of Hajj pilgrimage. A day of fasting, prayer, and seeking forgiveness.",
    type: "special",
    color: "#93c5fd",
  },
  {
    day: 10,
    month: 12,
    title: "Eid al-Adha (Feast of Sacrifice)",
    titleArabic: "عيد الأضحى",
    description:
      "Commemorating Prophet Ibrahim's willingness to sacrifice his son. A day of prayer, sacrifice, and charity.",
    type: "celebration",
    color: "#ffd89b",
  },
  {
    day: 18,
    month: 12,
    title: "Eid al-Ghadir",
    titleArabic: "عيد الغدير",
    description:
      "Celebrating the appointment of Imam Ali as the successor of Prophet Muhammad at Ghadir Khumm. One of the most significant days for Shia Muslims.",
    type: "celebration",
    color: "#ffd89b",
    recommendedZiyarat: "imam-ali",
  },
  {
    day: 24,
    month: 12,
    title: "Eid al-Mubahala",
    titleArabic: "عيد المباهلة",
    description:
      "Commemorating the event of Mubahala when Prophet Muhammad and his family confronted Christians of Najran to prove the truth of Islam.",
    type: "celebration",
    color: "#ffd89b",
  },
];

// Helper function to get events for a specific day
export const getEventForDay = (
  day: number,
  month: number
): IslamicEvent | null => {
  const event = shiaEvents.find((e) => e.day === day && e.month === month);
  return event || null;
};

// Helper function to get all events for a specific month
export const getEventsForMonth = (month: number): IslamicEvent[] => {
  return shiaEvents.filter((e) => e.month === month);
};
