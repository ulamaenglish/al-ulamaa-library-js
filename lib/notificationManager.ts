export interface PrayerNotificationSettings {
  enabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  reminderMinutes: number; // 5, 10, 15, or 30
  sound: boolean;
}

export const DEFAULT_SETTINGS: PrayerNotificationSettings = {
  enabled: false,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  reminderMinutes: 10,
  sound: true,
};

export function getNotificationSettings(): PrayerNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const saved = localStorage.getItem("prayerNotificationSettings");
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

export function saveNotificationSettings(
  settings: PrayerNotificationSettings
): void {
  localStorage.setItem("prayerNotificationSettings", JSON.stringify(settings));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    alert("❌ Your browser doesn't support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showPrayerNotification(
  prayerName: string,
  timeString: string
): void {
  if (Notification.permission === "granted") {
    const notification = new Notification(`🕌 Time for ${prayerName} Prayer`, {
      body: `Prayer time is at ${timeString}`,
      icon: "/icon-512x512.png", // Make sure you have this icon
      badge: "/icon-192x192.png",
      tag: `prayer-${prayerName}`,
      requireInteraction: false,
      silent: !getNotificationSettings().sound,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }
}

export function schedulePrayerNotifications(prayerTimes: any): void {
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    return;
  }

  // Clear existing timers
  clearAllPrayerTimers();

  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr, enabled: settings.prayers.fajr },
    { name: "Dhuhr", time: prayerTimes.dhuhr, enabled: settings.prayers.dhuhr },
    { name: "Asr", time: prayerTimes.asr, enabled: settings.prayers.asr },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      enabled: settings.prayers.maghrib,
    },
    { name: "Isha", time: prayerTimes.isha, enabled: settings.prayers.isha },
  ];

  prayers.forEach((prayer) => {
    if (!prayer.enabled) return;

    // Parse prayer time (format: "05:30 AM")
    const [time, period] = prayer.time.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    if (period === "AM" && hours === 12) hour24 = 0;

    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(hour24, minutes, 0, 0);

    // Subtract reminder minutes
    const notificationDate = new Date(
      prayerDate.getTime() - settings.reminderMinutes * 60000
    );

    // If notification time has passed today, schedule for tomorrow
    if (notificationDate < now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    const timeUntilNotification = notificationDate.getTime() - now.getTime();

    const timerId = setTimeout(() => {
      showPrayerNotification(prayer.name, prayer.time);
    }, timeUntilNotification);

    // Store timer ID
    const timerIds = JSON.parse(localStorage.getItem("prayerTimerIds") || "[]");
    timerIds.push(timerId);
    localStorage.setItem("prayerTimerIds", JSON.stringify(timerIds));
  });
}

export function clearAllPrayerTimers(): void {
  const timerIds = JSON.parse(localStorage.getItem("prayerTimerIds") || "[]");
  timerIds.forEach((id: number) => clearTimeout(id));
  localStorage.setItem("prayerTimerIds", "[]");
}
