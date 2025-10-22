import { supabase } from "./supabase";

// ==================== EXISTING AUTH FUNCTIONS ====================

// Register a new user using Supabase Auth
export async function registerUser(
  username: string,
  email: string,
  password: string,
  fullName: string
) {
  try {
    console.log("🔵 Starting registration for:", username);

    // Check if username already exists in profiles
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("username, email")
      .eq("username", username)
      .single();

    // Ignore "not found" error (PGRST116) - it means username is available
    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking username:", checkError);
    }

    if (existingProfile) {
      console.log("⚠️ Username already exists");
      return {
        success: false,
        message: "Username already taken. Please choose another one.",
      };
    }

    // Check if email already exists in profiles
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      console.log("⚠️ Email already registered");
      return {
        success: false,
        message:
          "This email is already registered. Please login instead or use a different email.",
      };
    }

    console.log("🔵 Signing up user with Supabase Auth...");

    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      console.error("❌ Sign up error:", signUpError);

      // Check for specific Supabase Auth errors
      if (signUpError.message.includes("already registered")) {
        return {
          success: false,
          message: "This email is already registered. Please login instead.",
        };
      }

      if (signUpError.message.includes("Password")) {
        return {
          success: false,
          message:
            "Password is too weak. Please use a stronger password (at least 6 characters).",
        };
      }

      return { success: false, message: signUpError.message };
    }

    if (!authData.user) {
      console.error("❌ No user returned from sign up");
      return { success: false, message: "Error creating account" };
    }

    console.log("✅ User created in auth:", authData.user.id);
    console.log("🔵 Creating profile...");

    // Create profile (with email stored for easy login)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          full_name: fullName,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("❌ Profile creation error:", profileError);
      return {
        success: false,
        message: `Error creating profile: ${
          profileError.message || "Unknown error"
        }. Code: ${profileError.code}`,
      };
    }

    console.log("✅ Profile created successfully:", profileData);
    return {
      success: true,
      message: "Account created successfully!",
    };
  } catch (error) {
    console.error("❌ Registration catch error:", error);
    return { success: false, message: "Error creating account" };
  }
}

// Login user using Supabase Auth
export async function loginUser(
  username: string,
  password: string
): Promise<{
  success: boolean;
  message?: string;
  user?: { username: string; email: string; name: string };
  session?: any;
}> {
  try {
    console.log("🔵 Starting login for:", username);

    // Get profile to find email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      console.log("⚠️ Profile not found");
      return { success: false, message: "Invalid username or password" };
    }

    console.log("🔵 Profile found, email:", profile.email);

    // Sign in with email and password
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

    if (signInError) {
      console.error("❌ Sign in error:", signInError);

      if (signInError.message.includes("Email not confirmed")) {
        return {
          success: false,
          message:
            "Please check your email and confirm your account before logging in.",
        };
      }

      return { success: false, message: "Invalid username or password" };
    }

    console.log("✅ Login successful");

    return {
      success: true,
      user: {
        username: profile.username,
        email: profile.email,
        name: profile.full_name,
      },
      session: signInData.session,
    };
  } catch (error) {
    console.error("❌ Login error:", error);
    return { success: false, message: "Error logging in" };
  }
}

// ==================== QUOTES (EXISTING) ====================

export async function saveQuote(
  username: string,
  quoteTitle: string,
  quoteText: string
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { data, error } = await supabase
      .from("saved_quotes")
      .insert([
        {
          user_id: user.id,
          username,
          quote_title: quoteTitle,
          quote_text: quoteText,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Quote already saved" };
      }
      console.error("Save quote error:", error);
      return { success: false, message: "Error saving quote" };
    }

    return { success: true, message: "Quote saved successfully!", data };
  } catch (error) {
    console.error("Save quote error:", error);
    return { success: false, message: "Error saving quote" };
  }
}

export async function getSavedQuotes(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("saved_quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    if (error) {
      console.error("Get quotes error:", error);
      return [];
    }

    return data.map((quote: any) => ({
      id: quote.id,
      title: quote.quote_title,
      text: quote.quote_text,
      saved_at: quote.saved_at,
    }));
  } catch (error) {
    console.error("Get quotes error:", error);
    return [];
  }
}

export async function deleteQuote(quoteId: number, username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { error } = await supabase
      .from("saved_quotes")
      .delete()
      .eq("id", quoteId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete quote error:", error);
      return { success: false, message: "Error deleting quote" };
    }

    return { success: true, message: "Quote deleted successfully!" };
  } catch (error) {
    console.error("Delete quote error:", error);
    return { success: false, message: "Error deleting quote" };
  }
}

// ==================== NOTES (EXISTING) ====================

