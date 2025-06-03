import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/shared/navbar';

export const metadata: Metadata = {
  title: 'EduNexus',
  description: 'Educational Platform for community engagement and health awareness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {/* Navbar is now at the bottom */}
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20"> {/* Added pb-20 for bottom nav */}
          {children}
        </main>
        <Toaster />
        <Navbar /> {/* Moved Navbar to the end of body */}
      </body>
    </html>
  );
}
