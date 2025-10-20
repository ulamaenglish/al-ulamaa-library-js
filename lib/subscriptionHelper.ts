import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getUserSubscription(userEmail: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_tier, subscription_status, subscription_expires_at")
      .eq("email", userEmail)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return {
        tier: "free",
        status: "active",
        isPremium: false,
      };
    }

    return {
      tier: data.subscription_tier || "free",
      status: data.subscription_status || "active",
      isPremium: data.subscription_tier === "premium",
      expiresAt: data.subscription_expires_at,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      tier: "free",
      status: "active",
      isPremium: false,
    };
  }
}

export async function checkAudiobookAccess(
  audiobookId: number,
  userEmail: string
) {
  try {
    // Get audiobook info
    const { data: audiobook } = await supabase
      .from("audiobooks")
      .select("premium, is_free")
      .eq("id", audiobookId)
      .single();

    if (!audiobook) return { hasAccess: false, reason: "Audiobook not found" };

    // If audiobook is free, everyone has access
    if (audiobook.is_free) {
      return { hasAccess: true, reason: "Free audiobook" };
    }

    // If audiobook is not premium, everyone has access
    if (!audiobook.premium) {
      return { hasAccess: true, reason: "Not premium content" };
    }

    // Check user's subscription
    const subscription = await getUserSubscription(userEmail);

    if (subscription.isPremium) {
      return { hasAccess: true, reason: "Premium subscriber" };
    }

    return {
      hasAccess: false,
      reason: "Premium subscription required",
    };
  } catch (error) {
    console.error("Error checking access:", error);
    return { hasAccess: false, reason: "Error checking access" };
  }
}
