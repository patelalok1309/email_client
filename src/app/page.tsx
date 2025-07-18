import { Button } from '@/components/ui/button';
import { oauth2Client } from '@/lib/google-auth';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

const Page = () => {
    const authorizedURI = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://mail.google.com/'],
    });

    return (
        <div className='min-h-screen w-full grid place-items-center'>
            <Link href={authorizedURI}>
                <Button>
                    <FcGoogle className='mr-2' />
                    Login with google
                </Button>
            </Link>
        </div>
    );
};

export default Page;
