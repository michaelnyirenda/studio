
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, Timestamp, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatMessageSchema, type ChatMessageFormData } from '@/lib/schemas';
import type { ChatMessage, ChatSession } from '@/lib/types';
import { Send, Loader2, Bot, User, XCircle } from 'lucide-react';
import { sendMessageAction } from '@/app/chat/actions';
import { sendAdminMessageAction } from '@/app/admin/(dashboard)/chat/actions';

interface ChatInterfaceProps {
  userId: string;
  isClientSide: boolean;
  sessionId: string;
}

export default function ChatInterface({ userId, isClientSide, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'closed'>('active');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<ChatMessageFormData>({
    resolver: zodResolver(ChatMessageSchema),
    defaultValues: { message: '' },
  });
  const { isSubmitting } = form.formState;

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

    const unsubscribeMessages = onSnapshot(q, async (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = (data.createdAt as Timestamp); // Keep as Timestamp for now
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
          } as unknown as ChatMessage;
        });
      setMessages(msgs);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    const unsubscribeSession = onSnapshot(sessionRef, async (sessionDoc) => {
        if(sessionDoc.exists()){
            const sessionData = sessionDoc.data() as ChatSession;
            setSessionStatus(sessionData.status || 'active');

            // Add a small delay before marking as read to avoid race conditions.
            // This ensures the admin has a moment to see the notification before it clears.
            const markAsRead = async () => {
              if (isClientSide && sessionData.userUnread) {
                 await updateDoc(sessionRef, { userUnread: false }).catch(console.error);
              } else if (!isClientSide && sessionData.adminUnread) {
                 // Only update if it's actually unread to prevent unnecessary writes
                 await updateDoc(sessionRef, { adminUnread: false }).catch(console.error);
              }
            };
            
            setTimeout(markAsRead, 2000); // 2-second delay
        }
        setLoading(false);
    });


    return () => {
        unsubscribeMessages();
        unsubscribeSession();
    };
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

    await sendMessageAction(sessionId, userId, data);
  };
  
  const onAdminSubmit = async (data: ChatMessageFormData) => {
    if (isClientSide || !sessionId) return;
    form.reset();
    await sendAdminMessageAction(sessionId, data);
  };

  const isInputDisabled = isSubmitting || (!isClientSide && !sessionId) || sessionStatus === 'closed';

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
                const isUserMessage = message.senderType === 'user';
                return (
                  <div key={message.id} className={cn('flex items-end gap-2', isUserMessage ? 'justify-end' : 'justify-start')}>
                    {!isUserMessage && (
                      <Avatar className="h-8 w-8 self-start">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 text-card-foreground shadow',
                      isUserMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                    )}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                       <p className="text-xs text-right mt-1 opacity-70">
                        {message.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) || 'Sending...'}
                      </p>
                    </div>
                     {isUserMessage && (
                      <Avatar className="h-8 w-8 self-start">
                         <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
               {sessionStatus === 'closed' && (
                  <div className="text-center text-sm text-muted-foreground pt-4 flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4" />
                      This chat has been closed.
                  </div>
               )}
            </div>
          )}
        </ScrollArea>
      </div>
      
       <div className="p-4 border-t bg-background/80">
          <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(isClientSide ? onSubmit : onAdminSubmit)} 
                className="flex items-center gap-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input 
                        placeholder={sessionStatus === 'closed' ? "Chat is closed" : (isClientSide ? "Type your message..." : "Type your response...")} 
                        {...field} 
                        autoComplete="off" 
                        disabled={isInputDisabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isInputDisabled}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
    </div>
  );
}
