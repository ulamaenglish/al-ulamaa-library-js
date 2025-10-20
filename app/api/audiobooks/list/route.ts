import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching audiobooks from database...");

    // Get all audiobooks
    const { data: audiobooks, error: audiobooksError } = await supabase
      .from("audiobooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (audiobooksError) {
      console.error("Error fetching audiobooks:", audiobooksError);
      throw audiobooksError;
    }

    console.log(`Found ${audiobooks?.length || 0} audiobooks`);

    // Get voices for each audiobook
    const audiobooksWithVoices = await Promise.all(
      (audiobooks || []).map(async (audiobook) => {
        const { data: voices } = await supabase
          .from("audiobook_voices")
          .select("*")
          .eq("audiobook_id", audiobook.id);

        return {
          ...audiobook,
          voices: voices || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      audiobooks: audiobooksWithVoices,
    });
  } catch (error: any) {
    console.error("Error in list route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audiobooks" },
      { status: 500 }
    );
  }
}
