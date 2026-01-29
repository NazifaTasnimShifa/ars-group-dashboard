// src/pages/lube/index.js
// ARS Lube - Landing Page (redirects to dashboard or shows overview)

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LubeIndexPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main Lube page (Sales Orders is the default)
        router.replace('/lube/sales-orders');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Redirecting to Lube Operations...</p>
        </div>
    );
}
