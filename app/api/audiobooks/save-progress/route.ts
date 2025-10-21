import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      user_email,
      audiobook_id,
      voice_id,
      current_time_seconds,
      completed,
    } = await request.json();

    // Get user_id from profiles table using email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    if (profileError || !profile) {
      console.error("Error finding user:", profileError);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Upsert progress (insert or update)
    const { error } = await supabase.from("user_audiobook_progress").upsert(
      {
        user_id: profile.id,
        audiobook_id,
        voice_id,
        current_time_seconds,
        completed,
        last_listened_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,audiobook_id",
      }
    );

    if (error) {
      console.error("Error saving progress:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in save-progress API:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
