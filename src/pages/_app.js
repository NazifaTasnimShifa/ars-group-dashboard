// src/pages/_app.js

import '@/lib/chart-js-init'; // NEW: This line registers Chart.js
import '@/styles/globals.css';
import { AppProvider } from '@/contexts/AppContext';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;