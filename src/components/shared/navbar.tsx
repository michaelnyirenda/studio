
import Link from 'next/link';
import { BookOpenText, ShieldCheck, Home, ClipboardList, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5" /> },
    { href: "/forum", label: "Forum", icon: <BookOpenText className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5" /> },
    { href: "/hiv-screening", label: "Screening", icon: <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5" /> },
    { href: "/referrals", label: "Referrals", icon: <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5" /> },
    { href: "/chat", label: "Chat", icon: <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground border-t border-primary-foreground/10 shadow-[0_-2px_6px_rgba(0,0,0,0.1)]">
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <a className="flex flex-1 flex-col items-center justify-center text-center px-1 py-2 text-primary-foreground hover:bg-primary/80 hover:text-accent focus:outline-none focus:bg-primary/80 focus:text-accent rounded-none transition-colors">
              {item.icon}
              <span className="text-xs truncate pt-0.5">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
