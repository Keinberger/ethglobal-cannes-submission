import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import Providers from './providers';
import LoginButton from './components/LoginButton';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Opinionmarket',
  description: 'Global opinion layer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
        <Providers>
          <header className="flex items-center px-4 py-4 shadow-lg z-20 bg-white">
            <Link href="/">
              <Image
                src="/opinionmarket.png"
                width={100}
                height={100}
                alt="opinionmarket Logo"
                className="h-8 w-auto mr-4"
                priority
              />
            </Link>
            <div className="flex-grow" />
            <LoginButton />
          </header>
          <div className="bg-gradient-to-br from-slate-100 to-purple-100">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
