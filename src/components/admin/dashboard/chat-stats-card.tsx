"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatStatsCard() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chatSessionsCollection = collection(db, 'chatSessions');
    const q = query(chatSessionsCollection, where('adminUnread', '==', true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadCount(querySnapshot.size);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching unread chat count:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-primary">Live Chat</CardTitle>
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
        {unreadCount > 0 && (
          <Badge className="absolute top-4 right-4 animate-pulse bg-accent text-accent-foreground text-base px-3 py-1">
            {unreadCount} New
          </Badge>
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium text-primary">Live Chat</CardTitle>
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
