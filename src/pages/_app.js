import '../styles/globals.css';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationCenter from '../components/NotificationCenter';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Head>
          <title>EcoCommute - Sustainable Transportation Solution</title>
          <meta name="description" content="Optimize your commute with carpooling and smart parking solutions" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={inter.className}>
          <NotificationCenter />
          <Component {...pageProps} />
        </main>
      </NotificationProvider>
    </AuthProvider>
  );
} 