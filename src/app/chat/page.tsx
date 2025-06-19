
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ChatMessageSchema, type ChatMessageFormData } from '@/lib/schemas';
import { sendChatMessageAction } from './actions';
import { Bot, Loader2, Send, User, Users, MessageCircle } from 'lucide-react';
import { useRole } from '@/contexts/role-context';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  userId: string;
  userName: string;
  avatarFallback: string;
  messages: Message[];
}

// Function to generate initial mock chat sessions to be called on client
const generateInitialMockChatSessions = (): ChatSession[] => [
  {
    userId: 'john-doe',
    userName: 'John Doe',
    avatarFallback: 'JD',
    messages: [
      { id: 'jd1', text: "Hi, I completed an HIV screening and got a referral. What should I do next?", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
      { id: 'ai_jd1', text: "Hello John! Thanks for reaching out. The referral suggests consulting a healthcare professional. We can help you find a clinic or provide more information if you have specific questions.", sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
      { id: 'jd2', text: "Okay, can you tell me about clinics near downtown?", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
      { id: 'ai_jd2', text: "Certainly. There are a few reputable clinics downtown. Could you specify if you're looking for general consultation or specialized HIV services? That will help me narrow down the options for you.", sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 7) },
    ],
  },
  {
    userId: 'jane-smith',
    userName: 'Jane Smith',
    avatarFallback: 'JS',
    messages: [
      { id: 'js1', text: "I'm feeling very unsafe at home. The screening mentioned support services.", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { id: 'ai_js1', text: "Hello Jane, I'm so sorry to hear you're feeling unsafe. Your well-being is our priority. Yes, there are support services available. Can you tell me if you are in immediate danger, or would you like information on shelters and counseling?", sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 14) },
    ],
  },
  {
    userId: 'alex-lee',
    userName: 'Alex Lee',
    avatarFallback: 'AL',
    messages: [
      { id: 'al1', text: "My PrEP screening said I might be a good candidate. How do I start PrEP?", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 'ai_al1', text: "Hi Alex! That's great you're looking into PrEP. The next step is to consult a healthcare provider. They can discuss if PrEP is right for you, do necessary tests, and prescribe it if appropriate. Would you like help finding a knowledgeable provider?", sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    ],
  },
  {
    userId: 'samuel-green',
    userName: 'Samuel Green',
    avatarFallback: 'SG',
    messages: [
      { id: 'sg1', text: "I was told to follow up on my HIV care. I'm a bit lost.", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
      { id: 'ai_sg1', text: "Hi Samuel, thanks for contacting us. We can definitely help you with that. Continuing with regular medical follow-ups is very important. Do you have a current healthcare provider, or do you need assistance connecting with one?", sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 19) },
    ],
  },
];


export default function ChatPage() {
  const { toast } = useToast();
  const { role } = useRole();
  const [mockChatSessions, setMockChatSessions] = useState<ChatSession[]>([]); // Initialize with empty array
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatMessageFormData>({
    resolver: zodResolver(ChatMessageSchema),
    defaultValues: { message: '' },
  });

  // Generate initial mock sessions on client mount
  useEffect(() => {
    setMockChatSessions(generateInitialMockChatSessions());
  }, []);


  const currentChatSession = useMemo(() => {
    if (!activeChatUserId) return null;
    return mockChatSessions.find(session => session.userId === activeChatUserId) || null;
  }, [activeChatUserId, mockChatSessions]);

  const currentMessages = currentChatSession?.messages || [];

  useEffect(() => {
    if (role === 'user') {
      // Ensure 'john-doe' exists before setting, especially if mockChatSessions loads async
      if (mockChatSessions.some(session => session.userId === 'john-doe')) {
        setActiveChatUserId('john-doe');
      } else if (mockChatSessions.length > 0 && !activeChatUserId ) {
         // Fallback if john-doe is not available but trying to set a default for user
         setActiveChatUserId(mockChatSessions[0].userId);
      }
    } else { // admin role
       if (!activeChatUserId && mockChatSessions.length > 0) {
         // setActiveChatUserId(mockChatSessions[0].userId); // Optionally select the first chat for admin by default
       }
    }
  }, [role, mockChatSessions, activeChatUserId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentMessages]);

  async function onSubmit(values: ChatMessageFormData) {
    if (!activeChatUserId) {
      toast({ title: "Error", description: "No active chat selected.", variant: "destructive" });
      return;
    }
    setIsSending(true);

    const newMessageSender = role === 'admin' ? 'ai' : 'user';
    const userMessage: Message = {
      id: `${newMessageSender}-${Date.now()}`,
      text: values.message,
      sender: newMessageSender,
      timestamp: new Date(),
    };

    setMockChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.userId === activeChatUserId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );
    form.reset();

    const result = await sendChatMessageAction({ message: values.message });

    if (result.success && result.response) {
      const aiMessage: Message = {
        id: `ai-response-${Date.now()}`,
        text: result.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMockChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.userId === activeChatUserId
            ? { ...session, messages: [...session.messages, aiMessage] }
            : session
        )
      );
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMockChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.userId === activeChatUserId
            ? { ...session, messages: session.messages.filter(msg => msg.id !== userMessage.id) }
            : session
        )
      );
    }
    setIsSending(false);
  }

  const pageTitle = role === 'admin' ? "Admin Chat Console" : "Chat with Support";
  const pageDescription = role === 'admin' ? "Respond to user queries and manage conversations." : "Connect with our support team for assistance.";


  return (
    <div className="container mx-auto py-8 px-4 flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]">
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className={cn("flex-grow flex overflow-hidden gap-4", role === 'admin' ? "flex-row" : "flex-col")}>
        {role === 'admin' && (
          <Card className="w-1/3 lg:w-1/4 shadow-lg flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-primary flex items-center">
                <Users className="mr-2 h-5 w-5" /> Active Chats
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-grow">
              {mockChatSessions.length === 0 && (
                <p className="p-4 text-center text-sm text-muted-foreground">Loading chats...</p>
              )}
              {mockChatSessions.map(session => (
                <Button
                  key={session.userId}
                  variant={activeChatUserId === session.userId ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 rounded-none border-b"
                  onClick={() => setActiveChatUserId(session.userId)}
                >
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className={cn(activeChatUserId === session.userId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {session.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{session.userName}</span>
                </Button>
              ))}
            </ScrollArea>
          </Card>
        )}

        <Card className={cn("flex-grow shadow-lg flex flex-col overflow-hidden", role === 'admin' ? "w-2/3 lg:w-3/4" : "w-full")}>
          <CardHeader className="border-b">
             <h2 className="text-xl font-semibold text-primary flex items-center">
              {currentChatSession ? (
                <>
                  <MessageCircle className="mr-2 h-6 w-6"/>
                  Chat with {currentChatSession.userName}
                </>
              ) : (
                role === 'admin' ? "Select a chat to view" : "Support Chat"
              )}
            </h2>
          </CardHeader>
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-8"> {/* Added wrapper div and moved space-y-8 here */}
              {!activeChatUserId && role === 'admin' && mockChatSessions.length > 0 && (
                <p className="text-center text-muted-foreground py-10">
                  Please select a user from the list to view their chat.
                </p>
              )}
              {activeChatUserId && currentMessages.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  No messages in this chat yet. Start the conversation!
                </p>
              )}
               {mockChatSessions.length === 0 && (role === 'user' || (role === 'admin' && !activeChatUserId)) && (
                <p className="text-center text-muted-foreground py-10">Loading messages...</p>
              )}
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    (role === 'user' && msg.sender === 'user') || (role === 'admin' && msg.sender === 'ai')
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {((role === 'user' && msg.sender === 'ai') || (role === 'admin' && msg.sender === 'user')) && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.sender === 'ai' ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}>
                        {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow ${
                      (role === 'user' && msg.sender === 'user') || (role === 'admin' && msg.sender === 'ai')
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                        (role === 'user' && msg.sender === 'user') || (role === 'admin' && msg.sender === 'ai')
                          ? 'text-primary-foreground/70 text-right'
                          : 'text-muted-foreground/70 text-left'
                      }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {((role === 'user' && msg.sender === 'user') || (role === 'admin' && msg.sender === 'ai')) && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className={msg.sender === 'ai' ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}>
                          {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          {activeChatUserId && (
            <CardFooter className="p-4 border-t">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input
                            placeholder={role === 'admin' ? `Reply to ${currentChatSession?.userName}...` : "Type your message..."}
                            {...field}
                            disabled={isSending || !activeChatUserId}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="icon" disabled={isSending || !activeChatUserId} className="bg-accent hover:bg-accent/90">
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </Form>
            </CardFooter>
          )}
           {!activeChatUserId && role === 'user' && mockChatSessions.length > 0 && (
             <CardFooter className="p-4 border-t justify-center">
                <p className="text-sm text-muted-foreground">Setting up your chat...</p>
             </CardFooter>
           )}
        </Card>
      </div>
    </div>
  );
}
