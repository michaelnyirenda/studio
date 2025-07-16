
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';


export default function ChatStatsCard() {
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const sessionsCollection = collection(db, 'chatSessions');
    const q = query(sessionsCollection, where('adminUnread', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const hasUnread = !snapshot.empty;
        if (hasUnread && pathname !== '/admin/chat') {
            setShowNotificationBadge(true);
        } else {
            setShowNotificationBadge(false);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching unread chat count:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/chat') {
        setShowNotificationBadge(false);
    }
  }, [pathname]);


  if (loading) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold text-primary">Live Chat</CardTitle>
            <div className="p-3 bg-secondary rounded-xl">
                <MessageSquare className="h-6 w-6 text-primary" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter className="pt-2 mt-auto">
            <Skeleton className="h-6 w-40" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Link href="/admin/chat" passHref className="block h-full group">
      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card hover:-translate-y-1.5 relative">
        {showNotificationBadge && (
          <Badge className="absolute top-4 right-4 animate-in fade-in zoom-in bg-accent text-accent-foreground text-base px-3 py-1">
            1 New
          </Badge>
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-primary">Live Chat</CardTitle>
           <div className="p-3 bg-secondary rounded-xl">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Respond to live user conversations and provide support.
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end">
          <div className="flex items-center text-accent font-semibold">
            <span>Open Chat</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
