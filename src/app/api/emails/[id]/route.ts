import { formatGmailResponse } from '@/helper';
import getGmailClient from '@/lib/getGmailClient';
import { oauth2Client } from '@/lib/google-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: any) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                error: 'Message ID not found',
                status: 400,
            });
        }

        const gmail = await getGmailClient();
        if (!gmail) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        const res: any = await gmail.users.messages.get({
            auth: oauth2Client,
            userId: 'me',
            id: id,
        });

        const formattedRes = await formatGmailResponse(res.data, true);

        return NextResponse.json(formattedRes, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