export async function addNote(
  username: string,
  quoteTitle: string,
  noteText: string
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { data, error } = await supabase
      .from("user_notes")
      .insert([
        {
          user_id: user.id,
          username,
          quote_title: quoteTitle,
          note_text: noteText,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Add note error:", error);
      return { success: false, message: "Error adding note" };
    }

    return { success: true, message: "Note added successfully!", data };
  } catch (error) {
    console.error("Add note error:", error);
    return { success: false, message: "Error adding note" };
  }
}

export async function getNotes(username: string, quoteTitle?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase.from("user_notes").select("*").eq("user_id", user.id);

    if (quoteTitle) {
      query = query.eq("quote_title", quoteTitle);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Get notes error:", error);
      return [];
    }

    return data.map((note: any) => ({
      id: note.id,
      quote_title: note.quote_title,
      note_text: note.note_text,
      created_at: note.created_at,
    }));
  } catch (error) {
    console.error("Get notes error:", error);
    return [];
  }
}

export async function deleteNote(noteId: number, username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { error } = await supabase
      .from("user_notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete note error:", error);
      return { success: false, message: "Error deleting note" };
    }

    return { success: true, message: "Note deleted successfully!" };
  } catch (error) {
    console.error("Delete note error:", error);
    return { success: false, message: "Error deleting note" };
  }
}

// ==================== READING HISTORY (EXISTING) ====================

export async function addToHistory(username: string, quoteTitle: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await supabase.from("reading_history").insert([
      {
        user_id: user.id,
        username,
        quote_title: quoteTitle,
      },
    ]);
  } catch (error) {
    console.error("Add to history error:", error);
  }
}

export const addToReadingHistory = addToHistory;

export async function getReadingHistory(username: string, limit: number = 10) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("reading_history")
      .select("quote_title, read_at")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get history error:", error);
      return [];
    }

    const uniqueQuotes = new Map();
    data.forEach((item: any) => {
      if (!uniqueQuotes.has(item.quote_title)) {
        uniqueQuotes.set(item.quote_title, item.read_at);
      }
    });

    return Array.from(uniqueQuotes, ([quote_title, last_read]) => ({
      quote_title,
      last_read,
    }));
  } catch (error) {
    console.error("Get history error:", error);
    return [];
  }
}

export async function getUserStats(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        saved_quotes: 0,
        notes: 0,
        quotes_read: 0,
        current_streak_days: 0,
        total_listening_time_seconds: 0,
        total_ziyarat_completed: 0,
      };
    }

    const [savedQuotesResult, notesResult, historyResult, listeningStats] =
      await Promise.all([
        supabase
          .from("saved_quotes")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("user_notes")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("reading_history")
          .select("quote_title")
          .eq("user_id", user.id),
        supabase
          .from("user_listening_stats")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

    const uniqueQuotes = new Set(
      historyResult.data?.map((item: any) => item.quote_title) || []
    );

    return {
      saved_quotes: savedQuotesResult.count || 0,
      notes: notesResult.count || 0,
      quotes_read: uniqueQuotes.size,
      current_streak_days: listeningStats.data?.current_streak_days || 0,
      total_listening_time_seconds:
        listeningStats.data?.total_listening_time_seconds || 0,
      total_ziyarat_completed:
        listeningStats.data?.total_ziyarat_completed || 0,
    };
  } catch (error) {
    console.error("Get stats error:", error);
    return {
      saved_quotes: 0,
      notes: 0,
      quotes_read: 0,
      current_streak_days: 0,
      total_listening_time_seconds: 0,
      total_ziyarat_completed: 0,
    };
  }
}

// ==================== ZIYARAT FAVORITES ====================

export async function addToFavorites(username: string, ziyaratSlug: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { data, error } = await supabase
      .from("ziyarat_favorites")
      .insert([{ user_id: user.id, username, ziyarat_slug: ziyaratSlug }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Already in favorites" };
      }
      console.error("Add favorite error:", error);
      return { success: false, message: "Error adding to favorites" };
    }

    return { success: true, message: "Added to favorites!" };
  } catch (error) {
    console.error("Add favorite error:", error);
    return { success: false, message: "Error adding to favorites" };
  }
}

export async function removeFromFavorites(
  username: string,
  ziyaratSlug: string
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { error } = await supabase
      .from("ziyarat_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("ziyarat_slug", ziyaratSlug);

    if (error) {
      console.error("Remove favorite error:", error);
      return { success: false, message: "Error removing from favorites" };
    }

    return { success: true, message: "Removed from favorites" };
  } catch (error) {
    console.error("Remove favorite error:", error);
    return { success: false, message: "Error removing from favorites" };
  }
}

