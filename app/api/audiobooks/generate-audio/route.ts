import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  generateAudioWithGoogle,
  calculateDuration,
  formatDuration,
} from "@/lib/googleTTS";
import { audioGenRateLimit } from "@/lib/ratelimit";

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
      console.warn("⚠️ Unauthorized audio generation attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    // 🛡️ RATE LIMITING: Check audio generation attempts
    const ip = request.headers.get("x-forwarded-for") || "admin";
    const { success, limit, remaining, reset } = await audioGenRateLimit.limit(
      ip
    );

    if (!success) {
      const resetTime = new Date(reset);
      console.warn(`⚠️ Audio generation rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: `Audio generation limit reached (${limit} per hour). Try again at ${resetTime.toLocaleTimeString()}`,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    console.log(
      `🎙️ Audio generation allowed - IP: ${ip} - Remaining: ${remaining}/${limit}`
    );

    const { audiobookId, chapters, voiceId, voiceName, language } =
      await request.json();

    if (!audiobookId || !chapters || !voiceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("==========================================");
    console.log(`🎙️ Generating audio for ${chapters.length} chapters...`);
    console.log(`Voice: ${voiceName}`);
    console.log(`Language: ${language}`);
    console.log("==========================================");

    const languageCode = language === "arabic" ? "ar-XA" : "en-US";
    const generatedChapters = [];
    let totalDurationSeconds = 0;

    // Generate audio for each chapter
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(
        `\n📖 Processing Chapter ${i + 1}/${chapters.length}: "${
          chapter.title
        }"`
      );
      console.log(`   Words: ${chapter.text.split(/\s+/).length}`);

      try {
        // Generate audio with Google TTS
        const audioBuffer = await generateAudioWithGoogle(
          chapter.text,
          voiceId,
          languageCode
        );

        // Calculate duration
        const chapterDuration = calculateDuration(chapter.text);
        totalDurationSeconds += chapterDuration;

        // Upload to Supabase Storage
        const timestamp = Date.now();
        const audioFileName = `${audiobookId}_${voiceId}_chapter${
          i + 1
        }_${timestamp}.mp3`;

        console.log(`   ☁️ Uploading audio to Supabase...`);

        const { error: uploadError } = await supabase.storage
          .from("audiobook-audio")
          .upload(audioFileName, audioBuffer, {
            contentType: "audio/mpeg",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("audiobook-audio")
          .getPublicUrl(audioFileName);

        console.log(
          `   ✅ Chapter ${i + 1} complete - ${formatDuration(chapterDuration)}`
        );

        generatedChapters.push({
          chapterNumber: i + 1,
          chapterTitle: chapter.title,
          audioUrl: urlData.publicUrl,
          duration: formatDuration(chapterDuration),
          durationSeconds: chapterDuration,
        });
      } catch (error: any) {
        console.error(
          `   ❌ Error generating chapter ${i + 1}:`,
          error.message
        );
        throw error;
      }
    }

    console.log("\n==========================================");
    console.log(`✅ ALL CHAPTERS COMPLETE!`);
    console.log(`Total duration: ${formatDuration(totalDurationSeconds)}`);
    console.log("==========================================");

    // Save voice to database
    const { error: voiceError } = await supabase
      .from("audiobook_voices")
      .insert({
        audiobook_id: audiobookId,
        voice_id: voiceId,
        voice_name: voiceName,
        language: language,
        chapters: generatedChapters,
        total_duration: formatDuration(totalDurationSeconds),
        total_duration_seconds: totalDurationSeconds,
      });

    if (voiceError) {
      console.error("Error saving voice:", voiceError);
      throw voiceError;
    }

    return NextResponse.json({
      success: true,
      voiceId: voiceId,
      voiceName: voiceName,
      chapters: generatedChapters,
      duration: formatDuration(totalDurationSeconds),
      durationSeconds: totalDurationSeconds,
    });
  } catch (error: any) {
    console.error("==========================================");
    console.error("❌ ERROR GENERATING AUDIO:");
    console.error(error);
    console.error("==========================================");

    return NextResponse.json(
      { error: error.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
