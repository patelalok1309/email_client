import { formatGmailResponse } from '@/helper';
import getGmailClient from '@/lib/getGmailClient';
import { oauth2Client } from '@/lib/google-auth';

type messageIdwithThreadId = {
    id: string;
    threadId: string;
};

export default async function getEmails(labelIds = ['INBOX'], query = '') {
    const gmail = await getGmailClient();
    if (!gmail) {
        return {
            error: 'Unauthorized',
        };
    }
    const response = await gmail.users.messages.list({
        auth: oauth2Client,
        userId: 'me',
        maxResults: 20,
        labelIds: labelIds,
        q: query,
    });

    const messagesWithIdAndThreadId =
        response.data?.messages?.reduce((acc: any, message: any) => {
            if (message.id && message.threadId) {
                acc.push({ id: message.id, threadId: message.threadId });
            }
            return acc;
        }, [] as messageIdwithThreadId[]) || [];

    const formattedEmails = await Promise.all(
        messagesWithIdAndThreadId.map(async (message: { id: string }) => {
            const res = await gmail.users.messages.get({
                auth: oauth2Client,
                userId: 'me',
                id: message.id,
            });

            // Format the email response
            return await formatGmailResponse(res.data);
        })
    );

    return formattedEmails;
}
