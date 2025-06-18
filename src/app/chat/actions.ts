
"use server";

import type { ChatMessageFormData } from '@/lib/schemas';
import { ChatMessageSchema } from '@/lib/schemas';
import { sendChatMessage, type ChatFlowOutput } from '@/ai/flows/chat-flow';
import type * as z from 'zod';

export async function sendChatMessageAction(
  data: ChatMessageFormData
): Promise<{ success: boolean; message?: string; response?: string; errors?: z.ZodIssue[] }> {
  const validationResult = ChatMessageSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  try {
    const aiResult: ChatFlowOutput = await sendChatMessage({ userMessage: validationResult.data.message });
    return { success: true, response: aiResult.aiResponse };
  } catch (error)
 {
    console.error("Error in chat flow:", error);
    return { success: false, message: "An error occurred while processing your message." };
  }
}
