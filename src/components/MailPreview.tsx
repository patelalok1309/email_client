'use client';
import { ParsedEmailPart } from '@/app/actions/extractMessageParts';
import { CreateEmailReplyModal } from '@/app/inbox/components/CreateEmailReplyModal';
import ForwardEmailModal from '@/app/inbox/components/ForwardEmailModal';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { UserCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';

const MailPreview = ({ data, accessToken }: any) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Extract HTML email body only when `data` changes
    const htmlPart = useMemo(
        () => data?.parts?.find((part: any) => part.mimeType === 'text/html'),
        [data]
    );

    useEffect(() => {
        if (!iframeRef.current || !htmlPart) return;

        const sanitizedHtml = htmlPart.data || 'No content available';
        const iframe = iframeRef.current;
        const iframeDocument = iframe.contentDocument;

        if (iframeDocument) {
            iframeDocument.open();
            iframeDocument.write(`<html><body>${sanitizedHtml}</body></html>`);
            iframeDocument.close();

            // Resize iframe dynamically
            setTimeout(() => {
                iframe.style.height = `${iframe.contentWindow?.document.body.scrollHeight}px`;
            }, 100);
        }
    }, [htmlPart]);

    if (!data) return <div className='text-center py-6'>No data available</div>;

    return (
        <div className='min-w-full px-6 py-4'>
            {/* Back Button */}
            <div className='mb-4 flex items-center'>
                <button
                    className='p-2 hover:bg-gray-200 rounded-full'
                    onClick={() => redirect('/inbox')}
                >
                    <FaArrowLeft className='w-5 h-5' />
                </button>
            </div>

            {/* Email Details */}
            <Card className='shadow-md'>
                <CardContent>
                    <div className='mb-4'>
                        <h2
                            className='font-semibold text-xl pb-2 px-4'
                            dangerouslySetInnerHTML={{
                                __html: data?.snippet || 'No subject',
                            }}
                        />

                        <div className='flex items-center space-x-2 px-4'>
                            <UserCircle className='text-gray-300 w-6 h-6' />
                            <div className='text-sm'>
                                <p className='text-gray-700'>
                                    From: {data?.from || 'Unknown'}
                                </p>
                                <p className='text-gray-600'>
                                    To: {data?.to || 'Unknown'}
                                </p>
                                <p className='text-xs text-gray-500'>
                                    Date: {data?.date || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Email Body */}
                    <div className='mt-4'>
                        <iframe
                            ref={iframeRef}
                            className='w-full min-h-96 border rounded-md'
                            sandbox='allow-same-origin allow-popups'
                        />
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 mt-4'>
                        <CreateEmailReplyModal
                            data={data}
                            accessToken={accessToken}
                        />
                        <ForwardEmailModal
                            data={data}
                            accessToken={accessToken}
                        />
                    </div>

                    {/* Attachments */}
                    {data.parts?.length > 0 && (
                        <div className='mt-6'>
                            <h3 className='text-lg font-semibold mb-3'>
                                Attachments
                            </h3>

                            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                                {data.parts.map(
                                    (part: ParsedEmailPart, index: number) => {
                                        const isImage =
                                            part.mimeType?.startsWith('image/');
                                        const isPDF =
                                            part.mimeType === 'application/pdf';

                                        if (!isImage && !isPDF) return null;

                                        return (
                                            <div
                                                key={index}
                                                className='p-3 border rounded-lg shadow bg-white flex flex-col items-center hover:shadow-lg transition-all'
                                            >
                                                {/* Image Preview */}
                                                {isImage && (
                                                    <img
                                                        className='w-full h-[180px] object-cover rounded-md'
                                                        src={part.data}
                                                        alt='Attachment'
                                                        loading='lazy'
                                                    />
                                                )}

                                                {/* PDF Icon */}
                                                {isPDF && (
                                                    <div className='w-full h-[180px] flex items-center justify-center bg-gray-200 rounded-md'>
                                                        <FaFilePdf className='w-6 h-6' />
                                                    </div>
                                                )}

                                                {/* Filename */}
                                                <p className='mt-2 text-sm font-medium text-gray-700 truncate w-full text-center'>
                                                    {part.filename ||
                                                        'Attachment'}
                                                </p>

                                                {/* Download Button */}
                                                <a
                                                    href={part.data} // Base64 data URL
                                                    download={
                                                        part.filename ||
                                                        'downloaded-file'
                                                    }
                                                    className='mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all'
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MailPreview;
