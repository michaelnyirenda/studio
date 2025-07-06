
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendChatMessage } from '@/ai/flows/chat-flow';
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
): Promise<{ success: boolean; message: string; }> {
  const validation = ChatMessageSchema.safeParse(values);
  if (!validation.success) {
      return { success: false, message: "Invalid message format." };
  }

  const { message } = validation.data;

  try {
    const sessionId = await getOrCreateChatSession();
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const messagesCollection = collection(sessionRef, 'messages');

    // 1. Add user's message
    const userMessage = {
        text: message,
        createdAt: serverTimestamp(),
        senderId: MOCK_CURRENT_USER_ID,
        senderType: 'user' as const,
    };
    await addDoc(messagesCollection, userMessage);
    await updateDoc(sessionRef, {
        lastMessageText: message,
        lastMessageAt: serverTimestamp(),
        adminUnread: true,
    });
    
    // 2. Get AI response
    const aiResponse = await sendChatMessage({ userMessage: message });
    
    // 3. Add AI's message
    if (aiResponse?.aiResponse) {
        const aiMessage = {
            text: aiResponse.aiResponse,
            createdAt: serverTimestamp(),
            senderId: 'ai-assistant',
            senderType: 'ai' as const,
        };
        await addDoc(messagesCollection, aiMessage);
         await updateDoc(sessionRef, {
            lastMessageText: aiResponse.aiResponse,
            lastMessageAt: serverTimestamp(),
            userUnread: true, // User has not seen this new AI message
        });
    }

    return { success: true, message: "Message sent." };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: "Failed to send message." };
  }
}

    