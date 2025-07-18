import { gmail_v1 } from 'googleapis';
import {
    extractMessageParts,
    ParsedEmailPart,
} from './app/actions/extractMessageParts';
import { Email } from './types';

export const formatGmailResponse = async (
    email: gmail_v1.Schema$Message,
    listOnly: boolean = false
): Promise<Email | null> => {
    if (!email || !email.payload) return null;

    const headers = email.payload.headers as Array<{
        name: string;
        value: string;
    }>;

    const getHeader = (name: string): string =>
        headers.find(header => header.name === name)?.value || '';

    let emailParts: ParsedEmailPart[] = [];
    if (!listOnly) {
        if (email.payload.parts) {
            emailParts = await extractMessageParts(
                email.payload.parts,
                email.id || ''
            );
        } else {
            emailParts = await extractMessageParts(
                [email.payload],
                email.id || ''
            );
        }
    }

    return {
        id: email.id || '',
        threadId: email.threadId || '',
        labels: email.labelIds || [],
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: email.snippet || '',
        parts: emailParts, // List of extracted MIME parts
        messageID: getHeader('Message-ID'),
    };
};
