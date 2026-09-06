import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AlphaArena | The Global Trading Tournament & Competition Directory',
  description: 'Aggregating live, upcoming, and ended competitive trading tournaments from crypto exchanges, forex brokers, prop firms, and offline championships. Live countdowns, verified legitimacy scores, and multi-million dollar prize pools.',
  keywords: [
    'trading tournament',
    'crypto competition',
    'WSOT Bybit',
    'FTMO challenge',
    'forex contest',
    'prop firm tournament',
    'paper trading championship',
    'Binance futures cup'
  ],
  openGraph: {
    title: 'AlphaArena | Global Trading Tournament Directory',
    description: 'Track live crypto battles, forex leagues, prop firm challenges, and paper championships. Over $25M in prizes up for grabs.',
    url: 'https://alphaarena.io',
    siteName: 'AlphaArena',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'AlphaArena Trading Tournaments'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlphaArena | Global Trading Tournament Directory',
    description: 'Track live crypto battles, forex leagues, and prop firm challenges. Discover verified prize pools.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#07080e] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
