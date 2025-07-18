import getEmails from '@/app/actions/getEmails';
import getGmailClient from '@/lib/getGmailClient';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const gmail = await getGmailClient();
        if (!gmail) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const labelIds = searchParams.get('labelIds')?.split(',');
        const query = searchParams.get('query');
        const formattedQuery = query?.replaceAll('=', ':').split('&').join(' ');

        const response =
            (await getEmails(labelIds || ['INBOX'], formattedQuery)) || {};
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('ERROR FETCHING MAILS', error);
        return NextResponse.json({ error: error.message, status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const gmail = await getGmailClient();

        if (!gmail) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        const { messageIds } = await req.json();

        if (!messageIds) {
            return NextResponse.json({
                error: 'Message IDs not found',
                status: 400,
            });
        }

        const res = await gmail.users.messages.batchDelete({
            userId: 'me',
            requestBody: {
                ids: messageIds,
            },
        });

        console.log('EMAILS DELETED', res);

        return NextResponse.json(
            { message: 'Emails deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.log('[ERROR DELETING EMAILS]', error);
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
