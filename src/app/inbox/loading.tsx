import React from 'react';

const Loading = () => {
    return (
        <div className='min-h-screen w-full flex flex-col justify-center items-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
            <p className='text-lg text-center mt-4'>Loading...</p>
        </div>
    );
};

export default Loading;
