import { ConversationContext } from "./contextManager";
import { IslamicEvent } from "@/app/calendar/data/shia-events";

export interface ProactiveSuggestion {
  type: "reminder" | "recommendation" | "insight" | "celebration";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    target: string;
  };
}

export function generateProactiveSuggestions(
  context: ConversationContext
): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];

  // Check for special Islamic dates
  if (
    context.islamicContext.todayEvents &&
    context.islamicContext.todayEvents.length > 0
  ) {
    context.islamicContext.todayEvents.forEach((event: IslamicEvent) => {
      suggestions.push({
        type: "celebration",
        priority: "high",
        title: `Special Day: ${event.title}`,
        message: `Today is ${event.title}! ${event.description}`,
        icon: getEventIcon(event.type),
        action: {
          label: "Learn More",
          target: "/calendar",
        },
      });
    });
  }

  // Prayer time reminders
  if (context.islamicContext.nextPrayer) {
    const nextPrayerTime = getNextPrayerTime(
      context.islamicContext.prayerTimes,
      context.islamicContext.nextPrayer
    );
    if (nextPrayerTime && isWithinMinutes(nextPrayerTime, 30)) {
      suggestions.push({
        type: "reminder",
        priority: "high",
        title: `${context.islamicContext.nextPrayer} Prayer Soon`,
        message: `${
          context.islamicContext.nextPrayer
        } prayer is in ${getMinutesUntil(
          nextPrayerTime
        )} minutes at ${nextPrayerTime}`,
        icon: "🕌",
        action: {
          label: "View All Prayer Times",
          target: "/calendar",
        },
      });
    }
  }

  // Emotional pattern insights
  const insights = getUserEmotionalInsights(context);
  if (insights.length > 0) {
    suggestions.push(...insights);
  }

  // Time-based recommendations
  const timeBasedSuggestion = getTimeBasedSuggestion();
  if (timeBasedSuggestion) {
    suggestions.push(timeBasedSuggestion);
  }

  // Weekly recommendations
  if (isThursday() && !hasInteractedToday(context)) {
    suggestions.push({
      type: "recommendation",
      priority: "medium",
      title: "Thursday Special: Dua-e-Kumayl",
      message:
        "It's Thursday evening - the perfect time to recite Dua-e-Kumayl, a powerful supplication taught by Imam Ali (AS).",
      icon: "🌙",
      action: {
        label: "Read Dua-e-Kumayl",
        target: "/dua/kumayl",
      },
    });
  }

  // Friday recommendations
  if (isFriday()) {
    suggestions.push({
      type: "recommendation",
      priority: "high",
      title: "Blessed Friday",
      message:
        "Jummah Mubarak! Don't forget to send salawat (blessings) upon the Prophet and his family today.",
      icon: "✨",
      action: {
        label: "Learn Salawat",
        target: "/dhikr/salawat",
      },
    });
  }

  // User engagement patterns
  if (context.sessionData.todayInteractions === 0) {
    suggestions.push({
      type: "insight",
      priority: "low",
      title: "Welcome Back! 🌟",
      message:
        "It's wonderful to see you again. How can I support your spiritual journey today?",
      icon: "🤲",
    });
  }

  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    birth: "🌟",
    martyrdom: "🕊️",
    celebration: "🎉",
    special: "✨",
    fasting: "🌙",
  };
  return icons[type] || "📅";
}

function getNextPrayerTime(
  prayerTimes: any,
  prayerName: string
): string | null {
  if (!prayerTimes || !prayerName) return null;

  const prayerMap: Record<string, string> = {
    Fajr: prayerTimes.fajr,
    Dhuhr: prayerTimes.dhuhr,
    Asr: prayerTimes.asr,
    Maghrib: prayerTimes.maghrib,
    Isha: prayerTimes.isha,
  };

  return prayerMap[prayerName] || null;
}

function isWithinMinutes(timeString: string, minutes: number): boolean {
  try {
    const [hours, mins] = timeString.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, mins, 0, 0);

    const now = new Date();
    const diff = prayerTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diff / 60000);

    return diffMinutes > 0 && diffMinutes <= minutes;
  } catch {
    return false;
  }
}

function getMinutesUntil(timeString: string): number {
  try {
    const [hours, mins] = timeString.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, mins, 0, 0);

    const now = new Date();
    const diff = prayerTime.getTime() - now.getTime();
    return Math.floor(diff / 60000);
  } catch {
    return 0;
  }
}

function getUserEmotionalInsights(
  context: ConversationContext
): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];
  const { commonEmotions } = context.userPreferences;

  // Check for recurring sadness
  const recentSadness = commonEmotions.filter((e) => e === "sad").length;
  if (recentSadness >= 3) {
    suggestions.push({
      type: "insight",
      priority: "high",
      title: "Spiritual Support Available",
      message:
        "I notice you've been feeling down. Remember, Allah is with those who are patient. Would you like some uplifting content?",
      icon: "💙",
      action: {
        label: "Find Comfort",
        target: "/ziyarat/imam-hussain",
      },
    });
  }

  // Check for recurring anxiety
  const recentAnxiety = commonEmotions.filter((e) => e === "anxious").length;
  if (recentAnxiety >= 3) {
    suggestions.push({
      type: "insight",
      priority: "high",
      title: "Peace Be Upon You",
      message:
        "You've been feeling anxious lately. Let me guide you to prayers that bring tranquility and peace.",
      icon: "🌿",
      action: {
        label: "Find Peace",
        target: "/dua/peace",
      },
    });
  }

  return suggestions;
}

function getTimeBasedSuggestion(): ProactiveSuggestion | null {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) {
    return {
      type: "recommendation",
      priority: "medium",
      title: "Beautiful Morning",
      message:
        "Start your day with morning supplications and gratitude. The early hours are blessed!",
      icon: "🌅",
      action: {
        label: "Morning Duas",
        target: "/dua/morning",
      },
    };
  }

  if (hour >= 21 && hour < 23) {
    return {
      type: "recommendation",
      priority: "medium",
      title: "Evening Reflection",
      message:
        "The night is a perfect time for spiritual reflection and prayer. Consider reciting evening duas.",
      icon: "🌙",
      action: {
        label: "Evening Duas",
        target: "/dua/evening",
      },
    };
  }

  return null;
}

function isThursday(): boolean {
  return new Date().getDay() === 4;
}

function isFriday(): boolean {
  return new Date().getDay() === 5;
}

function hasInteractedToday(context: ConversationContext): boolean {
  return context.sessionData.todayInteractions > 0;
}
