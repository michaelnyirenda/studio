
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatSession } from '@/lib/types';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2, Trash2, XCircle } from 'lucide-react';
import ChatInterface from '@/components/chat/chat-interface';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteChatSessionAction } from './actions';

type ClientChatSession = Omit<ChatSession, 'lastMessageAt'> & { lastMessageAt: string };

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ClientChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ClientChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<ClientChatSession | null>(null);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdFromUrl = useMemo(() => searchParams.get('sessionId'), [searchParams]);

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
      
      // Handle initial selection from URL if it exists
      if (sessionIdFromUrl) {
          const sessionToSelect = sessionsData.find(s => s.id === sessionIdFromUrl);
          if (sessionToSelect) {
            handleSelectSession(sessionToSelect);
          }
          // Clean the URL by replacing the current history entry
          const newUrl = window.location.pathname;
          window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    }, (error) => {
      console.error("Error fetching chat sessions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSession = async (session: ClientChatSession) => {
    setSelectedSession(session);
    // Mark the session as read by the admin ONLY when it's clicked.
    if (session.adminUnread) {
        try {
            const sessionRef = doc(db, 'chatSessions', session.id);
            await updateDoc(sessionRef, { adminUnread: false });
        } catch (error) {
            console.error("Error marking session as read:", error);
        }
    }
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;

    const result = await deleteChatSessionAction(sessionToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      if (selectedSession?.id === sessionToDelete.id) {
          setSelectedSession(null);
      }
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setSessionToDelete(null); // Close the dialog
  };

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
                            <div
                                key={session.id}
                                className={cn(
                                    "flex items-center justify-between w-full text-left p-3 border-b hover:bg-muted/50 transition-colors",
                                    selectedSession?.id === session.id && "bg-secondary",
                                    session.status === 'closed' && "opacity-60"
                                )}
                            >
                                <button
                                  onClick={() => handleSelectSession(session)}
                                  className="flex flex-grow items-center gap-3 overflow-hidden text-left"
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
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                                    )}
                                </button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                                  onClick={() => setSessionToDelete(session)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Chat</span>
                                </Button>
                            </div>
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

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat session with "{sessionToDelete?.userName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Yes, delete chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
