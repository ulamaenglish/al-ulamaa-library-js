import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY CHECK: Verify admin is authenticated
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session");

    if (!sessionToken || !sessionToken.value) {
      console.warn("⚠️ Unauthorized save attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      audiobookId,
      title,
      titleArabic,
      author,
      authorArabic,
      description,
      category,
      language,
      premium,
      duration,
      durationSeconds,
      chapters,
    } = body;

    console.log("Saving audiobook to database...");
    console.log("Title:", title);
    console.log("Author:", author);
    console.log("Duration seconds:", durationSeconds);

    // Validate required fields
    if (!audiobookId || !title || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert audiobook into database
    const { data: audiobookData, error: audiobookError } = await supabase
      .from("audiobooks")
      .insert({
        id: audiobookId,
        title,
        title_arabic: titleArabic || null,
        author,
        author_arabic: authorArabic || null,
        description: description || null,
        category,
        language,
        premium: premium || false,
        duration,
        duration_seconds: durationSeconds,
      })
      .select()
      .single();

    if (audiobookError) {
      console.error("Error inserting audiobook:", audiobookError);
      throw new Error(audiobookError.message);
    }

    console.log("Audiobook saved with ID:", audiobookData.id);

    // Insert chapters if provided
    if (chapters && chapters.length > 0) {
      console.log(`Inserting ${chapters.length} chapters...`);

      // Calculate chapter times based on equal distribution of duration
      const totalSeconds = durationSeconds || 0;
      const secondsPerChapter =
        totalSeconds > 0 ? totalSeconds / chapters.length : 0;

      const chaptersToInsert = chapters.map((chapter: any, index: number) => {
        // Calculate start time for this chapter
        const startSeconds = Math.floor(index * secondsPerChapter);

        // Format as HH:MM:SS or MM:SS
        const hours = Math.floor(startSeconds / 3600);
        const minutes = Math.floor((startSeconds % 3600) / 60);
        const secs = startSeconds % 60;

        const startTime =
          hours > 0
            ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`
            : `${minutes}:${secs.toString().padStart(2, "0")}`;

        console.log(
          `Chapter ${index + 1}: ${
            chapter.title
          } starts at ${startTime} (${startSeconds}s)`
        );

        return {
          audiobook_id: audiobookData.id,
          title: chapter.title,
          chapter_order: chapter.chapterOrder,
          start_time: startTime,
          start_seconds: startSeconds,
        };
      });

      const { error: chaptersError } = await supabase
        .from("audiobook_chapters")
        .insert(chaptersToInsert);

      if (chaptersError) {
        console.error("Error inserting chapters:", chaptersError);
        // Don't fail the whole request if chapters fail
        console.warn("Chapters failed to insert, but audiobook was saved");
      } else {
        console.log("Chapters saved successfully with calculated timestamps!");
      }
    }

    return NextResponse.json({
      success: true,
      audiobookId: audiobookData.id,
      message: "Audiobook saved successfully!",
    });
  } catch (error: any) {
    console.error("Error in save route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save audiobook" },
      { status: 500 }
    );
  }
}
