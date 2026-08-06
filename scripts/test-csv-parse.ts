/**
 * Test script: validates CSV header mapping and field parsing
 * without needing a browser, auth, or Supabase connection.
 *
 * Run: npx tsx scripts/test-csv-parse.ts
 */

// ── Mirrors process-spreadsheet.ts logic exactly ──────────────────────────────

type SpreadsheetField =
    | "name" | "email" | "phone" | "experience" | "location"
    | "willRelocate" | "skills" | "resumeUrl" | "role"
    | "qualification" | "currentCtc" | "expectedCtc"
    | "noticePeriod" | "formSubmittedAt" | "notes";

const COLUMN_MAP: Record<string, SpreadsheetField> = {};

const ALIASES: [string[], SpreadsheetField][] = [
    [["name", "candidate name", "full name", "candidate", "name of candidate"], "name"],
    [["email", "email address", "e-mail", "mail", "email id"], "email"],
    [["phone", "phone number", "mobile", "contact", "contact number", "mobile number", "whatsapp number"], "phone"],
    [["experience", "exp", "years of experience", "total experience", "yrs", "years", "work experience", "how many years of experience do you have"], "experience"],
    [["location", "city", "address", "current location", "place", "where are you currently based out of", "what is your current location", "what is your location"], "location"],
    [["are you open to relocate", "open to relocate", "willing to relocate", "relocate", "relocation", "will relocate", "are you open to relocate to mumbai", "open to relocation"], "willRelocate"],
    [["skills", "skill", "key skills", "skillset", "skill set", "technologies"], "skills"],
    [["resume url", "resume link", "resume", "cv link", "cv url", "drive link", "google drive link", "link", "submit your resume", "upload resume"], "resumeUrl"],
    [["role", "job title", "designation", "title", "current role", "applying for"], "role"],
    [["qualification", "education", "degree", "highest qualification", "what is your qualification"], "qualification"],
    [["current ctc", "current ctc in lpa", "what is your current ctc", "what is your current ctc in lpa", "ctc", "current salary", "present ctc"], "currentCtc"],
    [["expected ctc", "expected ctc in lpa", "what is your expected ctc", "what is your expected ctc in lpa", "expected salary", "salary expectation"], "expectedCtc"],
    [["how soon can you join us", "notice period", "joining timeline", "when can you join", "availability", "how soon can you join", "joining date"], "noticePeriod"],
    [["timestamp", "form submitted at", "submission time", "submitted at", "date of submission"], "formSubmittedAt"],
    [["notes", "column 1", "additional notes", "comments", "remarks", "extra info"], "notes"],
];

for (const [aliases, key] of ALIASES) {
    for (const alias of aliases) {
        COLUMN_MAP[alias] = key;
    }
}

function normalizeHeader(raw: string): string {
    return raw.trim().toLowerCase()
        .replace(/[_\-*#?.,()!]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeCTC(raw: string): number | null {
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) return null;
    if (val > 1000) return parseFloat((val / 100000).toFixed(2));
    return parseFloat(val.toFixed(2));
}

function parseRelocate(raw: string): boolean {
    const n = raw.trim().toLowerCase();
    return n === "yes" || n === "true" || n === "1" || n === "y";
}

// ── DPC CSV data (from HR team sheet) ────────────────────────────────────────

const CSV_HEADERS = [
    "Timestamp",
    "Full Name",
    "Email",
    "Phone number",
    "What is your Qualification?",
    "Where are you currently Based out of?",
    "Are you open to relocate to Mumbai?",
    "What is your Current CTC?",
    "What is your Expected CTC?",
    "How Many Years of Experience do you have?",
    "How soon can you join us?",
    "I have read, understood, and agreed to the Privacy Policy and Consent Notice.",
    "Submit your resume",
    "Column 1",
];

const CSV_SAMPLE_ROWS = [
    ["02/05/2026 00:45:51", "Satya Shrish", "Shrishsatya@gmail.com", "7763996414", "Law", "Delhi", "Yes", "200000", "600000", "1", "15 Days", "Yes", "https://drive.google.com/open?id=1liNp5srwCOJMKJ6m_o-xQHpOyZ9O_cEL", ""],
    ["02/05/2026 00:48:36", "Divyanshu Pandey", "divyanshu593c@gmail.com", "6387266044", "Other", "Noida", "Yes", "5.2", "10.55", "1.5", "45 Days", "Yes", "https://drive.google.com/open?id=1oglWf7YvEzfz7OVlOK09Q-JMYO095xvf", ""],
    ["02/05/2026 10:10:01", "Vrinda Malpani", "vrindamalpani02@gmail.com", "9422659042", "Law", "Mumbai (Preferred Location)", "Yes", "1350000", "1600000", "2", "30 Days", "Yes", "https://drive.google.com/open?id=1VtAV4s37nNJfNi-fDo87lJX4Zr1Oz_yh", "10.5 LPA Fixed, another offer in pipeline and is expected to join on 1st June, expecting 16 LPA"],
    ["02/05/2026 10:19:50", "Faijan Wajib", "faizankhan1931@gmail.com", "9991123355", "Law", "Delhi", "No", "800000", "1000000", "3", "15 Days", "Yes", "https://drive.google.com/open?id=1hSFvw5_Vwt1Y4MJYjV2a1FScZP55GV95", ""],
];

// ── Run tests ─────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  HEADER MAPPING TEST");
console.log("════════════════════════════════════════\n");

const columnMapping: Record<number, SpreadsheetField> = {};
let unmapped: string[] = [];

for (let i = 0; i < CSV_HEADERS.length; i++) {
    const raw = CSV_HEADERS[i];
    const normalized = normalizeHeader(raw);
    const mapped = COLUMN_MAP[normalized];
    if (mapped) {
        columnMapping[i] = mapped;
        console.log(`✅  col[${i}]  "${raw}"`);
        console.log(`         → normalized: "${normalized}"`);
        console.log(`         → field: ${mapped}\n`);
    } else {
        unmapped.push(raw);
        console.log(`⚪  col[${i}]  "${raw}" → (intentionally unmapped)\n`);
    }
}

console.log("════════════════════════════════════════");
console.log("  ROW PARSE TEST");
console.log("════════════════════════════════════════\n");

for (const row of CSV_SAMPLE_ROWS) {
    const parsed: Record<string, unknown> = {};

    for (const [colIdxStr, fieldName] of Object.entries(columnMapping)) {
        const cellValue = row[Number(colIdxStr)];
        if (!cellValue || String(cellValue).trim() === "") continue;
        const strVal = String(cellValue).trim();

        if (fieldName === "experience") {
            parsed.experience = parseFloat(strVal) || 0;
        } else if (fieldName === "currentCtc") {
            parsed.currentCtc = normalizeCTC(strVal);
        } else if (fieldName === "expectedCtc") {
            parsed.expectedCtc = normalizeCTC(strVal);
        } else if (fieldName === "willRelocate") {
            parsed.willRelocate_raw = strVal;
            parsed.will_relocate_boolean = parseRelocate(strVal);
        } else if (fieldName === "email") {
            parsed.email = strVal.toLowerCase();
        } else {
            parsed[fieldName] = strVal;
        }
    }

    console.log(`👤 ${parsed.name} (${parsed.email})`);
    console.log(JSON.stringify(parsed, null, 2));
    console.log();
}