export async function getFavorites(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("ziyarat_favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("favorited_at", { ascending: false });

    if (error) {
      console.error("Get favorites error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get favorites error:", error);
    return [];
  }
}

export async function isFavorite(username: string, ziyaratSlug: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from("ziyarat_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("ziyarat_slug", ziyaratSlug)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

// ==================== LISTENING HISTORY ====================

export async function addListeningHistory(
  username: string,
  ziyaratSlug: string,
  durationSeconds: number,
  completed: boolean
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await supabase.from("ziyarat_listening_history").insert([
      {
        user_id: user.id,
        username,
        ziyarat_slug: ziyaratSlug,
        duration_seconds: durationSeconds,
        completed,
      },
    ]);

    // Update user stats
    await updateListeningStats(user.id, username, durationSeconds, completed);
  } catch (error) {
    console.error("Add listening history error:", error);
  }
}

export async function getListeningHistory(username: string, limit = 10) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("ziyarat_listening_history")
      .select("*")
      .eq("user_id", user.id)
      .order("listened_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get listening history error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get listening history error:", error);
    return [];
  }
}

// ==================== LISTENING STATS ====================

async function updateListeningStats(
  userId: string,
  username: string,
  durationSeconds: number,
  completed: boolean
) {
  try {
    const { data: currentStats } = await supabase
      .from("user_listening_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split("T")[0];

    if (!currentStats) {
      // First time - create new record
      await supabase.from("user_listening_stats").insert([
        {
          user_id: userId,
          username,
          total_listening_time_seconds: durationSeconds,
          current_streak_days: 1,
          longest_streak_days: 1,
          last_listened_date: today,
          total_ziyarat_completed: completed ? 1 : 0,
        },
      ]);
    } else {
      // Update existing record
      const lastDate = currentStats.last_listened_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = currentStats.current_streak_days;

      if (lastDate === today) {
        newStreak = currentStats.current_streak_days;
      } else if (lastDate === yesterdayStr) {
        newStreak = currentStats.current_streak_days + 1;
      } else {
        newStreak = 1;
      }

      const longestStreak = Math.max(
        newStreak,
        currentStats.longest_streak_days
      );

      await supabase
        .from("user_listening_stats")
        .update({
          total_listening_time_seconds:
            currentStats.total_listening_time_seconds + durationSeconds,
          current_streak_days: newStreak,
          longest_streak_days: longestStreak,
          last_listened_date: today,
          total_ziyarat_completed: completed
            ? currentStats.total_ziyarat_completed + 1
            : currentStats.total_ziyarat_completed,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    await checkAndAwardBadges(userId, username);
  } catch (error) {
    console.error("Update listening stats error:", error);
  }
}

// ==================== BADGES ====================

async function checkAndAwardBadges(userId: string, username: string) {
  try {
    const { data: stats } = await supabase
      .from("user_listening_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!stats) return;

    const badges = [];

    if (stats.total_ziyarat_completed >= 1) {
      badges.push({ type: "first_listen", name: "First Steps" });
    }

    if (stats.total_ziyarat_completed >= 10) {
      badges.push({ type: "ten_ziyarat", name: "Devoted Listener" });
    }

    if (stats.total_ziyarat_completed >= 50) {
      badges.push({ type: "fifty_ziyarat", name: "Spiritual Seeker" });
    }

    if (stats.current_streak_days >= 7) {
      badges.push({ type: "seven_day_streak", name: "Week Warrior" });
    }

    if (stats.current_streak_days >= 30) {
      badges.push({ type: "thirty_day_streak", name: "Month Master" });
    }

    if (stats.total_listening_time_seconds >= 3600) {
      badges.push({ type: "one_hour", name: "Hour of Remembrance" });
    }

    if (stats.total_listening_time_seconds >= 36000) {
      badges.push({ type: "ten_hours", name: "Dedicated Soul" });
    }

    for (const badge of badges) {
      await supabase.from("user_badges").insert([
        {
          user_id: userId,
          username,
          badge_type: badge.type,
          badge_name: badge.name,
        },
      ]);
    }
  } catch (error) {
    console.error("Check badges error:", error);
  }
}

export async function getUserBadges(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Get badges error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get badges error:", error);
    return [];
  }
}

// ==================== MONTHLY REPORT ====================

export async function getMonthlyListeningReport(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: monthHistory, error } = await supabase
      .from("ziyarat_listening_history")
      .select("*")
      .eq("user_id", user.id)
      .gte("listened_at", firstDayOfMonth.toISOString())
      .lte("listened_at", lastDayOfMonth.toISOString());

    if (error) {
      console.error("Get monthly report error:", error);
      return null;
    }

    const totalListens = monthHistory?.length || 0;
    const totalTime =
      monthHistory?.reduce(
        (sum: number, item: any) => sum + (item.duration_seconds || 0),
        0
      ) || 0;
    const completedListens =
      monthHistory?.filter((item: any) => item.completed).length || 0;

    const ziyaratCounts: { [key: string]: number } = {};
    monthHistory?.forEach((item: any) => {
      ziyaratCounts[item.ziyarat_slug] =
        (ziyaratCounts[item.ziyarat_slug] || 0) + 1;
    });

    const mostListened = Object.entries(ziyaratCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      totalListens,
      totalTime,
      completedListens,
      mostListenedZiyarat: mostListened ? mostListened[0] : null,
      mostListenedCount: mostListened ? mostListened[1] : 0,
      ziyaratCounts,
    };
  } catch (error) {
    console.error("Get monthly report error:", error);
    return null;
  }
}

// ==================== NEW: AI CHATBOT FUNCTIONS ====================

export async function createChatSession(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .insert([
        {
          user_id: user.id,
          username,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create chat session error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Create chat session error:", error);
    return null;
  }
}

export async function endChatSession(sessionId: number, totalMessages: number) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await supabase
      .from("ai_chat_sessions")
      .update({
        session_end: new Date().toISOString(),
        total_messages: totalMessages,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);
  } catch (error) {
    console.error("End chat session error:", error);
  }
}

export async function saveChatMessage(
  sessionId: number,
  username: string,
  role: "user" | "assistant",
  message: string,
  intentType?: string,
  emotion?: string,
  keywords?: string[]
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false };
    }

    const { error } = await supabase.from("ai_chat_messages").insert([
      {
        session_id: sessionId,
        user_id: user.id,
        username,
        role,
        message,
        intent_type: intentType,
        emotion,
        keywords,
      },
    ]);

    if (error) {
      console.error("Save chat message error:", error);
      return { success: false };
    }

    // Update session message count
    await supabase.rpc("increment_session_messages", { session_id: sessionId });

    // Log analytics for user messages
    if (role === "user" && intentType) {
      await logAIAnalytics(username, intentType, emotion, keywords);
    }

    return { success: true };
  } catch (error) {
    console.error("Save chat message error:", error);
    return { success: false };
  }
}

