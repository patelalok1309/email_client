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
import { Forward, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ForwardEmailModal({ data }: any) {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append('to', to);
        formData.append('messageId', data.id);

        if (cc) formData.append('cc', cc);
        if (bcc) formData.append('bcc', bcc);

        try {
            await fetch('/api/emails/forward', {
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
                <Button
                    variant='outline'
                    className='rounded-full p-3 text-lg border-1 border-gray-300 text-gray-700 hover:text-gray-900 mt-2'
                >
                    Forward
                    <Forward className='w-4 h-4' />
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
