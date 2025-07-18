import getGmailClient from '@/lib/getGmailClient';
import { NextResponse } from 'next/server';
import MailComposer from 'nodemailer/lib/mail-composer';

export async function POST(request: Request) {
    try {
        const gmail = await getGmailClient();
        if (!gmail) return;

        const formData = await request.formData();
        const messageId = formData.get('messageId') as string; // ID of email to forward
        const forwardTo = formData.get('to') as string; // New recipient

        if (!messageId || !forwardTo) {
            return NextResponse.json({
                error: 'Missing required fields (messageId, to)',
                status: 400,
            });
        }

        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });

        if (!message.data.payload) {
            return NextResponse.json({
                error: 'Invalid message data',
                status: 400,
            });
        }

        // Extract headers
        const headers = message.data.payload.headers || [];
        const subject =
            headers.find(header => header.name === 'Subject')?.value ??
            'No Subject';
        const from =
            headers.find(header => header.name === 'From')?.value ??
            'Unknown Sender';

        // Extract email content (text & HTML)
        let textBody = 'No content available.';
        let htmlBody = '<p>No content available.</p>';
        let attachments: any[] = [];

        const extractParts = (parts: any[]) => {
            for (const part of parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    textBody = Buffer.from(part.body.data, 'base64').toString(
                        'utf-8'
                    );
                } else if (part.mimeType === 'text/html' && part.body?.data) {
                    htmlBody = Buffer.from(part.body.data, 'base64').toString(
                        'utf-8'
                    );
                } else if (part.body?.attachmentId) {
                    // Extract attachments
                    attachments.push({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        attachmentId: part.body.attachmentId,
                    });
                }

                // If nested parts exist, extract recursively
                if (part.parts) {
                    extractParts(part.parts);
                }
            }
        };

        if (message.data.payload.parts) {
            extractParts(message.data.payload.parts);
        } else if (message.data.payload.body?.data) {
            // If there's no multipart but still has a body, treat it as a plain-text email
            textBody = Buffer.from(
                message.data.payload.body.data,
                'base64'
            ).toString('utf-8');
        }

        // Step 4: Retrieve actual attachments
        let formattedAttachments: any[] = [];
        for (const attachment of attachments) {
            const attachmentData = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: messageId,
                id: attachment.attachmentId,
            });

            const data = attachmentData.data.data || '';

            formattedAttachments.push({
                filename: attachment.filename,
                content: Buffer.from(data, 'base64'),
                contentType: attachment.mimeType,
            });
        }

        // Step 5: Construct Forwarded Email
        const forwardTextBody = `---------- Forwarded message ---------\nFrom: ${from}\nSubject: ${subject}\n\n${textBody}`;
        const forwardHtmlBody = `
      <p>---------- Forwarded message ---------</p>
      <p><strong>From:</strong> ${from}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      ${htmlBody}
    `;

        const mailOptions = {
            from: 'me',
            to: forwardTo,
            subject: `Fwd: ${subject}`,
            text: forwardTextBody,
            html: forwardHtmlBody,
            attachments: formattedAttachments, // Attachments
        };

        // Step 6: Convert to raw email format using Nodemailer MailComposer
        const rawEmail = await new Promise<string>((resolve, reject) => {
            const mail = new MailComposer(mailOptions);
            mail.compile().build((error, msg) => {
                if (error) reject(error);
                else
                    resolve(
                        Buffer.from(msg)
                            .toString('base64')
                            .replace(/\+/g, '-')
                            .replace(/\//g, '_')
                            .replace(/=+$/, '')
                    );
            });
        });

        // Step 7: Send the email using Gmail API
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: rawEmail },
        });

        console.log('Email forwarded successfully.', response.data);

        return NextResponse.json({
            message: 'Email forwarded successfully',
            response: response.data,
        });
    } catch (error: any) {
        console.error('[FORWARD EMAIL ERROR]', error);
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
