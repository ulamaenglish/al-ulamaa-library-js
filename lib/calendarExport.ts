import { createEvents, EventAttributes } from "ics";
import { shiaEvents, islamicMonths } from "@/app/calendar/data/shia-events";

export const exportToICS = (year: number) => {
  const events: EventAttributes[] = [];

  shiaEvents.forEach((event) => {
    // Convert Hijri to approximate Gregorian
    const hijriToGregorian = approximateHijriToGregorian(
      event.day,
      event.month,
      year
    );

    if (hijriToGregorian) {
      events.push({
        start: [
          hijriToGregorian.year,
          hijriToGregorian.month,
          hijriToGregorian.day,
        ],
        duration: { days: 1 },
        title: event.title,
        description: `${event.titleArabic}\n\n${event.description}`,
        status: "CONFIRMED",
        busyStatus: "FREE",
        organizer: {
          name: "ULAMA Islamic Calendar",
          email: "noreply@ulama.com",
        },
        categories: [event.type],
        alarms: [
          {
            action: "display",
            description: `${event.title} is tomorrow`,
            trigger: { hours: 24, before: true },
          },
        ],
      });
    }
  });

  const { error, value } = createEvents(events);

  if (error) {
    console.error(error);
    return null;
  }

  return value;
};

// Simplified Hijri to Gregorian conversion (approximate)
// Note: This is a simplified conversion. For production, consider using a proper API
const approximateHijriToGregorian = (
  day: number,
  month: number,
  hijriYear: number
) => {
  try {
    // Hijri calendar is about 354 days, Gregorian is 365
    // This is a simplified formula - for accuracy, use an API like Aladhan
    const gregorianYear = Math.floor(hijriYear - 579 + hijriYear / 33);

    // Calculate approximate day of year
    const daysInMonths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonths[i];
    }

    // Convert to Gregorian date
    const startDate = new Date(gregorianYear, 0, 1);
    const resultDate = new Date(
      startDate.getTime() + (dayOfYear - 1) * 24 * 60 * 60 * 1000
    );

    return {
      year: resultDate.getFullYear(),
      month: resultDate.getMonth() + 1,
      day: resultDate.getDate(),
    };
  } catch (error) {
    console.error("Error converting date:", error);
    return null;
  }
};

export const downloadICS = (year: number) => {
  const icsContent = exportToICS(year);

  if (!icsContent) {
    alert("Error generating calendar file. Please try again.");
    return;
  }

  // Create blob and download
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `islamic-calendar-${year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  alert(
    `Calendar exported! You can now import this file to Google Calendar, Apple Calendar, or Outlook.`
  );
};
