
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  UserCog,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/referrals', label: 'Referrals', icon: ClipboardList },
    { href: '/admin/data-export', label: 'Data Export', icon: FileSpreadsheet },
    { href: '/admin/forum-management', label: 'Forum', icon: MessageSquareText },
    { href: '/admin/user-management', label: 'Users', icon: UserCog },
];

export default function AdminNavbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/admin/dashboard" className="mr-6 flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="font-bold">E</span>
                        </div>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navItems.map((item) => (
                             <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                'transition-colors hover:text-primary',
                                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative flex items-center gap-2 p-1 h-auto">
                               <Avatar className="h-9 w-9">
                                    <AvatarImage src="https://placehold.co/100x100.png" alt="@admin" data-ai-hint="person avatar" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start leading-tight">
                                    <span className="text-sm font-medium">Admin User</span>
                                    <span className="text-xs text-muted-foreground">admin@edunexus.com</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                    admin@edunexus.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                 <Link href="/admin/login">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
