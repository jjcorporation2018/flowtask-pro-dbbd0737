import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(__dirname, '../../.calendar_tokens.json');

// From environment or fallback
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy';
// In Hetzner, this should be in .env. We use a fallback so it doesn't crash locally if missing
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret';
// The Redirect URI must match what's configured in Google Cloud Console
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === 'production'
    ? 'https://app.polaryon.com.br/api/calendar/callback' // Update to correct domain or IP
    : 'http://localhost:3000/api/calendar/callback';

export const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

// Load previous tokens into the client if they exist
export const loadTokens = () => {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
            oauth2Client.setCredentials(tokens);
            return true;
        }
    } catch (e) {
        console.error("No valid calendar tokens found or parse error.", e);
    }
    return false;
};

// Initialize on start
loadTokens();

export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ],
        prompt: 'consent' // force to get refresh_token
    });
};

export const saveTokens = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    return tokens;
};

// Simple fetcher using the auth client's access token
export const fetchGoogleEvents = async () => {
    let accessToken: string | null | undefined = null;
    try {
        accessToken = (await oauth2Client.getAccessToken()).token;
    } catch (error: any) {
        console.error('getAccessToken Error in fetchGoogleEvents:', error.message);
        throw new Error("NEEDS_AUTH");
    }
    if (!accessToken) throw new Error("NEEDS_AUTH");

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("NEEDS_AUTH");
        throw new Error(`Google API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
};

export const pushEventToGoogle = async (event: { summary: string, description?: string, start: { date?: string, dateTime?: string }, end: { date?: string, dateTime?: string } }) => {
    let accessToken: string | null | undefined = null;
    try {
        accessToken = (await oauth2Client.getAccessToken()).token;
    } catch (error: any) {
        console.error('getAccessToken Error in pushEventToGoogle:', error.message);
        throw new Error("NEEDS_AUTH");
    }
    if (!accessToken) throw new Error("NEEDS_AUTH");

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    });

    if (!response.ok) {
        console.error("Failed to push event", await response.text());
    }
};
