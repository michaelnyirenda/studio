
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatSession } from '@/lib/types';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2, XCircle } from 'lucide-react';
import ChatInterface from '@/components/chat/chat-interface';
import { formatDistanceToNow } from 'date-fns';

type ClientChatSession = Omit<ChatSession, 'lastMessageAt'> & { lastMessageAt: string };

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ClientChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ClientChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionsCollection = collection(db, 'chatSessions');
    const q = query(sessionsCollection, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData: ClientChatSession[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as ChatSession;
        return {
          ...data,
          id: doc.id,
          lastMessageAt: data.lastMessageAt ? formatDistanceToNow((data.lastMessageAt as Timestamp).toDate(), { addSuffix: true }) : 'N/A',
        };
      });
      setSessions(sessionsData);
      setLoading(false);
      
      // Smartly update or set the selected session
      if (!selectedSession && sessionsData.length > 0) {
        setSelectedSession(sessionsData[0]);
      } else if (selectedSession) {
          const updatedSelected = sessionsData.find(s => s.id === selectedSession.id);
          if (updatedSelected) {
            setSelectedSession(updatedSelected);
          } else if (sessionsData.length > 0) {
            // If the previously selected session is gone, select the first available one.
            setSelectedSession(sessionsData[0]);
          } else {
            setSelectedSession(null);
          }
      }
    }, (error) => {
      console.error("Error fetching chat sessions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Only run once on mount


  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Admin Chat"
        description="View and respond to user conversations."
      />

      <Card className="mt-8 shadow-xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[75vh]">
            {/* Session List */}
            <div className="border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                </div>
                <ScrollArea className="flex-grow">
                    {loading ? (
                        <div className="flex items-center justify-center h-full p-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="p-4 text-sm text-center text-muted-foreground">No active chats.</p>
                    ) : (
                        sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={cn(
                                    "flex items-center gap-3 w-full text-left p-3 border-b hover:bg-muted/50 transition-colors",
                                    selectedSession?.id === session.id && "bg-secondary",
                                    session.status === 'closed' && "opacity-60"
                                )}
                            >
                                <Avatar>
                                    <AvatarFallback>{session.userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                      <p className="font-semibold truncate">{session.userName}</p>
                                      <p className="text-xs text-muted-foreground shrink-0">{session.lastMessageAt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    {session.status === 'closed' && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                                    <p className={cn(
                                        "text-sm text-muted-foreground truncate",
                                        session.adminUnread && "font-bold text-primary"
                                    )}>
                                        {session.lastMessageText}
                                    </p>
                                    </div>
                                </div>
                                {session.adminUnread && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 ml-auto" />
                                )}
                            </button>
                        ))
                    )}
                </ScrollArea>
            </div>
            
            {/* Chat View */}
            <div className="hidden md:block">
                {selectedSession ? (
                    <ChatInterface 
                        key={selectedSession.id} // Add key to force re-render
                        userId={selectedSession.userId} 
                        isClientSide={false} 
                        sessionId={selectedSession.id} 
                    />
                ) : !loading && sessions.length > 0 ? (
                     <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a conversation to view messages.</p>
                    </div>
                ): !loading && sessions.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No conversations yet.</p>
                    </div>
                ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
