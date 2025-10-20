import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractPDFText } from "@/lib/serverPdfExtractor";
import { extractFromTextFile } from "@/lib/textExtractor";
import { cookies } from "next/headers";
import { uploadRateLimit } from "@/lib/ratelimit";

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
      console.warn("⚠️ Unauthorized upload attempt - No session");
      return NextResponse.json(
        { error: "Unauthorized. Please login as admin." },
        { status: 403 }
      );
    }
    // 🛡️ RATE LIMITING: Check upload attempts
    const ip = request.headers.get("x-forwarded-for") || "admin";
    const { success, limit, remaining, reset } = await uploadRateLimit.limit(
      ip
    );

    if (!success) {
      const resetTime = new Date(reset);
      console.warn(`⚠️ Upload rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: `Upload limit reached (${limit} per hour). You can upload again at ${resetTime.toLocaleTimeString()}`,
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
      `📤 Upload allowed - IP: ${ip} - Remaining: ${remaining}/${limit}`
    );

    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const bookDataStr = formData.get("bookData") as string;

    if (!pdfFile || !bookDataStr) {
      return NextResponse.json(
        { error: "Missing file or book data" },
        { status: 400 }
      );
    }

    // 🔒 FILE SIZE CHECK: Maximum 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (pdfFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit. Please use a smaller file." },
        { status: 400 }
      );
    }

    const bookData = JSON.parse(bookDataStr);

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    console.log("==========================================");
    console.log("🔍 Starting text extraction...");
    console.log(`📄 File: ${pdfFile.name}`);
    console.log(`📦 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log("==========================================");

    // Check file type
    const fileExtension = pdfFile.name.toLowerCase().split(".").pop();
    let extractedText: string;
    let numPages: number;
    let chapters: Array<{ title: string; text: string; startPage: number }>;
    let extractedTitle: string | undefined;
    let extractedAuthor: string | undefined;

    if (fileExtension === "txt") {
      console.log("📝 Detected .txt file, using text extractor...");
      const result = await extractFromTextFile(fileBuffer);
      extractedText = result.text;
      numPages = result.numPages;
      chapters = result.chapters;
      extractedTitle = result.title;
      extractedAuthor = result.author;

      // Override book data with extracted info if available
      if (extractedTitle) {
        bookData.title = extractedTitle;
        console.log("📖 Auto-filled title from file:", extractedTitle);
      }
      if (extractedAuthor) {
        bookData.author = extractedAuthor;
        console.log("✍️ Auto-filled author from file:", extractedAuthor);
      }
    } else {
      console.log("📄 Detected .pdf file, using PDF extractor...");
      const result = await extractPDFText(fileBuffer);
      extractedText = result.text;
      numPages = result.numPages;
      chapters = result.chapters;
    }

    console.log(`✅ SUCCESSFULLY EXTRACTED TEXT!`);
    console.log(`📄 Pages: ${numPages}`);
    console.log(`📝 Characters: ${extractedText.length}`);
    console.log(`📚 Words: ${extractedText.split(/\s+/).length}`);
    console.log(`📖 Chapters: ${chapters.length}`);

    // Validate extraction
    if (!extractedText || extractedText.length < 100) {
      return NextResponse.json(
        {
          error:
            "Could not extract sufficient text from file. Please check:\n- PDF is text-based (not scanned)\n- TXT file is properly formatted\n- File is not corrupted",
        },
        { status: 400 }
      );
    }

    // Clean up the text
    let cleanedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    console.log(`✨ Cleaned text: ${cleanedText.length} characters`);

    // Generate a UUID for the audiobook
    const { randomUUID } = await import("crypto");
    const audiobookId = randomUUID();

    // Generate timestamp for filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${pdfFile.name}`;
    const bucketName =
      fileExtension === "txt" ? "audiobooks-texts" : "audiobooks-pdfs";

    console.log(`☁️ Uploading file to Supabase: ${fileName}`);

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: fileExtension === "txt" ? "text/plain" : "application/pdf",
      });

    if (uploadError) {
      console.error("❌ File upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded to Supabase successfully");

    // Log chapter details
    console.log("📚 Chapter details:");
    chapters.forEach((ch, i) => {
      console.log(
        `   ${i + 1}. "${ch.title}" (${ch.text.split(/\s+/).length} words)`
      );
    });

    console.log("==========================================");
    console.log("🎉 FILE PROCESSING COMPLETE!");
    console.log("==========================================");

    return NextResponse.json({
      success: true,
      audiobookId: audiobookId,
      extractedText: cleanedText,
      chapters: chapters,
      pageCount: numPages,
      fileName: fileName,
      textLength: cleanedText.length,
      wordCount: cleanedText.split(/\s+/).length,
    });
  } catch (error: any) {
    console.error("==========================================");
    console.error("❌ ERROR PROCESSING FILE:");
    console.error(error);
    console.error("==========================================");

    return NextResponse.json(
      { error: error.message || "Failed to process file" },
      { status: 500 }
    );
  }
}
