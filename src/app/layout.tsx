import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/shared/navbar';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import FaqButton from '@/components/shared/faq-button';

export const metadata: Metadata = {
  title: '#iBreakFree',
  description: 'Educational Platform for community engagement and health awareness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Quicksand:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
          <AnimatedBackground />
          <main className="flex-grow z-10">
            {children}
          </main>
          <Toaster />
          <FaqButton />
          <Navbar />
      </body>
    </html>
  );
}
