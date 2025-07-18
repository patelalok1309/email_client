import { gmail_v1 } from 'googleapis';
import getAttachment from './getAttachment';

export interface ParsedEmailPart {
    filename?: string;
    mimeType?: string;
    data: string; // Text content or base64 URL for images/PDFs
}

export const extractMessageParts = async (
    parts: gmail_v1.Schema$MessagePart[] | undefined,
    messageId: string
): Promise<ParsedEmailPart[]> => {
    if (!parts || parts.length === 0) {
        console.warn('No parts found in the email message.');
        return [];
    }

    // const supportedMimeTypes = [
    //   "text/plain",
    //   "text/html",
    //   "image/jpeg",
    //   "image/png",
    //   "image/gif",
    //   "application/pdf",
    // ];

    let extractedParts: ParsedEmailPart[] = [];

    const traverseParts = async (part: gmail_v1.Schema$MessagePart) => {
        if (!part.mimeType) {
            console.warn('Skipping part with no mimeType.');
            return;
        }

        const mimeType = part.mimeType;

        // Handle container types
        if (mimeType.startsWith('multipart/')) {
            // console.log(`Found multipart type: ${mimeType}, processing sub-parts.`);
            if (part.parts) {
                for (const subPart of part.parts) {
                    await traverseParts(subPart);
                }
            }
            return;
        }

        // Process text content
        if (mimeType === 'text/plain' || mimeType === 'text/html') {
            if (part.body?.data) {
                const decodedData = Buffer.from(
                    part.body.data,
                    'base64'
                ).toString('utf-8');
                extractedParts.push({
                    filename: part.filename || 'inline-text',
                    data: decodedData,
                    mimeType,
                });
                // console.log(`Extracted text: ${decodedData.substring(0, 100)}...`); // Log only first 100 chars
            } else {
                console.warn('Text part found but has no data.');
            }
            return;
        }

        // Process images & PDFs
        if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
            // console.log(`Fetching attachment for ${mimeType}`);
            const attachment = await getAttachment(part, messageId);
            if (attachment && attachment.data) {
                extractedParts.push(attachment);
            } else {
                console.warn(
                    `Failed to retrieve attachment for part: ${part.filename}`
                );
            }
            return;
        }

        console.warn(`Unsupported MIME type encountered: ${mimeType}`);
    };

    for (const part of parts) {
        await traverseParts(part);
    }

    // console.log("Extracted Parts: ", extractedParts);
    return extractedParts;
};
