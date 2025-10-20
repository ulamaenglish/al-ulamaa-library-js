import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("========================================");
    console.log("API Route Called!");
    console.log("Requested ID:", id);
    console.log("ID Type:", typeof id);
    console.log("========================================");

    // Get audiobook
    const { data: audiobook, error: audiobookError } = await supabase
      .from("audiobooks")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Query Result:");
    console.log("Audiobook:", audiobook);
    console.log("Error:", audiobookError);

    if (audiobookError || !audiobook) {
      console.log("❌ Audiobook not found!");
      console.log("Error details:", audiobookError);

      return NextResponse.json(
        { error: "Audiobook not found", details: audiobookError },
        { status: 404 }
      );
    }

    console.log("✅ Audiobook found!");

    // Get voices
    const { data: voices } = await supabase
      .from("audiobook_voices")
      .select("*")
      .eq("audiobook_id", id);

    console.log("Voices found:", voices?.length || 0);

    // Get chapters
    const { data: chapters } = await supabase
      .from("audiobook_chapters")
      .select("*")
      .eq("audiobook_id", id)
      .order("chapter_order", { ascending: true });

    console.log("Chapters found:", chapters?.length || 0);

    return NextResponse.json({
      success: true,
      audiobook: {
        ...audiobook,
        voices: voices || [],
        chapters: chapters || [],
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching audiobook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audiobook" },
      { status: 500 }
    );
  }
}
