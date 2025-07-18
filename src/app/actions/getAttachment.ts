import getGmailClient from '@/lib/getGmailClient';
import { gmail_v1 } from 'googleapis';

export default async function getAttachment(
    part: gmail_v1.Schema$MessagePart,
    messageId: string
): Promise<any> {
    if (!part) {
        return null;
    }

    const gmail = await getGmailClient();

    if (!gmail) {
        return null;
    }

    const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: part.body?.attachmentId || '',
    });

    const base64Data =
        response.data.data &&
        response.data.data.replace(/_/g, '/').replace(/-/g, '+');

    return {
        data: `data:${part.mimeType};base64,${base64Data}`,
        filename: part.filename,
        mimeType: part.mimeType,
    };
}
