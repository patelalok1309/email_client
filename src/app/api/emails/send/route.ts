import getGmailClient from '@/lib/getGmailClient';
import { oauth2Client } from '@/lib/google-auth';
import { NextResponse } from 'next/server';
import MailComposer from 'nodemailer/lib/mail-composer';

export async function POST(request: Request) {
    try {
        const gmail = await getGmailClient();
        if (!gmail) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        const formData = await request.formData();

        // Extract data
        const to = formData.get('to') as string;
        const cc = formData.get('cc') as string | null;
        const bcc = formData.get('bcc') as string | null;
        const subject = formData.get('subject') as string;
        const body = formData.get('body') as string;
        const attachments = formData.get('attachments') as string | null;

        // check the required fields
        if (!to || !subject || !body) {
            return NextResponse.json({
                error: 'Missing required fields',
                status: 400,
            });
        }

        let formattedAttachments = [];
        if (attachments) {
            try {
                const filesAsJSON = JSON.parse(attachments);
                formattedAttachments = filesAsJSON.map((file: any) => ({
                    filename: file.name,
                    content: Buffer.from(file.data, 'base64'),
                    encoding: 'base64',
                }));
            } catch (err) {
                return NextResponse.json({
                    error: 'Invalid attachments format',
                    status: 400,
                });
            }
        }

        // Function to build raw email
        const buildEmail = () =>
            new Promise<string>((resolve, reject) => {
                let mail = new MailComposer({
                    to,
                    cc: cc || undefined,
                    bcc: bcc || undefined,
                    subject,
                    html: body,
                    textEncoding: 'base64',
                    attachments: formattedAttachments,
                });

                mail.compile().build((error, msg) => {
                    if (error) {
                        reject('Error compiling email: ' + error);
                    } else {
                        const encodedMessage = Buffer.from(msg)
                            .toString('base64')
                            .replace(/\+/g, '-')
                            .replace(/\//g, '_')
                            .replace(/=+$/, '');
                        resolve(encodedMessage);
                    }
                });
            });

        // Await email build
        const encodedMessage = await buildEmail();

        // Send email
        const response = await gmail.users.messages.send({
            auth: oauth2Client,
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        return NextResponse.json({
            message: 'Email sent successfully',
            response: response.data,
        });
    } catch (error: any) {
        console.log('[SEND MAIL ERROR]', error);
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