export async function getUserChatHistory(username: string, limit = 50) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get chat history error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get chat history error:", error);
    return [];
  }
}

export async function saveAIResponse(
  username: string,
  question: string,
  answer: string
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { error } = await supabase.from("saved_ai_responses").insert([
      {
        user_id: user.id,
        username,
        question,
        answer,
      },
    ]);

    if (error) {
      console.error("Save AI response error:", error);
      return { success: false, message: "Error saving response" };
    }

    return { success: true, message: "Response saved!" };
  } catch (error) {
    console.error("Save AI response error:", error);
    return { success: false, message: "Error saving response" };
  }
}

export async function getSavedAIResponses(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("saved_ai_responses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get saved AI responses error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get saved AI responses error:", error);
    return [];
  }
}

export async function deleteSavedAIResponse(responseId: number) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please login first" };
    }

    const { error } = await supabase
      .from("saved_ai_responses")
      .delete()
      .eq("id", responseId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete AI response error:", error);
      return { success: false, message: "Error deleting response" };
    }

    return { success: true, message: "Response deleted!" };
  } catch (error) {
    console.error("Delete AI response error:", error);
    return { success: false, message: "Error deleting response" };
  }
}

async function logAIAnalytics(
  username: string,
  intentType: string,
  emotion?: string,
  keywords?: string[]
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await supabase.from("ai_analytics").insert([
      {
        user_id: user.id,
        username,
        intent_type: intentType,
        emotion,
        keywords,
      },
    ]);
  } catch (error) {
    console.error("Log AI analytics error:", error);
  }
}

export async function getAIStats(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Total sessions
    const { count: totalSessions } = await supabase
      .from("ai_chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Total messages
    const { count: totalMessages } = await supabase
      .from("ai_chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Top intents
    const { data: intents } = await supabase
      .from("ai_analytics")
      .select("intent_type")
      .eq("user_id", user.id);

    const intentCounts: { [key: string]: number } = {};
    intents?.forEach((item: any) => {
      if (item.intent_type) {
        intentCounts[item.intent_type] =
          (intentCounts[item.intent_type] || 0) + 1;
      }
    });

    const topIntents = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));

    // Top emotions
    const { data: emotions } = await supabase
      .from("ai_analytics")
      .select("emotion")
      .eq("user_id", user.id)
      .not("emotion", "is", null);

    const emotionCounts: { [key: string]: number } = {};
    emotions?.forEach((item: any) => {
      if (item.emotion) {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
      }
    });

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Saved responses count
    const { count: savedResponses } = await supabase
      .from("saved_ai_responses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return {
      total_sessions: totalSessions || 0,
      total_messages: totalMessages || 0,
      top_intents: topIntents,
      top_emotions: topEmotions,
      saved_responses: savedResponses || 0,
    };
  } catch (error) {
    console.error("Get AI stats error:", error);
    return null;
  }
}

export async function getActiveSession(username: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .is("session_end", null)
      .order("session_start", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get active session error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Get active session error:", error);
    return null;
  }
}
