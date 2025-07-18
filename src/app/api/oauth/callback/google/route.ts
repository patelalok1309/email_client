import { oauth2Client } from '@/lib/google-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.json({ error: error, status: 400 });
        }

        if (!code) {
            return NextResponse.json({ error: 'Code not found', status: 400 });
        }

        const { tokens } = await oauth2Client.getToken(code);

        (await cookies()).set({
            name: 'accessToken',
            value: tokens.access_token || '',
            expires: new Date(Date.now() + 3600 * 1000), // 1 hour
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            httpOnly: true,
        });

        (await cookies()).set({
            name: 'refreshToken',
            value: tokens.refresh_token || '',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            httpOnly: true,
        });

        return NextResponse.redirect(new URL('/inbox', req.url));
    } catch (error: any) {
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
