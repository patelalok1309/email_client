import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { oauth2Client } from './google-auth';

export default async function getGmailClient() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken) {
        return null;
    }

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
        access_token: accessToken,
    });

    const gmail = await google.gmail({ version: 'v1', auth: oauth2Client });

    return gmail;
}
