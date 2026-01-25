// src/pages/_app.js

import '@/lib/chart-js-init';
import '@/styles/globals.css';
import { AppProvider } from '@/contexts/AppContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/router';

const publicPages = ['/login'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AppProvider>
      {publicPages.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AppProvider>
  );
}

export default MyApp;