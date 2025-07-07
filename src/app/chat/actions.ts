
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { ChatMessageSchema } from '@/lib/schemas';

const MOCK_CURRENT_USER_ID = 'client-test-user';
const MOCK_CURRENT_USER_NAME = 'Client User';

async function getOrCreateChatSession(): Promise<string> {
    const chatsCollection = collection(db, 'chatSessions');
    const q = query(chatsCollection, where('userId', '==', MOCK_CURRENT_USER_ID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    } else {
        const newChatSession = {
            userId: MOCK_CURRENT_USER_ID,
            userName: MOCK_CURRENT_USER_NAME,
            lastMessageText: "Chat initiated.",
            lastMessageAt: serverTimestamp(),
            userUnread: false,
            adminUnread: true,
        };
        const docRef = await addDoc(chatsCollection, newChatSession);
        return docRef.id;
    }
}

export async function sendMessageAction(
  values: z.infer<typeof ChatMessageSchema>
): Promise<{ success: boolean; message: string; sessionId?: string; }> {
  const validation = ChatMessageSchema.safeParse(values);
  if (!validation.success) {
      return { success: false, message: "Invalid message format." };
  }

  const { message } = validation.data;

  try {
    const sessionId = await getOrCreateChatSession();
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const messagesCollection = collection(sessionRef, 'messages');

    const batch = writeBatch(db);

    // 1. Add user's message
    const userMessage = {
        text: message,
        createdAt: serverTimestamp(),
        senderId: MOCK_CURRENT_USER_ID,
        senderType: 'user' as const,
    };
    // Use `addDoc` semantics within a batch by creating a new doc reference
    batch.set(doc(messagesCollection), userMessage);
    
    // 2. Update the session document
    batch.update(sessionRef, {
        lastMessageText: message,
        lastMessageAt: serverTimestamp(),
        adminUnread: true, // Mark as unread for the admin
        userUnread: false, // User has just sent it, so it's not unread for them
    });

    await batch.commit();

    return { success: true, message: "Message sent.", sessionId };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: "Failed to send message." };
  }
}
