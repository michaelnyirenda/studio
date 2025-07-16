
'use server';

import { collection, addDoc, serverTimestamp, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { ChatMessageSchema } from '@/lib/schemas';
import { sendChatMessage } from '@/ai/flows/chat-flow';

// This function creates a new, anonymous chat session every time.
export async function startChatAction(): Promise<{ success: boolean; sessionId?: string; userId?: string; }> {
  try {
    const anonymousUserId = `client-user-${Date.now()}`;
    const anonymousUserName = `User ${anonymousUserId.slice(-4)}`;

    const newChatSession = {
        userId: anonymousUserId,
        userName: anonymousUserName,
        lastMessageText: "Chat started.",
        lastMessageAt: serverTimestamp(),
        userUnread: false,
        adminUnread: true,
        status: 'active' as const,
    };
    const docRef = await addDoc(collection(db, 'chatSessions'), newChatSession);
    return { success: true, sessionId: docRef.id, userId: anonymousUserId };
  } catch (error) {
    console.error("Error starting chat session:", error);
    return { success: false };
  }
}

// This function ONLY sends the user's message. The AI response is handled separately.
export async function sendMessageAction(
  sessionId: string,
  userId: string,
  values: z.infer<typeof ChatMessageSchema>
): Promise<{ success: boolean; message: string; }> {
  const validation = ChatMessageSchema.safeParse(values);
  if (!validation.success) {
      return { success: false, message: "Invalid message format." };
  }

  const { message } = validation.data;

  try {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const messagesCollection = collection(sessionRef, 'messages');

    const batch = writeBatch(db);

    const userMessage = {
        text: message,
        createdAt: serverTimestamp(),
        senderId: userId,
        senderType: 'user' as const,
    };
    batch.set(doc(messagesCollection), userMessage);
    
    batch.update(sessionRef, {
        lastMessageText: message,
        lastMessageAt: serverTimestamp(),
        adminUnread: true,
        userUnread: false,
    });

    await batch.commit();

    return { success: true, message: "Message sent." };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: "Failed to send message." };
  }
}

// This new action gets the AI response and saves it. It's called separately.
export async function getAiResponseAction(sessionId: string, userMessage: string): Promise<{ success: boolean }> {
    try {
        // 1. Get AI response from Genkit flow
        const aiResult = await sendChatMessage({ userMessage });
        const aiResponseText = aiResult.aiResponse;

        // 2. Save AI response to the chat
        const sessionRef = doc(db, 'chatSessions', sessionId);
        const messagesCollection = collection(sessionRef, 'messages');

        const batch = writeBatch(db);

        const aiMessage = {
            text: aiResponseText,
            createdAt: serverTimestamp(),
            senderId: 'ai-support-bot',
            senderType: 'ai' as const,
        };
        batch.set(doc(messagesCollection), aiMessage);

        // 3. Update the session with the AI's last message
        batch.update(sessionRef, {
            lastMessageText: aiResponseText,
            lastMessageAt: serverTimestamp(),
            adminUnread: false, // AI message doesn't need admin attention by default
            userUnread: true, // Mark as unread for the user
        });
        
        await batch.commit();
        
        return { success: true };
    } catch (error) {
        console.error("Error getting AI response or saving it:", error);
        return { success: false };
    }
}


// This function marks a chat as closed by the client.
export async function closeChatAction(sessionId: string): Promise<{ success: boolean }> {
    try {
        const sessionRef = doc(db, 'chatSessions', sessionId);
        await updateDoc(sessionRef, {
            status: 'closed',
            lastMessageText: "Chat closed by user.",
            lastMessageAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error closing chat:", error);
        return { success: false };
    }
}
