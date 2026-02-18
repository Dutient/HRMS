"use server";

import { extractTextFromPDF, extractTextFromDOCX } from "./process-resume";

export async function parseJobDescription(formData: FormData): Promise<{ success: boolean; text?: string; message?: string }> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, message: "No file provided" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name.toLowerCase();

        let text = "";
        if (fileName.endsWith(".pdf")) {
            text = await extractTextFromPDF(buffer);
        } else if (fileName.endsWith(".docx")) {
            text = await extractTextFromDOCX(buffer);
        } else if (fileName.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            return { success: false, message: "Unsupported file type. Please upload PDF, DOCX, or TXT." };
        }

        // Sanitize basic null bytes just in case, though usually not an issue for JD display
        // eslint-disable-next-line no-control-regex
        text = text.replace(/\u0000/g, "");

        if (!text.trim()) {
            return { success: false, message: "Could not extract text from file." };
        }

        return { success: true, text };
    } catch (error) {
        console.error("Error parsing JD:", error);
        return { success: false, message: "Failed to parse file." };
    }
}
