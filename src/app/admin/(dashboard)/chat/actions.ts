'use server';

import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { ChatMessageSchema } from '@/lib/schemas';

const MOCK_ADMIN_USER_ID = 'admin-user';

export async function sendAdminMessageAction(
  sessionId: string,
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

    // 1. Add admin's message
    const adminMessage = {
        text: message,
        createdAt: serverTimestamp(),
        senderId: MOCK_ADMIN_USER_ID,
        // We use 'ai' as senderType to reuse existing styling for non-user messages.
        senderType: 'ai' as const, 
    };
    await addDoc(messagesCollection, adminMessage);
    
    // 2. Update the session document
    await updateDoc(sessionRef, {
        lastMessageText: message,
        lastMessageAt: serverTimestamp(),
        userUnread: true, // Mark as unread for the user
        adminUnread: false, // Admin has just sent it, so it's not unread for them
    });

    return { success: true, message: "Message sent." };
  } catch (error) {
    console.error("Error sending admin message:", error);
    return { success: false, message: "Failed to send message." };
  }
}
