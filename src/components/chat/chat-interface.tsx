
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, where, onSnapshot, getDocs, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatMessageSchema, type ChatMessageFormData } from '@/lib/schemas';
import type { ChatMessage } from '@/lib/types';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { sendMessageAction } from '@/app/chat/actions';

interface ChatInterfaceProps {
  userId: string;
  isClientSide: boolean;
  selectedSessionId?: string;
}

export default function ChatInterface({ userId, isClientSide, selectedSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(selectedSessionId || null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<ChatMessageFormData>({
    resolver: zodResolver(ChatMessageSchema),
    defaultValues: { message: '' },
  });
  const { isSubmitting } = form.formState;

  useEffect(() => {
    const findOrCreateSession = async () => {
      if (isClientSide) {
        const chatsCollection = collection(db, 'chatSessions');
        const q = query(chatsCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setSessionId(querySnapshot.docs[0].id);
        } else {
          setLoading(false);
        }
      } else {
         setSessionId(selectedSessionId || null);
      }
    };
    findOrCreateSession();
  }, [userId, isClientSide, selectedSessionId]);
  
  useEffect(() => {
     if (!sessionId) {
      setLoading(false);
      setMessages([]);
      return;
    }
    setLoading(true);

    const sessionRef = doc(db, 'chatSessions', sessionId);
    const messagesCollection = collection(sessionRef, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setLoading(false);

      if (isClientSide) {
         await updateDoc(sessionRef, { userUnread: false });
      } else {
         await updateDoc(sessionRef, { adminUnread: false });
      }

    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, isClientSide]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, loading]);

  const onSubmit = async (data: ChatMessageFormData) => {
    if (!isClientSide) return;
    form.reset();
    await sendMessageAction(data);
    
    // If it was the first message, we need to get the new session ID
    if (!sessionId) {
        const chatsCollection = collection(db, 'chatSessions');
        const q = query(chatsCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setSessionId(querySnapshot.docs[0].id);
        }
    }
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg bg-card shadow-lg">
      <div className="flex-grow">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {isClientSide ? 'Send a message to start the conversation.' : 'No messages in this conversation yet.'}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => {
                const isUser = message.senderType === 'user';
                return (
                  <div key={message.id} className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                    {!isUser && (
                      <Avatar className="h-8 w-8 self-start">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 text-card-foreground shadow',
                      isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                    )}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                     {isUser && (
                      <Avatar className="h-8 w-8 self-start">
                         <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {isClientSide && (
        <div className="p-4 border-t bg-background/80">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Type your message..." {...field} autoComplete="off" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}

    