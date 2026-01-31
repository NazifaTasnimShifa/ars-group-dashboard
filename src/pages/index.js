// src/pages/index.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to the login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
    </div>
  );
}
