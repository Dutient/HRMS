"use server";

import * as XLSX from "xlsx";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { uploadResumesAndCreateCandidates } from "./bulk-upload-resumes";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SpreadsheetRow {
    name?: string;
    email?: string;
    phone?: string;
    experience?: number;
    location?: string;
    skills?: string;
    resumeUrl?: string;
    role?: string;
}

export interface ParseResult {
    success: boolean;
    message?: string;
    rows: SpreadsheetRow[];
    total: number;
}

export interface RowProcessResult {
    success: boolean;
    message: string;
    candidateName?: string;
}

// ── Column Mapping (fuzzy) ───────────────────────────────────────────────────

const COLUMN_MAP: Record<string, keyof SpreadsheetRow> = {};

const ALIASES: [string[], keyof SpreadsheetRow][] = [
    [["name", "candidate name", "full name", "candidate"], "name"],
    [["email", "email address", "e-mail", "mail", "email id"], "email"],
    [["phone", "phone number", "mobile", "contact", "contact number", "mobile number"], "phone"],
    [["experience", "exp", "years of experience", "total experience", "yrs", "years", "work experience"], "experience"],
    [["location", "city", "address", "current location", "place"], "location"],
    [["skills", "skill", "key skills", "skillset", "skill set", "technologies"], "skills"],
    [["resume url", "resume link", "resume", "cv link", "cv url", "drive link", "google drive link", "link"], "resumeUrl"],
    [["role", "position", "job title", "designation", "title", "current role"], "role"],
];

for (const [aliases, key] of ALIASES) {
    for (const alias of aliases) {
        COLUMN_MAP[alias] = key;
    }
}

function normalizeHeader(raw: string): string {
    return raw.trim().toLowerCase().replace(/[_\-*#]/g, " ").replace(/\s+/g, " ");
}

function mapHeaders(headers: string[]): Record<number, keyof SpreadsheetRow> {
    const mapping: Record<number, keyof SpreadsheetRow> = {};
    for (let i = 0; i < headers.length; i++) {
        const normalized = normalizeHeader(headers[i]);
        if (COLUMN_MAP[normalized]) {
            mapping[i] = COLUMN_MAP[normalized];
        }
    }
    return mapping;
}

// ── Action 1: Parse Spreadsheet (Fast, only reads data) ──────────────────────

export async function parseSpreadsheet(formData: FormData): Promise<ParseResult> {
    const file = formData.get("file") as File;
    if (!file) return { success: false, message: "No file provided", rows: [], total: 0 };

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawRows.length < 2) {
            return { success: false, message: "Sheet is empty", rows: [], total: 0 };
        }

        const headerRow = rawRows[0].map(String);
        const columnMapping = mapHeaders(headerRow);
        const mappedKeys = Object.values(columnMapping);

        if (!mappedKeys.includes("name") && !mappedKeys.includes("email")) {
            return { success: false, message: "Could not find 'Name' or 'Email' column", rows: [], total: 0 };
        }

        const dataRows = rawRows.slice(1).filter((row) => row.some((cell) => cell !== undefined && cell !== ""));
        const parsedRows: SpreadsheetRow[] = [];

        for (const row of dataRows) {
            const parsed: SpreadsheetRow = {};
            for (const [colIdx, fieldName] of Object.entries(columnMapping)) {
                const cellValue = row[Number(colIdx)];
                if (cellValue === undefined || cellValue === null || String(cellValue).trim() === "") continue;

                if (fieldName === "experience") {
                    parsed.experience = parseFloat(String(cellValue)) || 0;
                } else if (fieldName === "skills") {
                    parsed.skills = String(cellValue);
                } else {
                    (parsed as Record<string, unknown>)[fieldName] = String(cellValue).trim();
                }
            }
            if (parsed.name || parsed.email) {
                parsedRows.push(parsed);
            }
        }

        return { success: true, rows: parsedRows, total: parsedRows.length };
    } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Parse error", rows: [], total: 0 };
    }
}

// ── Action 2: Process Single Row (Transactional, Rate-Limit Safe) ─────────────

export async function processSingleRow(
    row: SpreadsheetRow,
    metadata?: { position?: string; job_opening?: string; domain?: string }
): Promise<RowProcessResult> {
    if (!isSupabaseConfigured || !supabase) {
        return { success: false, message: "Supabase not configured" };
    }

    const displayName = row.name || row.email || "Unknown Candidate";

    try {
        // Path A: Resume URL present → Download & AI Extract
        if (row.resumeUrl) {
            const pdfResponse = await fetch(row.resumeUrl);
            if (!pdfResponse.ok) throw new Error(`Resume download failed (HTTP ${pdfResponse.status})`);

            const blob = await pdfResponse.blob();
            const fileName = `${row.name || "resume"}.pdf`.replace(/[^a-zA-Z0-9.-]/g, "_");
            const pdfFile = new File([blob], fileName, { type: "application/pdf" });

            const uploadFormData = new FormData();
            uploadFormData.append("file", pdfFile);

            const uploadResult = await uploadResumesAndCreateCandidates(uploadFormData, {
                position: metadata?.position,
                job_opening: metadata?.job_opening,
                domain: metadata?.domain,
                source_url: row.resumeUrl,
            });

            if (uploadResult.success && uploadResult.candidateName) {
                // Merge spreadsheet data overrides
                const updateFields: Record<string, unknown> = {};
                if (row.name) updateFields.name = row.name;
                if (row.email) updateFields.email = row.email;
                if (row.phone) updateFields.phone = row.phone;
                if (row.location) updateFields.location = row.location;
                if (row.experience) updateFields.experience = row.experience;
                if (row.role) updateFields.role = row.role;
                if (row.skills) updateFields.skills = row.skills.split(/[,;|]/).map(s => s.trim()).filter(Boolean);

                if (Object.keys(updateFields).length > 0) {
                    await supabase.from("candidates").update(updateFields).eq("name", uploadResult.candidateName);
                }
                return { success: true, message: "Imported with resume", candidateName: uploadResult.candidateName };
            } else {
                return { success: false, message: uploadResult.message || "Upload failed" };
            }
        }

        // Path B: Direct Insert
        const skillsArray = row.skills ? row.skills.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : [];
        const { error } = await supabase.from("candidates").insert({
            name: row.name || "Unknown",
            email: row.email || null,
            phone: row.phone || null,
            experience: row.experience || null,
            location: row.location || null,
            role: row.role || metadata?.position || "General Application",
            skills: skillsArray.length > 0 ? skillsArray : null,
            status: "New",
            source: "Spreadsheet Import",
            applied_date: new Date().toISOString().split("T")[0],
            position: metadata?.position || null,
            job_opening: metadata?.job_opening || null,
            domain: metadata?.domain || null,
        });

        if (error) throw new Error(error.message);
        revalidatePath("/candidates");

        return { success: true, message: "Imported directly", candidateName: displayName };

    } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Process error" };
    }
}
