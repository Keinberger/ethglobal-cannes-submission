import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="flex items-center px-4 py-4 bg-white shadow-sm z-20">
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
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition justify-end">
            Login
          </button>
        </header>
        {children}
      </body>
    </html>
  );
}
