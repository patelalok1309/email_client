'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Reply } from 'lucide-react';
import { useState } from 'react';

// Base64Url encoding utility function for Gmail API
const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export function CreateEmailReplyModal({ data, accessToken }: any) {
    const [to, setTo] = useState(data?.from);
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);
    const [subject, setSubject] = useState(data?.subject);
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<FileList | null>(null);

    const handleSendEmail = async () => {
        // Construct the MIME message for the email

        try {
            await fetch('/api/emails/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    messageId: data?.id,
                    threadId: data?.threadId,
                    emailBody: body,
                    from: data?.from,
                    to: data?.to,
                    subject: data?.subject,
                    inReplyTo: data?.id,
                }),
            });

            alert('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email: ', error);
            alert('Error sending email.');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    className='rounded-full p-3 text-lg border-1 border-gray-300 text-gray-700 hover:text-gray-900 mt-2'
                >
                    <Reply className='w-4 h-4' />
                    Reply
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                    <DialogDescription>
                        Fill out the details and send an email directly from
                        here.
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                    <div className='grid gap-2'>
                        <Label htmlFor='to'>To</Label>
                        <Input
                            disabled
                            className='w-full'
                            id='to'
                            placeholder='Recipient Email'
                            value={to}
                            onChange={e => setTo(e.target.value)}
                        />
                        <div className='flex w-full items-center justify-end'>
                            <Badge
                                variant={showCC ? 'default' : 'secondary'}
                                onClick={() => setShowCC(!showCC)}
                            >
                                CC
                            </Badge>
                            <Badge
                                variant={showBCC ? 'default' : 'secondary'}
                                onClick={() => setShowBCC(!showBCC)}
                            >
                                BCC
                            </Badge>
                        </div>
                    </div>

                    {showCC && (
                        <div className='grid gap-2'>
                            <Label htmlFor='cc'>CC</Label>
                            <Input
                                id='cc'
                                placeholder='CC Email'
                                value={cc}
                                onChange={e => setCc(e.target.value)}
                            />
                        </div>
                    )}

                    {showBCC && (
                        <div className='grid gap-2'>
                            <Label htmlFor='bcc'>BCC</Label>
                            <Input
                                id='bcc'
                                placeholder='BCC Email'
                                value={bcc}
                                onChange={e => setBcc(e.target.value)}
                            />
                        </div>
                    )}

                    <div className='grid gap-2'>
                        <Label htmlFor='subject'>Subject</Label>
                        <Input
                            id='subject'
                            placeholder='Subject of the Email'
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                    </div>

                    <div className='grid gap-2'>
                        <Label htmlFor='body'>Body</Label>
                        <Textarea
                            className='max-h-80 min-h-60 overflow-y-scroll'
                            id='body'
                            placeholder='Type your message here'
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </div>

                    <div className='grid gap-2'>
                        <Label htmlFor='attachments'>Attachments</Label>
                        <Input
                            id='attachments'
                            type='file'
                            onChange={e => setAttachments(e.target.files)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => handleSendEmail()} type='submit'>
                        Send Email
                    </Button>
                    <DialogClose asChild>
                        <Button type='button' variant='secondary'>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
