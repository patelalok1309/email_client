'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@radix-ui/react-label';
import { redirect } from 'next/navigation';

export default function EmailList({
    data,
    setSelectedMessageIds,
    selectedMessageIds,
}: any) {
    const handleClick = (id: string) => {
        redirect(`/inbox/${id}`);
    };

    return (
        <Table className='border border-gray-300 overflow-auto !rounded-lg'>
            <TableCaption>Your inbox</TableCaption>
            <TableHeader className='rounded-lg'>
                <TableRow>
                    <TableHead>Sr no</TableHead>
                    <TableHead>
                        <Checkbox
                            onCheckedChange={checked => {
                                return checked
                                    ? setSelectedMessageIds(
                                          data.map((item: any) => item.id)
                                      )
                                    : setSelectedMessageIds([]);
                            }}
                        />
                    </TableHead>
                    <TableHead className='w-[100px]'>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className='text-right'>Label</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data &&
                    data.length > 0 &&
                    data?.map((item: any, index: number) => {
                        const isRead = item.labels?.includes('UNREAD');
                        return (
                            <TableRow
                                key={item.id}
                                className='hover:bg-gray-300 hover:cursor-pointer'
                            >
                                <TableCell>{index + 1}.</TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMessageIds.includes(
                                            item.id
                                        )}
                                        onCheckedChange={checked => {
                                            return checked
                                                ? setSelectedMessageIds([
                                                      ...selectedMessageIds,
                                                      item.id,
                                                  ])
                                                : setSelectedMessageIds(
                                                      selectedMessageIds.filter(
                                                          (id: any) =>
                                                              item.id !== id
                                                      )
                                                  );
                                        }}
                                    />
                                </TableCell>

                                <TableCell
                                    className={`${isRead ? 'font-bold' : ''}`}
                                >
                                    {item.from?.split('<')[0] || 'Unknown'}
                                </TableCell>
                                <TableCell
                                    //@ts-ignore
                                    className={`hover:underline ${isRead ? 'font-bold' : ''}`}
                                    onClick={() => handleClick(item.id)}
                                >
                                    {item.subject}
                                </TableCell>
                                <TableCell>
                                    {new Date(item.date).toLocaleDateString(
                                        'en-GB',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                        }
                                    )}
                                </TableCell>
                                <TableCell className='text-right'>
                                    {Array.from(item.labels || []).map(
                                        label => {
                                            return (
                                                <Badge
                                                    variant={'secondary'}
                                                    key={String(label)}
                                                >
                                                    {String(label)}
                                                </Badge>
                                            );
                                        }
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
            </TableBody>
        </Table>
    );
}
