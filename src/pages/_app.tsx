
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AppProviders } from '@/contexts/AppProviders';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
