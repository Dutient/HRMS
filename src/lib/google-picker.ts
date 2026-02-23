/**
 * Google Picker API utility using Google Identity Services (GSI).
 *
 * Security:
 * - Uses `google.accounts.oauth2.initTokenClient` (GSI) — NOT deprecated gapi.auth.
 * - The access token is kept in-memory only; never persisted to localStorage.
 * - Token is passed exclusively to the Picker and to our server action for
 *   downloading the selected file.
 */

// ────────────────────────────────────────────────────────────────────────────────
// Environment keys — exposed via NEXT_PUBLIC_ so they are available client-side.
// ────────────────────────────────────────────────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID ?? "";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

if (!API_KEY || !CLIENT_ID) {
    console.warn("[GooglePicker] Missing essential environment variables: API_KEY or CLIENT_ID");
}

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────
export interface PickedFile {
    id: string;
    name: string;
    mimeType: string;
    url: string; // webViewLink
}

export interface PickerResult {
    files: PickedFile[];
    accessToken: string; // short-lived; needed by the server action to download
}

// ────────────────────────────────────────────────────────────────────────────────
// Script Loaders
// ────────────────────────────────────────────────────────────────────────────────
let gapiLoaded = false;
let pickerLoaded = false;

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
    });
}

async function ensureGapiLoaded(): Promise<void> {
    if (gapiLoaded) return;
    console.log("[GooglePicker] Loading gapi script...");
    await loadScript("https://apis.google.com/js/api.js");
    await new Promise<void>((resolve) =>
        (window as any).gapi.load("picker", () => {
            console.log("[GooglePicker] gapi picker loaded");
            pickerLoaded = true;
            resolve();
        })
    );
    gapiLoaded = true;
}

async function ensureGsiLoaded(): Promise<void> {
    console.log("[GooglePicker] Loading GSI script...");
    await loadScript("https://accounts.google.com/gsi/client");
    console.log("[GooglePicker] GSI script loaded");
}

// ────────────────────────────────────────────────────────────────────────────────
// Token Acquisition via GSI `initTokenClient`
// ────────────────────────────────────────────────────────────────────────────────
function requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        const google = (window as any).google;
        if (!google?.accounts?.oauth2) {
            console.error("[GooglePicker] Google Identity Services (GSI) not loaded");
            reject(new Error("Google Identity Services not loaded. This can happen if scripts are blocked or failed to load."));
            return;
        }

        console.log("[GooglePicker] Initializing token client with Client ID:", CLIENT_ID);
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPE,
            callback: (response: any) => {
                console.log("[GooglePicker] Token response received:", response);
                if (response.error) {
                    const errMsg = response.error_description || response.error;
                    console.error("[GooglePicker] OAuth Error:", errMsg);
                    reject(new Error(`OAuth Error: ${errMsg}`));
                    return;
                }
                if (!response.access_token) {
                    console.error("[GooglePicker] No access token in response");
                    reject(new Error("Failed to acquire access token from Google."));
                    return;
                }
                resolve(response.access_token as string);
            },
            error_callback: (err: any) => {
                console.error("[GooglePicker] GSI Initialization Error:", err);
                reject(new Error(`GSI Initialization Error: ${err.message || JSON.stringify(err)}`));
            }
        });

        // This opens the Google OAuth consent popup
        console.log("[GooglePicker] Requesting access token...");
        tokenClient.requestAccessToken({ prompt: "consent" });
    });
}

// ────────────────────────────────────────────────────────────────────────────────
// Picker Dialog
// ────────────────────────────────────────────────────────────────────────────────
function showPicker(accessToken: string): Promise<PickedFile[]> {
    return new Promise((resolve, reject) => {
        const google = (window as any).google;
        const gapi = (window as any).gapi;

        if (!google?.picker || !gapi) {
            console.error("[GooglePicker] Google Picker SDK not available during showPicker");
            reject(new Error("Google Picker not available"));
            return;
        }

        console.log("[GooglePicker] Building Picker dialog...");
        // Allow PDFs and Google Sheets
        const docsView = new google.picker.DocsView()
            .setIncludeFolders(true)
            .setMimeTypes(
                "application/pdf,application/vnd.google-apps.spreadsheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            .setSelectFolderEnabled(false);

        try {
            const picker = new google.picker.PickerBuilder()
                .addView(docsView)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY)
                .setAppId(APP_ID)
                .setCallback((data: any) => {
                    console.log("[GooglePicker] Raw Callback Data:", data);

                    if (data.action === google.picker.Action.PICKED) {
                        const files: PickedFile[] = data.docs.map((doc: any) => ({
                            id: doc.id,
                            name: doc.name,
                            mimeType: doc.mimeType,
                            url: doc.url,
                        }));
                        console.log(`[GooglePicker] User picked ${files.length} files`);
                        resolve(files);
                    } else if (data.action === google.picker.Action.CANCEL) {
                        console.log("[GooglePicker] User cancelled picker");
                        resolve([]); // user cancelled
                    } else if (data.error) {
                        console.error("[GooglePicker] Picker Error Data:", data.error);
                        reject(new Error(`Picker Error: ${data.error}`));
                    }
                })
                .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setTitle("Select Resumes from Google Drive")
                .build();

            picker.setVisible(true);
            console.log("[GooglePicker] Picker dialog visible");
        } catch (err) {
            console.error("[GooglePicker] Error building/showing picker:", err);
            reject(err);
        }
    });
}

// ────────────────────────────────────────────────────────────────────────────────
// Public API — single function that orchestrates everything
// ────────────────────────────────────────────────────────────────────────────────
export async function openGooglePicker(): Promise<PickerResult | null> {
    // 1. Load both SDKs in parallel
    await Promise.all([ensureGapiLoaded(), ensureGsiLoaded()]);

    // 2. Get fresh access token via GSI (in-memory only)
    const accessToken = await requestAccessToken();

    // 3. Open the Picker dialog
    const files = await showPicker(accessToken);

    if (files.length === 0) return null;

    return { files, accessToken };
}
