import type { UserProfile } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
  interface ImportMetaEnv {
    readonly VITE_GOOGLE_API_KEY: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

let gapi: any;
let google: any;
let tokenClient: any;
let onAuthChangeCallback: (profile: UserProfile | null) => void;
let isGapiLoaded = false;
let isGisLoaded = false;

export function areGoogleKeysAvailable(): boolean {
    return !!API_KEY && !!CLIENT_ID;
}

function loadGapiScript() {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gapi = window.gapi;
      gapi.load('client', () => {
        isGapiLoaded = true;
        resolve();
      });
    };
    document.body.appendChild(script);
  });
}

function loadGisScript() {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google = window.google;
      isGisLoaded = true;
      resolve();
    };
    document.body.appendChild(script);
  });
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
}

async function initializeGisClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              // Set token for future GAPI client calls
              gapi.client.setToken(tokenResponse);
              // Pass token to fetch user profile to verify and get user info
              await fetchUserProfile(tokenResponse.access_token);
            } else if (tokenResponse.error) {
                console.error("Token response error:", tokenResponse.error);
                onAuthChangeCallback(null);
            } else {
                console.error("Unexpected token response:", tokenResponse);
                onAuthChangeCallback(null);
            }
        },
    });
}

async function fetchUserProfile(accessToken: string) {
    try {
        if (!accessToken) {
            console.error("fetchUserProfile called without an access token.");
            onAuthChangeCallback(null);
            return;
        }

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error response from userinfo endpoint:", response.status, errorBody);
            gapi.client.setToken(null);
            onAuthChangeCallback(null);
            return;
        }

        const result = await response.json();
        const profile: UserProfile = {
            name: result.name,
            email: result.email,
            picture: result.picture,
        };
        // Success: The token is valid, and gapi.client has it set from the callback.
        onAuthChangeCallback(profile);
    } catch (err) {
        console.error("Exception in fetchUserProfile:", err);
        gapi.client.setToken(null);
        onAuthChangeCallback(null);
    }
}

export async function initializeGoogleClient(callback: (profile: UserProfile | null) => void) {
    if (!areGoogleKeysAvailable()) {
        console.error("Google API Key or Client ID is not configured. Please check your .env.local file.");
        callback(null);
        throw new Error("Google API Key or Client ID is not configured.");
    }
    
    onAuthChangeCallback = callback;

    if (!isGapiLoaded) await loadGapiScript();
    if (!isGisLoaded) await loadGisScript();

    await initializeGapiClient();
    await initializeGisClient();
}

export function signIn() {
    if (!tokenClient) {
        console.error("Google Token Client not initialized before calling signIn.");
        alert("Error: El cliente de autenticación de Google no está listo. Por favor, recargue la página e inténtelo de nuevo.");
        return;
    }
    try {
        // Prompt the user to select an account and grant consent.
        // By removing `prompt: 'consent'`, we allow the GIS library to handle the UX flow,
        // only asking for consent when it's actually needed (e.g., the first time).
        tokenClient.requestAccessToken();
    } catch (error) {
        console.error("Error calling requestAccessToken:", error);
        alert(`Se produjo un error al intentar iniciar sesión. Revisa la consola del navegador para más detalles.`);
    }
}

export function signOut() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
            onAuthChangeCallback(null);
        });
    }
}

// --- Google Drive Functions ---

let appFolderId: string | null = null;

export async function getAppFolderId(folderName: string): Promise<string> {
    if (appFolderId) return appFolderId;

    const response = await gapi.client.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: 'files(id, name)',
    });

    if (response.result.files.length > 0) {
        appFolderId = response.result.files[0].id;
        return appFolderId!;
    } else {
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        const newFolder = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        appFolderId = newFolder.result.id;
        return appFolderId!;
    }
}

export async function listFiles(folderId: string): Promise<any[]> {
    const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
    });
    return response.result.files;
}

export async function readFile(fileId: string): Promise<string> {
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    return response.body;
}

export async function createFile(folderId: string, fileName: string, content: string): Promise<any> {
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };
    const media = {
        mimeType: 'application/json',
        body: content,
    };
    const response = await gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });
    return response.result;
}

export async function updateFile(fileId: string, content: string): Promise<any> {
    const media = {
        mimeType: 'application/json',
        body: content,
    };
    const response = await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'media' },
        body: content
    });
    return response.result;
}

export async function uploadFile(folderId: string, file: File): Promise<any> {
    const fileMetadata = {
        name: file.name,
        parents: [folderId]
    };

    const form = new FormData();
    form.append(
        'metadata',
        new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
        body: form
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.error("File upload failed:", error);
        throw new Error(`Upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
}

export async function uploadContent(folderId: string, fileName: string, content: string, mimeType: string): Promise<any> {
    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };

    const form = new FormData();
    form.append(
        'metadata',
        new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: mimeType }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
        body: form
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.error("Content upload failed:", error);
        throw new Error(`Upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
}


export async function deleteFile(fileId: string): Promise<void> {
    await gapi.client.drive.files.delete({
        fileId: fileId,
    });
}