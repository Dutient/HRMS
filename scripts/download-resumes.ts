import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import pkg from "xlsx";
const { readFile, utils } = pkg;

/**
 * UTILITY: Helper to download a file from a URL to a local destination
 */
async function downloadFile(url: string, dest: string, redirects = 0): Promise<void> {
    if (redirects > 5) throw new Error("Too many redirects");

    return new Promise((resolve, reject) => {
        // Handle Google Drive links specifically
        let finalUrl = url;
        if (finalUrl.includes("drive.google.com") && !finalUrl.includes("uc?export=download")) {
            const driveIdMatch = finalUrl.match(/\/file\/d\/([^/]+)/) || finalUrl.match(/id=([^/&]+)/);
            if (driveIdMatch && driveIdMatch[1]) {
                finalUrl = `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}&confirm=t`;
            }
        }

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(finalUrl, options, (response) => {
            const code = response.statusCode || 0;
            const contentType = response.headers['content-type'] || '';

            if (code >= 300 && code < 400 && response.headers.location) {
                const nextUrl = new URL(response.headers.location, finalUrl).toString();
                return downloadFile(nextUrl, dest, redirects + 1).then(resolve).catch(reject);
            }

            if (code !== 200) {
                return reject(new Error(`Failed to download: ${code}`));
            }

            if (contentType.includes('text/html')) {
                let htmlData = '';
                response.on('data', chunk => { htmlData += chunk; });
                response.on('end', () => {
                    const confirmMatch = htmlData.match(/confirm=([a-zA-Z0-9_-]+)/);
                    if (confirmMatch && finalUrl.includes('drive.google.com')) {
                        const baseUrl = finalUrl.split('&confirm=')[0];
                        const retryUrl = `${baseUrl}&confirm=${confirmMatch[1]}`;
                        console.log(`  ↪ Bypassing Google Drive virus warning...`);
                        return downloadFile(retryUrl, dest, redirects + 1).then(resolve).catch(reject);
                    } else {
                        const titleMatch = htmlData.match(/<title>(.*?)<\/title>/i);
                        const title = titleMatch ? titleMatch[1] : 'Unknown Page';
                        return reject(new Error(`Downloaded HTML ("${title}") instead of PDF. Ensure the link is shared with "Anyone with the link".`));
                    }
                });
                return;
            }

            const file = fs.createWriteStream(dest);
            response.pipe(file);

            file.on("finish", () => {
                file.close();
                resolve();
            });
        }).on("error", (err) => {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            reject(err);
        });
    });
}

/**
 * MAIN EXECUTION
 */
async function run() {
    const args = process.argv.slice(2);
    const spreadsheetPath = args[0];

    if (!spreadsheetPath) {
        console.error("❌ Usage: npx ts-node scripts/download-resumes.ts <path-to-spreadsheet>");
        process.exit(1);
    }

    if (!fs.existsSync(spreadsheetPath)) {
        console.error(`❌ File not found: ${spreadsheetPath}`);
        process.exit(1);
    }

    console.log(`📂 Reading spreadsheet: ${spreadsheetPath}`);

    // Create output directory
    const outputDir = path.join(process.cwd(), "downloads", "resumes");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Parse Spreadsheet
    const workbook = readFile(spreadsheetPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = utils.sheet_to_json(sheet);

    console.log(`📊 Found ${rows.length} rows. Starting downloads...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Look for common column names for Resume URLs
        const resumeUrl = row["Resume URL"] || row["resumeUrl"] || row["Resume"] || row["Link"] || row["Submit your resume"];
        const name = row["Full Name"] || row["Full name"] || row["Name"] || row["name"] || `Candidate_${i + 1}`;

        if (!resumeUrl || typeof resumeUrl !== 'string') {
            console.log(`⏩ Skipping row ${i + 1}: No Resume URL found.`);
            continue;
        }

        const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeName}_resume.pdf`;
        const dest = path.join(outputDir, fileName);

        console.log(`⏳ [${i + 1}/${rows.length}] Downloading resume for: ${name}...`);

        try {
            await downloadFile(resumeUrl, dest);
            console.log(`✅ Saved to: ${fileName}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to download for ${name}:`, err instanceof Error ? err.message : err);
            failCount++;
        }
    }

    console.log("\n--- DOWNLOAD SUMMARY ---");
    console.log(`✅ Successfully downloaded: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📂 Files are located in: ${outputDir}`);
}

run().catch(console.error);
