/**
 * Google Drive & Identity Services Wrapper
 * Handles OAuth2 client token initialization, file creation/conversion,
 * and exporting content back as HTML.
 */

/** localStorage key for persisting the Google OAuth Client ID across the app */
export const GDRIVE_CLIENT_ID_KEY = 'pdfmount-google-client-id';
/** localStorage key for persisting the last-used OAuth access token */
export const GDRIVE_TOKEN_KEY = 'pdfmount-google-token';
/** localStorage key for tracking the active Google Doc file ID */
export const GDRIVE_FILE_ID_KEY = 'pdfmount-google-file-id';
/** localStorage key for tracking the active Google Doc edit URL */
export const GDRIVE_DOC_URL_KEY = 'pdfmount-google-doc-url';

/**
 * Reads the configured Google Client ID from localStorage or env variable.
 * Returns empty string if not configured.
 */
export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(GDRIVE_CLIENT_ID_KEY) ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ''
  );
}

let gsiScriptLoaded = false;

/**
 * Dynamically loads the Google Identity Services client SDK
 */
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gsiScriptLoaded || (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiScriptLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      reject(new Error("Failed to load Google Identity Services SDK. This is usually caused by an adblocker, Brave Shields, or privacy extensions blocking Google Sign-In/Drive connection. Please disable shields/adblocker for pdfmount.online and try again."));
    };
    document.head.appendChild(script);
  });
}

/**
 * Soliciting OAuth2 access token for drive.file scope
 */
export function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error("Google Client ID is missing. Please configure it in your Settings."));
      return;
    }
    
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(`OAuth authentication failed: ${response.error}`));
            return;
          }
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error("No access token returned from Google authentication."));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(`OAuth Client Error: ${err.message || err}`));
        }
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Uploads HTML content to Google Drive and auto-converts it to a Google Doc
 */
export async function uploadHtmlToGoogleDoc(
  token: string,
  title: string,
  htmlContent: string
): Promise<{ fileId: string; webViewLink: string }> {
  const metadata = {
    name: title || "Untitled document",
    mimeType: "application/vnd.google-apps.document", // Automatically convert to Google Doc format
  };

  const boundary = "pdfmount_drive_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: text/html; charset=UTF-8\r\n\r\n" +
    htmlContent +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed: ${response.statusText} (${errorText})`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink,
  };
}

/**
 * Exports a Google Doc back as clean HTML
 */
export async function exportGoogleDocToHtml(token: string, fileId: string): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive export failed: ${response.statusText} (${errorText})`);
  }

  const html = await response.text();
  return html;
}

/**
 * Updates content in Google Drive (pushing back changes)
 */
export async function updateGoogleDocContent(
  token: string,
  fileId: string,
  htmlContent: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/html",
      },
      body: htmlContent,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Google Doc content: ${response.statusText} (${errorText})`);
  }
}

/**
 * ─────────────────────────────────────────────────────
 * HIGH-LEVEL SHARED UTILITY
 * ─────────────────────────────────────────────────────
 * openInGoogleDocs()
 *
 * Single entry point used by ALL tools (Resume Builder,
 * PDF to Word, Document Editor page) to open an HTML
 * document in Google Docs.
 *
 * Flow:
 *  1. Read client ID from localStorage / env
 *  2. If missing → prompt user to enter it
 *  3. Load Google Identity Services SDK (lazy)
 *  4. Get OAuth access token (drive.file scope)
 *  5. Upload HTML as Google Doc to Drive
 *  6. Open returned webViewLink in new browser tab
 *
 * @param html       - Full HTML string to open
 * @param title      - Document title shown in Google Docs
 * @param onProgress - Optional callback for status messages (UI feedback)
 * @returns          - { fileId, webViewLink } on success
 */
export async function openInGoogleDocs(
  html: string,
  title: string,
  onProgress?: (msg: string) => void
): Promise<{ fileId: string; webViewLink: string }> {
  // ── 1. Resolve Client ID ────────────────────────────
  let clientId = getClientId();
  if (!clientId) {
    clientId = window.prompt(
      'Google Client ID is not configured.\n\nPlease enter your Google OAuth 2.0 Client ID\n(Get it from console.cloud.google.com → APIs & Services → Credentials):'
    ) || '';
    if (!clientId.trim()) {
      throw new Error('Google Client ID is required to use this feature.');
    }
    localStorage.setItem(GDRIVE_CLIENT_ID_KEY, clientId.trim());
    clientId = clientId.trim();
  }

  // ── 2. Load Google Identity Services SDK ────────────
  onProgress?.('Connecting to Google...');
  await loadGsiScript();

  // ── 3. Get OAuth Access Token ────────────────────────
  onProgress?.('Requesting Google authorization...');
  let token = localStorage.getItem(GDRIVE_TOKEN_KEY) || '';
  if (!token) {
    token = await getAccessToken(clientId);
    localStorage.setItem(GDRIVE_TOKEN_KEY, token);
  }

  // ── 4. Upload as Google Doc ──────────────────────────
  onProgress?.('Uploading document to Google Drive...');
  let result: { fileId: string; webViewLink: string };
  try {
    result = await uploadHtmlToGoogleDoc(token, title, html);
  } catch (err: any) {
    // Token may be stale — refresh once and retry
    if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
      onProgress?.('Session expired. Re-authenticating...');
      token = await getAccessToken(clientId);
      localStorage.setItem(GDRIVE_TOKEN_KEY, token);
      result = await uploadHtmlToGoogleDoc(token, title, html);
    } else {
      throw err;
    }
  }

  // ── 5. Persist session for Sync-back ────────────────
  localStorage.setItem(GDRIVE_FILE_ID_KEY, result.fileId);
  localStorage.setItem(GDRIVE_DOC_URL_KEY, result.webViewLink);

  // ── 6. Open in new tab ───────────────────────────────
  onProgress?.('Opening Google Docs...');
  window.open(result.webViewLink, '_blank');

  return result;
}
