
"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';

// 1. Create a context for the unread count
const UnreadChatContext = createContext<{ count: number }>({ count: 0 });

// Custom hook to use the context
export const useUnreadChatCount = () => useContext(UnreadChatContext);


function ChatNotificationListener() {
    const { toast, dismiss } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const activeToasts = useRef(new Map<string, string>()); // Map<sessionId, toastId>

    useEffect(() => {
        const sessionsCollection = collection(db, 'chatSessions');
        // Listen for any session that has unread messages for the admin
        const q = query(sessionsCollection, where('adminUnread', '==', true));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                 const session = { id: change.doc.id, ...change.doc.data() } as ChatSession;
                 const existingToastId = activeToasts.current.get(session.id);
                 
                // Only show notification for new messages or newly unread sessions
                if ((change.type === "added" || change.type === "modified") && pathname !== '/admin/chat') {
                    
                    if (existingToastId) {
                        // If a toast for this session is already active, update it
                        toast({
                           id: existingToastId,
                           title: (
                                <div className="flex items-center font-bold">
                                    <MessageSquare className="mr-2 h-5 w-5 text-accent" />
                                    New Message
                                </div>
                            ),
                            description: `New message from ${session.userName}.`,
                        });
                    } else {
                        // Otherwise, create a new toast
                       const { id: newToastId } = toast({
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
                                        dismiss(newToastId); 
                                    }}
                                >
                                    View Chat
                                </Button>
                            ),
                            duration: 20000, // Increased duration
                            onDismiss: () => activeToasts.current.delete(session.id),
                            onAutoClose: () => activeToasts.current.delete(session.id),
                        });
                        activeToasts.current.set(session.id, newToastId);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [pathname, router, toast, dismiss]);

    return null; // This component does not render anything itself
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);
  
  // Set up a listener for the unread count for the context provider
  useEffect(() => {
    if (!isVerified) return;

    const chatSessionsCollection = collection(db, 'chatSessions');
    const q = query(chatSessionsCollection, where('adminUnread', '==', true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadChatCount(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [isVerified]);


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
            <ChatNotificationListener />
            <main className="flex-1">
                {children}
            </main>
        </div>
    </UnreadChatContext.Provider>
  );
}
