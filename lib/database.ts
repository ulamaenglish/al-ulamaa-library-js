import { supabase } from "./supabase";

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
      .select("username")
      .eq("username", username)
      .single();

    // Ignore "not found" error (PGRST116) - it means username is available
    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking username:", checkError);
    }

    if (existingProfile) {
      console.log("⚠️ Username already exists");
      return { success: false, message: "Username already exists" };
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
      return { success: false, message: signUpError.message };
    }

    if (!authData.user) {
      console.error("❌ No user returned from sign up");
      return { success: false, message: "Error creating account" };
    }

    console.log("✅ User created in auth:", authData.user.id);
    console.log("🔵 Creating profile...");
    console.log("🔵 Profile data:", {
      id: authData.user.id,
      username,
      email,
      full_name: fullName,
    });

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
      console.error("❌ Error code:", profileError.code);
      console.error("❌ Error message:", profileError.message);
      console.error("❌ Error details:", profileError.details);
      console.error("❌ Error hint:", profileError.hint);
      console.error(
        "❌ Full error object:",
        JSON.stringify(profileError, null, 2)
      );

      // Return more descriptive error message
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
      message:
        "Account created successfully! Please check your email to confirm your account.",
    };
  } catch (error) {
    console.error("❌ Registration catch error:", error);
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    return { success: false, message: "Error creating account" };
  }
}

// Login user using Supabase Auth
export async function loginUser(username: string, password: string) {
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
    console.log("🔵 Attempting sign in...");

    // Sign in with email and password
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

    if (signInError) {
      console.error("❌ Sign in error:", signInError);

      // Check if it's an email not confirmed error
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
    };
  } catch (error) {
    console.error("❌ Login error:", error);
    return { success: false, message: "Error logging in" };
  }
}

// Save a quote
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

// Get saved quotes
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

    return data.map((quote) => ({
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

// Delete a quote
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

// Add a note
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

// Get notes
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

    return data.map((note) => ({
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

// Delete a note
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

// Add to reading history
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

// Get reading history
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
    data.forEach((item) => {
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

// Get user stats
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
      };
    }

    const [savedQuotesResult, notesResult, historyResult] = await Promise.all([
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
    ]);

    const uniqueQuotes = new Set(
      historyResult.data?.map((item) => item.quote_title) || []
    );

    return {
      saved_quotes: savedQuotesResult.count || 0,
      notes: notesResult.count || 0,
      quotes_read: uniqueQuotes.size,
    };
  } catch (error) {
    console.error("Get stats error:", error);
    return {
      saved_quotes: 0,
      notes: 0,
      quotes_read: 0,
    };
  }
}
