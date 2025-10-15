// Fetch current Hijri date from API
export async function getCurrentHijriDate() {
  try {
    const response = await fetch("https://api.aladhan.com/v1/gToH");
    const data = await response.json();
    return {
      day: parseInt(data.data.hijri.day),
      month: parseInt(data.data.hijri.month.number),
      year: parseInt(data.data.hijri.year),
      monthName: data.data.hijri.month.en,
      monthNameArabic: data.data.hijri.month.ar,
      weekday: data.data.hijri.weekday.en,
      gregorianDate: data.data.gregorian.date,
    };
  } catch (error) {
    console.error("Error fetching Hijri date:", error);
    return null;
  }
}

// Get Hijri calendar for a specific month
export async function getHijriCalendar(month: number, year: number) {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/hijriCalendar/${month}/${year}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return null;
  }
}

// Convert Gregorian to Hijri
export async function gregorianToHijri(date: string) {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${date}`
    );
    const data = await response.json();
    return {
      day: parseInt(data.data.hijri.day),
      month: parseInt(data.data.hijri.month.number),
      year: parseInt(data.data.hijri.year),
      monthName: data.data.hijri.month.en,
    };
  } catch (error) {
    console.error("Error converting date:", error);
    return null;
  }
}

// Get prayer times for user location (Shia method)
export async function getPrayerTimes(
  city: string = "Qom",
  country: string = "Iran"
) {
  try {
    // Using method 0 = Shia Ithna-Ashari (Ja'fari)
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=0`
    );
    const data = await response.json();
    return {
      fajr: data.data.timings.Fajr,
      sunrise: data.data.timings.Sunrise,
      dhuhr: data.data.timings.Dhuhr,
      asr: data.data.timings.Asr,
      maghrib: data.data.timings.Maghrib,
      isha: data.data.timings.Isha,
      midnight: data.data.timings.Midnight,
      date: data.data.date.readable,
    };
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
}
