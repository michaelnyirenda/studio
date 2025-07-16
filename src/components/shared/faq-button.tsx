
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

export default function FaqButton() {
    const pathname = usePathname();

    if (pathname.startsWith('/admin') || pathname === '/faq') {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/faq" passHref>
                        <Button
                        variant="outline"
                        aria-label="Frequently Asked Questions"
                        className={cn(
                            "fixed h-16 w-16 p-0 rounded-full shadow-2xl bg-card hover:bg-secondary border-4 border-primary z-50 flex items-center justify-center group",
                            "bottom-24 right-4", // Mobile position
                            "md:top-8 md:right-8"   // Desktop position
                        )}
                        >
                        <HelpCircle className="h-12 w-12 text-primary transition-transform group-hover:scale-110" strokeWidth={3} />
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>FAQs</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
