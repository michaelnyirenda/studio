
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
import { Badge } from '../ui/badge';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/referrals', label: 'Referrals', icon: ClipboardList },
    { href: '/admin/chat', label: 'Chat', icon: MessageSquare, id: 'chat-nav' },
    { href: '/admin/forum-management', label: 'Forum', icon: MessageSquareText },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/data-export', label: 'Data Export', icon: FileSpreadsheet },
];

interface AdminNavbarProps {
    showNotificationBadge: boolean;
}

export default function AdminNavbar({ showNotificationBadge }: AdminNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        router.push('/admin/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                
                {/* Left Aligned Items */}
                <div className="flex items-center gap-x-3">
                     {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-md border-2 border-primary">
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
                                    <DropdownMenuItem key={item.href} asChild className="w-full py-2 text-sm">
                                        <Link href={item.href} className="relative flex items-center font-semibold text-primary">
                                            <item.icon className="mr-3 h-4 w-4" />
                                            <span>{item.label}</span>
                                            {item.id === 'chat-nav' && showNotificationBadge && (
                                                <Badge variant="destructive" className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 animate-in fade-in zoom-in">1 New</Badge>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-x-2 text-sm font-medium md:flex">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors border-2',
                                        isActive
                                            ? 'bg-secondary text-primary font-bold border-primary/20'
                                            : 'text-muted-foreground hover:bg-muted/50 border-transparent hover:border-primary/20'
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                     {item.id === 'chat-nav' && showNotificationBadge && (
                                        <Badge variant="destructive" className="absolute -top-2 -right-2 transition-all duration-300 animate-in fade-in zoom-in text-xs">New</Badge>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right Aligned Items */}
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative flex items-center gap-2 p-1 h-auto rounded-full border-2 border-primary">
                               <Avatar className="h-8 w-8">
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start leading-tight">
                                    <span className="text-sm font-medium">Admin User</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="w-full py-2 text-base">
                                <Link href="/admin/user-management" className="cursor-pointer flex items-center font-bold">
                                    <UserCog className="mr-3 h-5 w-5" />
                                    <span>User Management</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="w-full py-2.5 text-base text-destructive focus:text-destructive cursor-pointer flex items-center font-bold">
                                <LogOut className="mr-3 h-5 w-5" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
