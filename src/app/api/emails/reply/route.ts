import getGmailClient from '@/lib/getGmailClient';
import { oauth2Client } from '@/lib/google-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const gmail = await getGmailClient();

        if (!gmail) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        const { from, to, subject, inReplyTo, threadId, emailBody, messageId } =
            body;

        const thread = await gmail.users.threads.get({
            auth: oauth2Client,
            userId: 'me',
            id: threadId,
        });

        if (!thread || !thread.data.messages) {
            return NextResponse.json({
                error: 'Thread not found',
                status: 400,
            });
        }

        const originalMsg = await gmail.users.messages.get({
            auth: oauth2Client,
            userId: 'me',
            id: thread.data.messages[0].id || '',
        });

        if (!originalMsg || !originalMsg.data.payload) {
            return NextResponse.json({
                error: 'Message not found',
                status: 400,
            });
        }

        const MessageIdHeader = originalMsg?.data?.payload.headers?.find(
            (header: any) => header.name === 'Message-ID'
        )?.value;

        const referenceMsgIds = [MessageIdHeader];

        const rawEmail = createRawEmail({
            from: to,
            to: from,
            subject,
            body: emailBody,
            inReplyTo,
            references: referenceMsgIds,
        });

        const response = await gmail.users.messages.send({
            auth: oauth2Client,
            userId: 'me',
            requestBody: {
                threadId: threadId,
                raw: rawEmail,
            },
        });

        // console.log("EMAIL REPLY RESPONSE : ", response);

        return NextResponse.json({ data: response.data, status: 200 });
    } catch (error: any) {
        console.log('[ERROR REPLYING EMAIL]', error);
        return NextResponse.json({ error: error.message, status: 500 });
    }
}

function createRawEmail({
    from,
    to,
    subject,
    body,
    inReplyTo,
    references,
}: any) {
    let rawEmail = `From: ${from}
To: ${to}
Subject: Re: ${subject}
In-Reply-To: ${inReplyTo}
References: ${references}
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

${body}`;

    return Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
