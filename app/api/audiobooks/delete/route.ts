import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    // SECURITY CHECK: Verify admin is authenticated
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session");

    if (!sessionToken || !sessionToken.value) {
      console.warn("⚠️ Unauthorized delete attempt - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const audiobookId = searchParams.get("id");

    if (!audiobookId) {
      return NextResponse.json(
        { error: "Audiobook ID is required" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Admin deleting audiobook: ${audiobookId}`);

    // Delete voices
    await supabase
      .from("audiobook_voices")
      .delete()
      .eq("audiobook_id", audiobookId);

    // Delete chapters
    await supabase
      .from("audiobook_chapters")
      .delete()
      .eq("audiobook_id", audiobookId);

    // Delete audiobook
    const { error: audiobookError } = await supabase
      .from("audiobooks")
      .delete()
      .eq("id", audiobookId);

    if (audiobookError) {
      throw audiobookError;
    }

    console.log("✅ Audiobook deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Audiobook deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting audiobook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
