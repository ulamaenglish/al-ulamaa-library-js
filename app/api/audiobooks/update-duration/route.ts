import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audiobookId, duration, durationSeconds, chapterCount } = body;

    console.log("Updating audiobook duration...");
    console.log("Duration:", duration, "Seconds:", durationSeconds);

    // Update audiobook duration
    const { error: updateError } = await supabase
      .from("audiobooks")
      .update({
        duration: duration,
        duration_seconds: durationSeconds,
      })
      .eq("id", audiobookId);

    if (updateError) {
      console.error("Error updating duration:", updateError);
      throw updateError;
    }

    // Update chapter timestamps
    const { data: chapters, error: chaptersError } = await supabase
      .from("audiobook_chapters")
      .select("*")
      .eq("audiobook_id", audiobookId)
      .order("chapter_order", { ascending: true });

    if (!chaptersError && chapters && chapters.length > 0) {
      const secondsPerChapter = durationSeconds / chapters.length;

      const updates = chapters.map((chapter, index) => {
        const startSeconds = Math.floor(index * secondsPerChapter);
        const hours = Math.floor(startSeconds / 3600);
        const minutes = Math.floor((startSeconds % 3600) / 60);
        const secs = startSeconds % 60;

        const startTime =
          hours > 0
            ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`
            : `${minutes}:${secs.toString().padStart(2, "0")}`;

        return {
          id: chapter.id,
          start_time: startTime,
          start_seconds: startSeconds,
        };
      });

      // Update each chapter
      for (const update of updates) {
        await supabase
          .from("audiobook_chapters")
          .update({
            start_time: update.start_time,
            start_seconds: update.start_seconds,
          })
          .eq("id", update.id);
      }

      console.log("✅ Chapter timestamps updated successfully!");
    }

    return NextResponse.json({
      success: true,
      message: "Duration and chapters updated",
    });
  } catch (error: any) {
    console.error("Error updating duration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update duration" },
      { status: 500 }
    );
  }
}
