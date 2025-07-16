
"use client";

import AdminNavbar from "@/components/admin/admin-navbar";
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';

function ChatNotificationListener() {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const mountTimeRef = useRef(new Date());

    useEffect(() => {
        const sessionsCollection = collection(db, 'chatSessions');
        // Listen for new sessions created after the component has mounted.
        const q = query(sessionsCollection, where('createdAt', '>', mountTimeRef.current));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const newSession = { id: change.doc.id, ...change.doc.data() } as ChatSession;
                    // Avoid showing a notification if we're already in the chat view
                    if (pathname !== '/admin/chat') {
                       toast({
                            title: (
                                <div className="flex items-center font-bold">
                                    <MessageSquare className="mr-2 h-5 w-5 text-accent" />
                                    New Chat Session Started
                                </div>
                            ),
                            description: `${newSession.userName} has started a new conversation.`,
                            action: (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/admin/chat?sessionId=${newSession.id}`)}
                                >
                                    View Chat
                                </Button>
                            ),
                            duration: 15000,
                        });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [pathname, router, toast]);

    return null; // This component does not render anything itself
}


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
      <ChatNotificationListener />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
