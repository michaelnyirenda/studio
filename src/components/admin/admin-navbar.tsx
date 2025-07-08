
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MessageSquareText,
  UserCog,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/referrals', label: 'Referrals', icon: ClipboardList },
    { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
    { href: '/admin/forum-management', label: 'Forum', icon: MessageSquareText },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/data-export', label: 'Data Export', icon: FileSpreadsheet },
];

export default function AdminNavbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        router.push('/admin/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 items-center">
                
                {/* Left Aligned Items */}
                <div className="flex flex-1 justify-start">
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="w-12 rounded-lg">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open navigation menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-[95vw] max-w-[280px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                            >
                                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild className="w-full py-4 text-2xl">
                                        <Link href={item.href} className="flex items-center text-primary font-semibold">
                                            <item.icon className="mr-4 h-8 w-8" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Centered Desktop Navigation */}
                <div className="flex flex-1 justify-center">
                    <nav className="hidden items-center justify-center gap-x-8 text-sm font-medium md:flex">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-secondary text-primary font-bold'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right Aligned Items */}
                <div className="flex flex-1 justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative flex items-center gap-2 p-1 h-auto rounded-full">
                               <Avatar className="h-9 w-9">
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start leading-tight">
                                    <span className="text-sm font-medium">Admin User</span>
                                    <span className="text-xs text-muted-foreground">admin@ibreakfree.com</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                    admin@ibreakfree.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer py-4 text-xl">
                                <Link href="/admin/user-management" className="flex items-center font-semibold">
                                    <UserCog className="mr-4 h-6 w-6" />
                                    <span>User Management</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-4 text-xl text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center font-semibold">
                                <LogOut className="mr-4 h-6 w-6" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
