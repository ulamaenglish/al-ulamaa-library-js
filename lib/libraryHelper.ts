import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LibraryItem {
  id: string;
  audiobook_id: string;
  is_favorite: boolean;
  last_played_at: string;
  progress_seconds: number;
  total_seconds: number;
  current_chapter: number;
  completed: boolean;
  audiobook?: any;
}

// Add audiobook to library
export async function addToLibrary(
  userEmail: string,
  audiobookId: string,
  isFavorite: boolean = false
) {
  try {
    const { data, error } = await supabase
      .from("user_library")
      .upsert(
        {
          user_email: userEmail,
          audiobook_id: audiobookId,
          is_favorite: isFavorite,
          last_played_at: new Date().toISOString(),
        },
        {
          onConflict: "user_email,audiobook_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error adding to library:", error);
    return { success: false, error: error.message };
  }
}

// Remove audiobook from library
export async function removeFromLibrary(
  userEmail: string,
  audiobookId: string
) {
  try {
    const { error } = await supabase
      .from("user_library")
      .delete()
      .eq("user_email", userEmail)
      .eq("audiobook_id", audiobookId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error removing from library:", error);
    return { success: false, error: error.message };
  }
}

// Toggle favorite status
export async function toggleFavorite(
  userEmail: string,
  audiobookId: string,
  isFavorite: boolean
) {
  try {
    const { data, error } = await supabase
      .from("user_library")
      .update({ is_favorite: isFavorite })
      .eq("user_email", userEmail)
      .eq("audiobook_id", audiobookId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: error.message };
  }
}

// Update progress
export async function updateProgress(
  userEmail: string,
  audiobookId: string,
  progressSeconds: number,
  totalSeconds: number,
  currentChapter: number = 1
) {
  try {
    const completed = progressSeconds >= totalSeconds * 0.95; // 95% = completed

    const { data, error } = await supabase
      .from("user_library")
      .upsert(
        {
          user_email: userEmail,
          audiobook_id: audiobookId,
          progress_seconds: progressSeconds,
          total_seconds: totalSeconds,
          current_chapter: currentChapter,
          completed: completed,
          last_played_at: new Date().toISOString(),
        },
        {
          onConflict: "user_email,audiobook_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating progress:", error);
    return { success: false, error: error.message };
  }
}

// Get user's library with progress from user_audiobook_progress
export async function getUserLibrary(
  userEmail: string,
  filter?: "all" | "favorites" | "in-progress" | "completed"
) {
  try {
    // Get user's profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (!profile) {
      return { success: false, error: "User not found", data: [] };
    }

    // Get library items
    let libraryQuery = supabase
      .from("user_library")
      .select("*")
      .eq("user_email", userEmail)
      .order("last_played_at", { ascending: false });

    const { data: libraryData, error: libraryError } = await libraryQuery;
    if (libraryError) throw libraryError;

    // Get progress data from user_audiobook_progress
    const { data: progressData } = await supabase
      .from("user_audiobook_progress")
      .select("*")
      .eq("user_id", profile.id);

    // Get audiobook details
    const audiobookIds = libraryData.map((item) => item.audiobook_id);
    const { data: audiobooks } = await supabase
      .from("audiobooks")
      .select("*")
      .in("id", audiobookIds);

    // Merge data
    const mergedData = libraryData.map((libItem) => {
      const progress = progressData?.find(
        (p) => p.audiobook_id === libItem.audiobook_id
      );
      const audiobook = audiobooks?.find(
        (a) => a.id.toString() === libItem.audiobook_id
      );

      return {
        ...libItem,
        // Use progress from user_audiobook_progress if available
        progress_seconds:
          progress?.current_time_seconds || libItem.progress_seconds || 0,
        completed: progress?.completed || libItem.completed || false,
        last_played_at: progress?.last_listened_at || libItem.last_played_at,
        total_seconds:
          audiobook?.duration_seconds || libItem.total_seconds || 0,
        audiobook: audiobook,
      };
    });

    // Apply filters
    let filteredData = mergedData;
    if (filter === "favorites") {
      filteredData = mergedData.filter((item) => item.is_favorite);
    } else if (filter === "in-progress") {
      filteredData = mergedData.filter(
        (item) => !item.completed && item.progress_seconds > 0
      );
    } else if (filter === "completed") {
      filteredData = mergedData.filter((item) => item.completed);
    }

    return { success: true, data: filteredData as LibraryItem[] };
  } catch (error: any) {
    console.error("Error fetching library:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// Check if audiobook is in library
export async function isInLibrary(userEmail: string, audiobookId: string) {
  try {
    const { data, error } = await supabase
      .from("user_library")
      .select("id, is_favorite")
      .eq("user_email", userEmail)
      .eq("audiobook_id", audiobookId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return {
      inLibrary: !!data,
      isFavorite: data?.is_favorite || false,
    };
  } catch (error: any) {
    console.error("Error checking library:", error);
    return { inLibrary: false, isFavorite: false };
  }
}

// Get library statistics with progress data
export async function getLibraryStats(userEmail: string) {
  try {
    // Get user's profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (!profile) {
      return {
        success: false,
        stats: { total: 0, favorites: 0, inProgress: 0, completed: 0 },
      };
    }

    // Get library data
    const { data: libraryData, error: libraryError } = await supabase
      .from("user_library")
      .select("*")
      .eq("user_email", userEmail);

    if (libraryError) throw libraryError;

    // Get ALL progress data
    const { data: progressData } = await supabase
      .from("user_audiobook_progress")
      .select("*")
      .eq("user_id", profile.id);

    // Merge library and progress data
    const mergedData =
      libraryData?.map((libItem) => {
        const progress = progressData?.find(
          (p) => p.audiobook_id === libItem.audiobook_id
        );
        return {
          ...libItem,
          current_time_seconds: progress?.current_time_seconds || 0,
          completed: progress?.completed || libItem.completed || false,
        };
      }) || [];

    const stats = {
      total: mergedData.length,
      favorites: mergedData.filter((item) => item.is_favorite).length,
      inProgress: mergedData.filter(
        (item) => !item.completed && item.current_time_seconds > 0
      ).length,
      completed: mergedData.filter((item) => item.completed).length,
    };

    console.log("📊 Library Stats:", stats);
    console.log("📚 Merged Data:", mergedData);

    return { success: true, stats };
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return {
      success: false,
      stats: { total: 0, favorites: 0, inProgress: 0, completed: 0 },
    };
  }
}
