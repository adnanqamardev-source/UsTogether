import '@/app/globals.css';
import Providers from './providers';
import { Inter } from 'next/font/google';

// Load the font optimally at build time to eliminate FOUT and CLS
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-space-bg text-slate-100 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

