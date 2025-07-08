// src/app/forum/actions.ts
"use server";

import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    const authorName = "#iBreakFree Admin"; 

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

export async function updateForumPostAction(
  postId: string,
  data: ForumPostFormData
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = ForumPostSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...validationResult.data,
    });
    return { success: true, message: "Forum post updated successfully!" };
  } catch (error) {
    console.error("Error updating forum post:", error);
    return { success: false, message: "An error occurred while updating the post." };
  }
}

export async function deleteForumPostAction(
  postId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return { success: true, message: "Forum post deleted successfully!" };
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return { success: false, message: "An error occurred while deleting the post." };
  }
}
