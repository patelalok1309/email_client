import { ParsedEmailPart } from './app/actions/extractMessageParts';

export interface EmailPart {
    type: string; // MIME type (text/plain, text/html, etc.)
    body: string; // Decoded body content
    filename?: string;
}

export interface Email {
    id: string;
    threadId: string;
    labels: string[];
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    parts: ParsedEmailPart[];
    messageID?: string;
}
