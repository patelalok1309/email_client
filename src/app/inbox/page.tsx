'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CreateMailModal } from './components/CreateEmailModal';
import EmailFiltersModal from './components/EmailFilterModal';
import EmailList from './components/Emailist';

const LABELS = ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'UNREAD'];

const Page = () => {
    const router = useRouter();

    const [messages, setMessages] = useState(null);
    const [labels, setLabels] = useState<string[]>(['INBOX']);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMails();
    }, [labels]);

    const batchDeleteMessages = async () => {
        if (!selectedMessageIds.length) return;
        setIsLoading(true);
        try {
            await fetch('/api/emails', {
                method: 'DELETE',
                body: JSON.stringify({ messageIds: selectedMessageIds }),
                headers: { 'Content-Type': 'application/json' },
            });

            // ✅ Remove deleted messages from state instead of full re-fetch
            setMessages((prev: any) =>
                prev?.filter((msg: any) => !selectedMessageIds.includes(msg.id))
            );

            setSelectedMessageIds([]);
            await fetchMails();
        } catch (error) {
            alert('Failed to delete messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchMails(searchTerm);
    };

    const fetchMails = useCallback(
        async (query = '') => {
            if (!labels.length) return;
            setIsLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    labelIds: labels.join(','),
                    query, // Search term added to the request
                }).toString();
                const response = await fetch(`/api/emails?${queryParams}`, {
                    method: 'GET',
                });

                if (!response.ok)
                    throw new Error(
                        `Error fetching mails: ${response.statusText}`
                    );

                const data = await response.json();

                if (data.error === 'Unauthorized' || data.status === 401) {
                    router.push('/');
                }

                setMessages(data);
            } catch (error: any) {
                console.error('ERROR FETCHING MAILS', error);
            } finally {
                setIsLoading(false);
            }
        },
        [labels]
    );

    useEffect(() => {
        fetchMails();
    }, [fetchMails]);

    const handleChangeLabel = (label: string) => {
        if (labels.includes(label)) return;
        setLabels([label]);
    };

    const handleAppyFilters = async (filters: any) => {
        const { from, to, subject, hasAttachment, label, dateRange } = filters;
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}&`;
        if (subject) query += `subject=${subject}&`;
        if (hasAttachment) query += `hasAttachment=${hasAttachment}&`;
        if (label) query += `label=${label}&`;
        if (dateRange) query += `dateRange=${dateRange}&`;
        try {
            console.log('query', query);
            if (query === '') query = 'INBOX';
            setIsLoading(true);
            await fetchMails(query);
        } catch (error) {
            console.log('ERROR FETCHING MAILS', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='w-full min-h-screen px-8 pt-4'>
            <div className='px-8'>
                {/* Header */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <h2 className='text-2xl font-bold'>INBOX</h2>
                        <CreateMailModal />
                    </div>

                    {/* Search Bar */}
                    <div className='flex items-center w-full max-w-md px-4 py-2 bg-white rounded-lg'>
                        <Input
                            className='flex-1 rounded-3xl placeholder-gray-400 p-2 text-lg pl-2'
                            placeholder='Search mail...'
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        <Button
                            variant='outline'
                            className='ml-1 px-3 rounded-full'
                            onClick={handleSearch}
                        >
                            <Search className='w-5 h-5 text-blue-600' />
                        </Button>
                        <div className='ml-2'>
                            <EmailFiltersModal
                                onApply={(filters: any) =>
                                    handleAppyFilters(filters)
                                }
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2'>
                        <Button
                            className='bg-rose-500 text-white'
                            disabled={selectedMessageIds.length === 0}
                            onClick={batchDeleteMessages}
                        >
                            <Trash2 className='w-5 h-5' />
                        </Button>
                    </div>
                </div>

                {/* Labels */}
                <div className='flex flex-wrap gap-2 my-4'>
                    {LABELS.map((label: string) => (
                        <Badge
                            key={label}
                            onClick={() => handleChangeLabel(label)}
                            variant={
                                labels.includes(label) ? 'default' : 'outline'
                            }
                            className='cursor-pointer px-3 py-1'
                        >
                            {label}
                        </Badge>
                    ))}
                </div>

                {/* Email List */}
                {isLoading ? (
                    <div className='flex justify-center items-center min-h-[calc(100vh-200px)]'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
                    </div>
                ) : (
                    <EmailList
                        data={messages}
                        selectedMessageIds={selectedMessageIds}
                        setSelectedMessageIds={setSelectedMessageIds}
                    />
                )}
            </div>
        </div>
    );
};

export default Page;
