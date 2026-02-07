"use server";

/**
 * Extract text from Job Description file (PDF, DOCX, or TXT)
 */
export async function parseJobDescription(file: File): Promise<{
  success: boolean;
  text?: string;
  message?: string;
}> {
  try {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const validExtensions = [".pdf", ".docx", ".txt"];

    const hasValidType = validTypes.includes(fileType);
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      return {
        success: false,
        message: "Invalid file type. Only PDF, DOCX, and TXT files are supported",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    let jdText: string;

    if (fileName.endsWith(".pdf")) {
      jdText = await extractTextFromPDF(buffer);
    } else if (fileName.endsWith(".docx")) {
      jdText = await extractTextFromDOCX(buffer);
    } else if (fileName.endsWith(".txt")) {
      jdText = buffer.toString("utf-8");
    } else {
      return {
        success: false,
        message: "Unsupported file format",
      };
    }

    // Check if text was extracted
    if (!jdText || jdText.trim().length < 50) {
      return {
        success: false,
        message: "Could not extract enough text from the file",
      };
    }

    return {
      success: true,
      text: jdText,
    };
  } catch (error) {
    console.error("Error parsing job description:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to parse file",
    };
  }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-expect-error - pdf-parse is a CommonJS module
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.default.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}
