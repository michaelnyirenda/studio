import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenText, Users, ShieldCheck, Home } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-headline hover:text-accent transition-colors">
          EduNexus
        </Link>
        <div className="space-x-2">
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-accent" asChild>
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Home
            </Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-accent" asChild>
            <Link href="/forum/create">
              <BookOpenText className="mr-2 h-5 w-5" /> Forum
            </Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-accent" asChild>
            <Link href="/attendance">
              <Users className="mr-2 h-5 w-5" /> Attendance
            </Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-accent" asChild>
            <Link href="/hiv-screening">
              <ShieldCheck className="mr-2 h-5 w-5" /> HIV Screening
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
