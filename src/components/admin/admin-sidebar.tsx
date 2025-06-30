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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarTitle,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/referrals', label: 'Referrals', icon: ClipboardList },
    { href: '/admin/data-export', label: 'Data Export', icon: FileSpreadsheet },
    { href: '/admin/forum-management', label: 'Forum', icon: MessageSquareText },
    { href: '/admin/user-management', label: 'Users', icon: UserCog },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">E</span>
            </div>
            <SidebarTitle>EduNexus Admin</SidebarTitle>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarSeparator/>
            <Link href="/admin/login" passHref>
                <Button variant="ghost" className="w-full justify-start gap-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </Link>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
