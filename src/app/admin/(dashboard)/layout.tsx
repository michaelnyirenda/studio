"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
