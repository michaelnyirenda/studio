
"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';

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
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedSessionIds = useRef(new Set());

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);
  
  // Centralized listener for new/unread chats
  useEffect(() => {
    if (!isVerified) return;

    const sessionsCollection = collection(db, 'chatSessions');
    // Listen to any session that becomes unread for the admin
    const q = query(sessionsCollection, where('adminUnread', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges();
        
        // Only trigger notifications for new messages, not initial data load
        if (changes.length > 0 && changes.some(c => c.type === 'added' || c.type === 'modified')) {
            // Trigger the visual badge indicator
            setShowNotificationBadge(true);
            
            // Clear any existing timer to reset the fade-out duration
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
            // Set the badge to disappear after 5 seconds
            notificationTimerRef.current = setTimeout(() => {
                setShowNotificationBadge(false);
            }, 5000);
        }

        // Handle toast pop-up notifications
        if (pathname !== '/admin/chat') {
            changes.forEach((change) => {
                // Show a toast only for newly unread messages
                if ((change.type === 'added' || change.type === 'modified') && !notifiedSessionIds.current.has(change.doc.id)) {
                    const session = { id: change.doc.id, ...change.doc.data() } as ChatSession;
                    notifiedSessionIds.current.add(session.id); // Mark as notified for this browser session

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
                                    // Dismiss the toast after a delay when clicked
                                    setTimeout(() => {
                                        dismiss();
                                        notifiedSessionIds.current.delete(session.id);
                                    }, 3000);
                                }}
                            >
                                View Chat
                            </Button>
                        ),
                        duration: Infinity, // Make the toast persist until acted upon
                        onDismiss: () => notifiedSessionIds.current.delete(session.id),
                        onAutoClose: () => notifiedSessionIds.current.delete(session.id),
                    });
                }
            });
        }
    });

    return () => {
        unsubscribe();
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
    };
  }, [isVerified, pathname, router, toast]);


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
    </div>
  );
}
