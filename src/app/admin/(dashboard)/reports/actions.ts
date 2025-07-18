// src/app/admin/(dashboard)/reports/actions.ts
'use server';

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// A type guard might be better, but for this server action, a simple mapping is sufficient and safe.
const collectionMap: Record<string, string> = {
    'HIV': 'hivScreenings',
    'GBV': 'gbvScreenings',
    'PrEP': 'prepScreenings',
    'STI': 'stiScreenings',
};

export async function deleteScreeningAction(
  screeningId: string,
  screeningType: string
): Promise<{ success: boolean; message: string }> {
  const collectionName = collectionMap[screeningType];

  if (!screeningId || !collectionName) {
    return { success: false, message: "Invalid screening ID or type." };
  }

  try {
    const screeningRef = doc(db, collectionName, screeningId);
    await deleteDoc(screeningRef);
    return { success: true, message: "Screening record deleted successfully." };
  } catch (error) {
    console.error("Error deleting screening record:", error);
    if (error instanceof Error) {
        return { success: false, message: `Failed to delete record: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred while deleting the record." };
  }
}
