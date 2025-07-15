import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/shared/navbar';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/faq" passHref>
                  <Button
                    aria-label="Frequently Asked Questions"
                    className="fixed bottom-24 left-8 h-16 w-16 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 flex items-center justify-center"
                  >
                    <HelpCircle className="h-8 w-8" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-primary text-primary-foreground">
                <p>Frequently Asked Questions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Navbar />
      </body>
    </html>
  );
}
