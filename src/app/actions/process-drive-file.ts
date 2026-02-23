"use server";

/**
 * Server Action: Download a file from Google Drive using the user's
 * short-lived access token, then pipe it through the existing resume
 * extraction pipeline.
 *
 * Security: The access token arrives per-request from the client.
 *           It is never stored server-side.
 */

import { uploadResumesAndCreateCandidates } from "@/app/actions/bulk-upload-resumes";

interface DriveFileMeta {
    id: string;
    name: string;
    mimeType: string;
    url: string; // webViewLink
}

interface ProcessDriveResult {
    success: boolean;
    message: string;
    candidateName?: string;
}

/**
 * Downloads a file from Google Drive via the Drive v3 REST API and passes it
 * to our standard resume extraction pipeline.
 *
 * For Google Sheets / Google Docs (native Google formats), we use the
 * `export` endpoint to convert to PDF first.
 */
export async function processDriveFile(
    file: DriveFileMeta,
    accessToken: string,
    metadata?: { position?: string; job_opening?: string; domain?: string }
): Promise<ProcessDriveResult> {
    try {
        console.log(`[processDriveFile] Processing file: ${file.name} (ID: ${file.id}, Type: ${file.mimeType})`);

        let downloadUrl: string;
        let fileName = file.name;

        // Google-native formats need the export endpoint
        if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
            // Export Sheet as PDF
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
            fileName = file.name.replace(/\.[^.]+$/, "") + ".pdf";
            console.log("[processDriveFile] Exporting Google Sheet to PDF...");
        } else if (file.mimeType === "application/vnd.google-apps.document") {
            // Export Doc as PDF
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
            fileName = file.name.replace(/\.[^.]+$/, "") + ".pdf";
            console.log("[processDriveFile] Exporting Google Doc to PDF...");
        } else {
            // Standard binary download (PDF, DOCX, etc.)
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
            console.log("[processDriveFile] Downloading standard file...");
        }

        console.log(`[processDriveFile] Fetching from Google: ${downloadUrl.split('?')[0]}`);
        const response = await fetch(downloadUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[processDriveFile] Google Drive API error (${response.status}):`, errorText);
            return {
                success: false,
                message: `Failed to download from Drive: ${response.status} ${response.statusText}`,
            };
        }

        console.log("[processDriveFile] Download successful, converting to buffer...");
        // Convert response to a File-like object for our existing pipeline
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });

        // Build FormData to match the existing Server Action signature
        const formData = new FormData();
        formData.append("file", blob, fileName);

        // Reuse the existing extraction pipeline
        const result = await uploadResumesAndCreateCandidates(formData, {
            ...metadata,
            source_url: file.url, // store Drive link as source
        });

        return {
            success: result.success,
            message: result.message ?? "Processed successfully",
            candidateName: result.candidateName,
        };
    } catch (error) {
        console.error("processDriveFile error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error processing Drive file",
        };
    }
}
