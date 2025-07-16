
"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';

// 1. Create a context for the unread count
const UnreadChatContext = createContext<{ count: number }>({ count: 0 });

// Custom hook to use the context
export const useUnreadChatCount = () => useContext(UnreadChatContext);

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const notifiedSessionIds = useRef(new Set());


  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);
  
  // Centralized listener for unread chats
  useEffect(() => {
    if (!isVerified) return;

    const sessionsCollection = collection(db, 'chatSessions');
    const q = query(sessionsCollection, where('adminUnread', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadChatCount(snapshot.size);

        // Only show toast notifications if not on the chat page
        if (pathname !== '/admin/chat') {
            snapshot.docChanges().forEach((change) => {
                const session = { id: change.doc.id, ...change.doc.data() } as ChatSession;

                // Notify for new or modified unread sessions
                if ((change.type === 'added' || change.type === 'modified') && !notifiedSessionIds.current.has(session.id)) {
                    notifiedSessionIds.current.add(session.id); // Mark as notified

                    const { id: toastId } = toast({
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
                                }}
                            >
                                View Chat
                            </Button>
                        ),
                        duration: 15000,
                        onDismiss: () => notifiedSessionIds.current.delete(session.id),
                        onAutoClose: () => notifiedSessionIds.current.delete(session.id),
                    });
                }
            });
        }
    });

    return () => unsubscribe();
  }, [isVerified, pathname, router, toast]);


  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UnreadChatContext.Provider value={{ count: unreadChatCount }}>
        <div className="flex min-h-screen flex-col">
            <AdminNavbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    </UnreadChatContext.Provider>
  );
}
