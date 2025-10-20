export async function extractFromTextFile(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  chapters: Array<{ title: string; text: string; startPage: number }>;
  title?: string;
  author?: string;
}> {
  try {
    console.log("📝 Extracting from .txt file...");

    // Convert buffer to string
    const fullText = buffer.toString("utf-8");

    // Extract title and author if provided
    let title = undefined;
    let author = undefined;
    let mainText = fullText;

    const titleMatch = fullText.match(/^TITLE:\s*(.+)$/m);
    const authorMatch = fullText.match(/^AUTHOR:\s*(.+)$/m);

    if (titleMatch) {
      title = titleMatch[1].trim();
      console.log("📖 Found title:", title);
    }

    if (authorMatch) {
      author = authorMatch[1].trim();
      console.log("✍️ Found author:", author);
    }

    // Clean up title/author lines from main text
    mainText = mainText
      .replace(/^TITLE:.*$/m, "")
      .replace(/^AUTHOR:.*$/m, "")
      .trim();

    // Extract chapters
    const chapters = extractChaptersFromText(mainText);

    console.log(`✅ Extracted ${chapters.length} chapters`);
    chapters.forEach((ch, i) => {
      console.log(
        `   ${i + 1}. "${ch.title}" (${ch.text.split(/\s+/).length} words)`
      );
    });

    // Combine all text
    const allText = chapters.map((ch) => ch.text).join("\n\n");

    // Calculate approximate pages (500 words per page)
    const wordCount = allText.split(/\s+/).length;
    const numPages = Math.ceil(wordCount / 500);

    return {
      text: allText,
      numPages: numPages,
      chapters: chapters,
      title: title,
      author: author,
    };
  } catch (error: any) {
    console.error("💥 Text extraction error:", error.message);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

function extractChaptersFromText(
  text: string
): Array<{ title: string; text: string; startPage: number }> {
  const chapters: Array<{ title: string; text: string; startPage: number }> =
    [];

  // Split by CHAPTER_START markers
  const chapterBlocks = text.split(/CHAPTER_START/);

  let chapterNumber = 0;

  for (const block of chapterBlocks) {
    if (!block.trim()) continue;

    // Check for CHAPTER_CONTENT marker
    const parts = block.split(/CHAPTER_CONTENT/);

    if (parts.length === 2) {
      // We have a proper chapter
      const chapterTitle = parts[0].trim();
      let chapterContent = parts[1].trim();

      // Remove CHAPTER_END marker if present
      chapterContent = chapterContent.replace(/CHAPTER_END/, "").trim();

      chapterNumber++;

      chapters.push({
        title: chapterTitle || `Chapter ${chapterNumber}`,
        text: chapterContent,
        startPage: chapterNumber,
      });
    }
  }

  // Look for INTRODUCTION
  const introMatch = text.match(
    /INTRODUCTION\s+([\s\S]*?)(?=CHAPTER_START|CONCLUSION|$)/
  );
  if (introMatch) {
    chapters.unshift({
      title: "Introduction",
      text: introMatch[1].trim(),
      startPage: 0,
    });
  }

  // Look for CONCLUSION
  const conclusionMatch = text.match(/CONCLUSION\s+([\s\S]*?)$/);
  if (conclusionMatch) {
    chapters.push({
      title: "Conclusion",
      text: conclusionMatch[1].trim(),
      startPage: chapters.length + 1,
    });
  }

  return chapters;
}
