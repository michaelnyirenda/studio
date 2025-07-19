
"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Footer from "@/components/shared/footer";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const notifiedSessionIds = useRef(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If the user is not logged in, redirect to the login page
        router.replace('/admin/login');
      } else {
        setIsVerified(true);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    if (!isVerified) return;

    const sessionsCollection = collection(db, 'chatSessions');
    const q = query(sessionsCollection, where('adminUnread', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hasUnread = !snapshot.empty;
      
      if (hasUnread && pathname !== '/admin/chat') {
        setShowNotificationBadge(true);
      } else {
        setShowNotificationBadge(false);
      }
      
      const changes = snapshot.docChanges();

      if (pathname !== '/admin/chat') {
          changes.forEach((change) => {
              if ((change.type === 'added' || change.type === 'modified') && !notifiedSessionIds.current.has(change.doc.id)) {
                  const session = { id: change.doc.id, ...change.doc.data() } as ChatSession;
                  notifiedSessionIds.current.add(session.id);

                  const { dismiss } = toast({
                      title: (
                          <div className="flex items-center font-bold">
                              <MessageSquare className="mr-2 h-5 w-5 text-accent" />
                              New Chat Message
                          </div>
                      ),
                      description: `New message from ${session.userName}.`,
                      action: (
                          <Button
                              variant="outline"
                              onClick={() => {
                                  router.push(`/admin/chat?sessionId=${session.id}`);
                                  setTimeout(() => dismiss(), 3000);
                              }}
                          >
                              View Chat
                          </Button>
                      ),
                      duration: Infinity,
                      onDismiss: () => notifiedSessionIds.current.delete(session.id),
                      onAutoClose: () => notifiedSessionIds.current.delete(session.id),
                  });
              }
          });
      }
    });

    return () => unsubscribe();
  }, [isVerified, pathname, router, toast]);

  useEffect(() => {
    if (pathname === '/admin/chat') {
      setShowNotificationBadge(false);
    }
  }, [pathname]);


  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
        <AdminNavbar showNotificationBadge={showNotificationBadge} />
        <main className="flex-1">
            {children}
        </main>
        <Footer />
    </div>
  );
}
