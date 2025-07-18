import { formatGmailResponse } from '@/helper';
import { gmail_v1 } from 'googleapis';

/**
 * Fetches email details (including body) for multiple emails.
 * @param gmail - The Gmail API instance.
 * @param oauth2Client - The authenticated OAuth2 client.
 * @param messageIds - List of message objects with { id, threadId }.
 * @returns Array of formatted emails.
 */
export const fetchEmails = async (
    gmail: gmail_v1.Gmail,
    oauth2Client: any,
    messageIds: { id: string; threadId: string }[]
) => {
    try {
        const emails = await Promise.all(
            messageIds.map(async message => {
                const res = await gmail.users.messages.get({
                    auth: oauth2Client,
                    userId: 'me',
                    id: message.id,
                });

                // Format the email response
                return await formatGmailResponse(res.data);
            })
        );

        return emails;
    } catch (error) {
        console.error('Error fetching emails:', error);
        return [];
    }
};
