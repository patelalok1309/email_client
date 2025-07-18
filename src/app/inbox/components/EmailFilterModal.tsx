import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

const initialFilters = {
    from: '',
    to: '',
    subject: '',
    hasAttachment: null, // Use null instead of empty string
    label: null,
    dateRange: null,
};

export default function EmailFiltersModal({ onApply }: any) {
    const [onModalOpen, setOnModalOpen] = useState(false);

    const [filters, setFilters] = useState(initialFilters);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (
            filters.from.length > 0 ||
            filters.to.length > 0 ||
            filters.subject.length > 0 ||
            filters.hasAttachment ||
            filters.label ||
            filters.dateRange
        ) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [filters]);

    const handleChange = (key: string, value: string | null) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog open={onModalOpen} onOpenChange={setOnModalOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    className={`${
                        isActive ? 'bg-gray-100 outline-2 outline-gray-300' : ''
                    }`}
                >
                    <SlidersHorizontal className='w-5 h-5 text-blue-500 font-bold' />
                </Button>
            </DialogTrigger>
            <DialogContent className='w-full max-w-md'>
                <DialogHeader>
                    <DialogTitle>Email Filters</DialogTitle>
                </DialogHeader>

                <div className='flex flex-col space-y-4'>
                    <Input
                        placeholder='From'
                        value={filters.from}
                        onChange={e => handleChange('from', e.target.value)}
                    />
                    <Input
                        placeholder='To'
                        value={filters.to}
                        onChange={e => handleChange('to', e.target.value)}
                    />
                    <Input
                        placeholder='Subject'
                        value={filters.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                    />

                    <Select
                        value={filters.label ?? ''}
                        onValueChange={val =>
                            handleChange('label', val || null)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Select Label' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='unread'>Unread</SelectItem>
                            <SelectItem value='important'>Important</SelectItem>
                            <SelectItem value='has:attachment'>
                                Has Attachment
                            </SelectItem>
                            <SelectItem value='starred'>Starred</SelectItem>
                            <SelectItem value='sent'>Sent</SelectItem>
                            <SelectItem value='draft'>Draft</SelectItem>
                            <SelectItem value='spam'>Spam</SelectItem>
                            <SelectItem value='trash'>Trash</SelectItem>
                            <SelectItem value='category:primary'>
                                Primary
                            </SelectItem>
                            <SelectItem value='category:social'>
                                Social
                            </SelectItem>
                            <SelectItem value='category:promotions'>
                                Promotions
                            </SelectItem>
                            <SelectItem value='label:work'>Work</SelectItem>
                            <SelectItem value='label:personal'>
                                Personal
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.dateRange ?? ''}
                        onValueChange={val =>
                            handleChange('dateRange', val || null)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Select Date Range' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='newer_than:7d'>
                                Last 7 days
                            </SelectItem>
                            <SelectItem value='older_than:30d'>
                                Older than 30 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex justify-end space-x-2'>
                    <Button
                        variant='secondary'
                        onClick={() =>
                            setFilters({
                                from: '',
                                to: '',
                                subject: '',
                                hasAttachment: null,
                                label: null,
                                dateRange: null,
                            })
                        }
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            onApply(filters);
                            setOnModalOpen(false);
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
