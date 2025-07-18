import MailPreview from '@/components/MailPreview';
import { formatGmailResponse } from '@/helper';
import getGmailClient from '@/lib/getGmailClient';
import { oauth2Client } from '@/lib/google-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page({ params }: any) {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken) {
        return redirect('/');
    }

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    const gmail = await getGmailClient();

    if (!gmail) {
        return redirect('/');
    }

    try {
        const response = await gmail.users.messages.get({
            auth: oauth2Client,
            userId: 'me',
            id,
        });

        // remove UNREAD label
        await gmail.users.messages.modify({
            auth: oauth2Client,
            userId: 'me',
            id: id,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });

        const threadId = response.data.threadId;
        let messages: any = [];

        if (threadId) {
            const thread = await gmail.users.threads.get({
                auth: oauth2Client,
                userId: 'me',
                id: threadId,
            });

            if (thread.data.messages && thread.data.messages.length > 1) {
                messages = await Promise.all(
                    thread.data.messages.map(async message => {
                        const res = await gmail.users.messages.get({
                            auth: oauth2Client,
                            userId: 'me',
                            id: message.id || '',
                        });

                        return formatGmailResponse(res.data);
                    })
                );
            }
        }

        if (messages.length === 0) {
            messages.push(await formatGmailResponse(response.data));
        }

        return (
            <>
                {messages.map((message: any, index: number) => (
                    <MailPreview
                        key={index}
                        data={message}
                        accessToken={accessToken}
                    />
                ))}
            </>
        );
    } catch (error) {
        console.error('Error fetching email thread:', error);
        return (
            <div className='text-center text-red-500'>
                Failed to load the email.
            </div>
        );
    }
}
