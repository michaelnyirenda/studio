// src/app/forum/actions.ts
"use server";

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ForumPostFormData } from '@/lib/schemas';
import { ForumPostSchema } from '@/lib/schemas';
import type * as z from 'zod';

export async function createForumPostAction(
  data: ForumPostFormData
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = ForumPostSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  try {
    // In a real app, you would get the author's name from the authenticated user session.
    // For now, we'll hardcode it as the admin.
    const authorName = "i-BreakFree Admin"; 

    await addDoc(collection(db, 'posts'), {
      ...validationResult.data,
      author: authorName,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: "Forum post created successfully!" };
  } catch (error) {
    console.error("Error creating forum post:", error);
    return { success: false, message: "An error occurred while creating the post." };
  }
}