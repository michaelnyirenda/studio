
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/chat-interface';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, XCircle, AlertTriangle } from 'lucide-react';
import { startChatAction, closeChatAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ActiveSession {
    id: string;
    userId: string;
}

export default function ChatPage() {
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleStartChat = async () => {
        setIsLoading(true);
        const result = await startChatAction();
        if (result.success && result.sessionId && result.userId) {
            setActiveSession({ id: result.sessionId, userId: result.userId });
        } else {
            toast({
                title: "Error",
                description: "Could not start a new chat session. Please try again.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleCloseChat = async () => {
        if (!activeSession) return;
        setIsLoading(true);
        const result = await closeChatAction(activeSession.id);
        if (result.success) {
            toast({
                title: "Chat Closed",
                description: "Your chat session has been closed.",
            });
            setActiveSession(null);
        } else {
            toast({
                title: "Error",
                description: "Could not close the chat session.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto py-8 px-4 pb-24">
            <PageHeader
                title="Chat with Support"
                description={activeSession ? "Get help or ask questions. Our support staff is here for you." : "Start a confidential conversation with our support staff."}
            />
            <div className="mt-8 max-w-2xl mx-auto">
                {!activeSession ? (
                    <Card className="text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Start a New Chat</CardTitle>
                            <CardDescription>Your conversation is anonymous and will be connected to an available support staff member.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Alert variant="default" className="text-left mb-6 border-accent">
                                <AlertTriangle className="h-5 w-5 text-accent" />
                                <AlertTitle className="font-bold text-accent">Chat Guidelines</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5 space-y-1.5 mt-2 text-sm">
                                    <li>This chat is confidential. However, for your safety, please avoid sharing overly specific personal details (like ID numbers or exact home addresses) unless required for a referral.</li>
                                    <li>Our support staff are here to help. Please communicate with respect. Abusive language will not be tolerated.</li>
                                    <li>This chat is for support and guidance. If you are in immediate danger, please contact your local emergency services.</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                            <Button size="lg" onClick={handleStartChat} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                                {isLoading ? 'Starting...' : 'Start Anonymous Chat'}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <ChatInterface sessionId={activeSession.id} userId={activeSession.userId} isClientSide={true} />
                        <div className="mt-4 flex justify-end">
                            <Button variant="destructive" onClick={handleCloseChat} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Close Chat
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
    
