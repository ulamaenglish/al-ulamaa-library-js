import axios from "axios";
import FormData from "form-data";

export async function extractPDFText(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  chapters: Array<{ title: string; text: string; startPage: number }>;
}> {
  try {
    console.log("📦 Using PDFCo API for extraction...");

    const apiKey = process.env.PDFCO_API_KEY;

    if (!apiKey) {
      throw new Error("PDFCO_API_KEY not configured in .env.local");
    }

    console.log("📤 Uploading PDF to PDFCo...");

    // Step 1: Upload the file
    const formData = new FormData();
    formData.append("file", buffer, "document.pdf");

    const uploadResponse = await axios.post(
      "https://api.pdf.co/v1/file/upload",
      formData,
      {
        headers: {
          "x-api-key": apiKey,
          ...formData.getHeaders(),
        },
        timeout: 60000,
      }
    );

    if (!uploadResponse.data || uploadResponse.data.error) {
      throw new Error(uploadResponse.data?.message || "Upload failed");
    }

    const uploadedFileUrl = uploadResponse.data.url;
    console.log("✅ PDF uploaded, extracting text...");

    // Step 2: Extract text
    const extractResponse = await axios.post(
      "https://api.pdf.co/v1/pdf/convert/to/text",
      {
        url: uploadedFileUrl,
        inline: true,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    if (!extractResponse.data || extractResponse.data.error) {
      throw new Error(extractResponse.data?.message || "Extraction failed");
    }

    let extractedText = extractResponse.data.body;
    const pages = extractResponse.data.pageCount || 1;

    console.log(`✅ Raw extraction complete!`);
    console.log(`📄 Pages: ${pages}`);
    console.log(`📝 Raw characters: ${extractedText.length}`);

    // Clean the text
    extractedText = cleanPDFText(extractedText);

    console.log(`✨ Cleaned characters: ${extractedText.length}`);

    // Detect chapters with their actual titles
    const chapters = detectRealChapters(extractedText);

    console.log(`📖 Detected ${chapters.length} chapters:`);
    chapters.forEach((ch, i) => {
      console.log(`   ${i + 1}. "${ch.title}" (${ch.text.length} chars)`);
    });

    if (!extractedText || extractedText.length < 100) {
      throw new Error("PDF contains no extractable text");
    }

    return {
      text: extractedText,
      numPages: pages,
      chapters: chapters,
    };
  } catch (error: any) {
    console.error("💥 PDF extraction error:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

function cleanPDFText(text: string): string {
  console.log("🧹 Cleaning extracted text...");

  let cleaned = text;

  // Remove URLs (http, https, www)
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  cleaned = cleaned.replace(/www\.[^\s]+/g, "");

  // Remove email addresses
  cleaned = cleaned.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "");

  // Remove page numbers (standalone numbers)
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, "");

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Remove common header/footer patterns
  cleaned = cleaned.replace(/Page \d+ of \d+/gi, "");
  cleaned = cleaned.replace(/©.*?All rights reserved/gi, "");

  return cleaned.trim();
}

function detectRealChapters(
  text: string
): Array<{ title: string; text: string; startPage: number }> {
  console.log("🔍 Detecting chapters with real titles...");

  const chapters: Array<{ title: string; text: string; startPage: number }> =
    [];

  // Multiple patterns to detect chapter headings
  const patterns = [
    // "Chapter 1: Title", "CHAPTER 1: Title"
    /(?:Chapter|CHAPTER)\s+(\d+)[:\s-]+([^\n]{5,100})/g,
    // "1. Title" (when title starts with capital)
    /^(\d+)\.\s+([A-Z][^\n]{10,100})$/gm,
    // "Part 1: Title", "PART 1: Title"
    /(?:Part|PART)\s+(\d+)[:\s-]+([^\n]{5,100})/g,
    // Just number and capital title
    /^(\d+)\s+([A-Z][A-Z\s]{5,100})$/gm,
  ];

  let allMatches: Array<{ index: number; title: string; number: string }> = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const chapterNumber = match[1] || "";
      const chapterTitle = match[2] || match[0];

      allMatches.push({
        index: match.index,
        title: `Chapter ${chapterNumber}: ${chapterTitle.trim()}`,
        number: chapterNumber,
      });
    }
  }

  // Remove duplicates and sort by position
  allMatches = allMatches
    .filter(
      (match, index, self) =>
        index === self.findIndex((m) => m.index === match.index)
    )
    .sort((a, b) => a.index - b.index);

  if (allMatches.length >= 2) {
    // Split text by chapters
    for (let i = 0; i < allMatches.length; i++) {
      const currentMatch = allMatches[i];
      const nextMatch = allMatches[i + 1];

      const startIndex = currentMatch.index;
      const endIndex = nextMatch ? nextMatch.index : text.length;

      const chapterText = text.substring(startIndex, endIndex).trim();

      chapters.push({
        title: currentMatch.title,
        text: chapterText,
        startPage: i + 1,
      });
    }

    console.log(`✅ Found ${chapters.length} chapters with real titles`);
  } else {
    // Fallback: Look for "Introduction" and "Conclusion"
    console.log(
      "⚠️ No clear chapter markers, looking for Introduction/Conclusion..."
    );

    const introMatch = text.match(
      /(?:Introduction|INTRODUCTION)([^\n]{0,100})/i
    );
    const conclusionMatch = text.match(
      /(?:Conclusion|CONCLUSION)([^\n]{0,100})/i
    );

    if (introMatch && conclusionMatch) {
      const introStart = introMatch.index || 0;
      const conclusionStart = conclusionMatch.index || text.length;
      const midPoint = Math.floor((introStart + conclusionStart) / 2);

      chapters.push({
        title: "Introduction",
        text: text.substring(introStart, midPoint).trim(),
        startPage: 1,
      });

      chapters.push({
        title: "Main Content",
        text: text.substring(midPoint, conclusionStart).trim(),
        startPage: 2,
      });

      chapters.push({
        title: "Conclusion",
        text: text.substring(conclusionStart).trim(),
        startPage: 3,
      });
    } else {
      // Last resort: split into equal parts
      console.log("⚠️ No structure found, dividing into 5 parts");
      const chunkSize = Math.ceil(text.length / 5);

      for (let i = 0; i < 5; i++) {
        chapters.push({
          title: `Part ${i + 1}`,
          text: text.substring(i * chunkSize, (i + 1) * chunkSize).trim(),
          startPage: i + 1,
        });
      }
    }
  }

  return chapters;
}
