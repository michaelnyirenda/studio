
'use server';

import { collection, addDoc, serverTimestamp, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { ChatMessageSchema } from '@/lib/schemas';

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
        createdAt: serverTimestamp(), // Add createdAt for new session detection
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

// This function now only sends the user's message and updates the session for an admin to view.
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
    
    // Mark as unread for the admin.
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
