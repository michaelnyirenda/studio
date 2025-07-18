
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, ShieldCheck, Home, ClipboardList, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: <Home /> },
    { href: "/forum", label: "Forum", icon: <BookOpenText /> },
    { href: "/hiv-screening", label: "Screening", icon: <ShieldCheck /> },
    { href: "/referrals", label: "Referrals", icon: <ClipboardList /> },
    { href: "/chat", label: "Chat", icon: <MessageSquare /> },
  ];

  // Do not render the client navbar on any admin pages.
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-5 left-0 right-0 z-50 h-20 border-t bg-card/90 backdrop-blur-lg">
      <div className="mx-auto flex h-full max-w-md items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 px-1 py-1 text-center transition-colors focus:outline-none focus-visible:bg-accent/50"
            >
              <div
                className={cn(
                  "flex h-7 items-center justify-center rounded-full px-4 transition-all duration-300",
                  isActive ? "bg-secondary" : ""
                )}
              >
                {React.cloneElement(item.icon, {
                  className: cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  ),
                })}
              </div>
              <span className={cn(
                "text-xs font-bold transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
