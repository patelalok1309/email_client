'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PencilIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export function CreateMailModal() {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<FileList | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append('to', to);
        if (cc) formData.append('cc', cc);
        if (bcc) formData.append('bcc', bcc);
        formData.append('subject', subject);
        formData.append('body', body);

        if (attachments) {
            const attachmentPromises = Array.from(attachments).map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve({
                            name: file.name,
                            data: result ? result.split(',')[1] : '',
                            type: file.type,
                        });
                    };
                    reader.onerror = error => reject(error);
                });
            });

            try {
                const encodedAttachments =
                    await Promise.all(attachmentPromises);
                formData.append(
                    'attachments',
                    JSON.stringify(encodedAttachments)
                );
            } catch (error: any) {
                console.error('Error encoding attachments: ', error);
                setLoading(false);
                alert('Error encoding attachments.');
                return;
            }
        }
        try {
            await fetch('/api/emails/send', {
                method: 'POST',
                body: formData,
            });
            alert('Email sent successfully!');
        } catch (error: any) {
            console.error('Error sending email: ', error);
            alert('Error sending email.');
        } finally {
            setLoading(false);
            setOpenModal(false);
        }
    };

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
                <button
                    onClick={() => setOpenModal(true)}
                    className='bg-[#c2e7ff] hover:shadow-2xl flex py-4 px-3 rounded-xl items-center justify-center gap-2 font-medium'
                >
                    <PencilIcon className='w-4 h-4' />
                    Compose
                </button>
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
                        <ReactQuill
                            theme='snow'
                            value={body}
                            onChange={setBody}
                        />
                        {/* <Textarea
              className="max-h-80 min-h-60 overflow-y-scroll"
              id="body"
              placeholder="Type your message here"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            /> */}
                    </div>

                    <div className='grid gap-2 mt-16'>
                        <Label htmlFor='attachments'>Attachments</Label>
                        <Input
                            id='attachments'
                            type='file'
                            multiple
                            onChange={e => setAttachments(e.target.files)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => handleSendEmail()}
                        type='submit'
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                sending...
                            </>
                        ) : (
                            'Send Email'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
