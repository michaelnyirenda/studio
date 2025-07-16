
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export default function FaqButton() {
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <Link href="/faq" passHref>
            <Button
            variant="outline"
            aria-label="Frequently Asked Questions"
            className="fixed top-8 right-8 h-16 w-16 p-0 rounded-full shadow-2xl bg-card hover:bg-secondary border-4 border-primary z-50 flex items-center justify-center group"
            >
            <HelpCircle className="h-12 w-12 text-primary transition-transform group-hover:scale-110" strokeWidth={3} />
            </Button>
        </Link>
    );
}
