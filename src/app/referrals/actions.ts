// src/app/referrals/actions.ts
"use server";

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReferralConsentFormData } from '@/lib/schemas';
import { ReferralConsentSchema } from '@/lib/schemas';
import type * as z from 'zod';

export async function submitReferralConsentAction(
  referralId: string,
  data: ReferralConsentFormData
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = ReferralConsentSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  try {
    const referralRef = doc(db, 'referrals', referralId);
    
    // Update the document in Firestore
    await updateDoc(referralRef, {
      consentStatus: 'agreed',
      region: validationResult.data.region,
      constituency: validationResult.data.constituency,
      facility: validationResult.data.facility,
      status: 'Pending Review', // Change status so it appears on the admin's dashboard
    });

    return { success: true, message: `Referral consent for facility "${validationResult.data.facility}" recorded successfully!` };
  } catch (error) {
    console.error("Error submitting referral consent:", error);
    return { success: false, message: "An error occurred while submitting consent." };
  }
}

export async function deleteReferralAction(
  referralId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const referralRef = doc(db, 'referrals', referralId);
    await deleteDoc(referralRef);
    return { success: true, message: "Referral deleted successfully!" };
  } catch (error) {
    console.error("Error deleting referral:", error);
    return { success: false, message: "An error occurred while deleting the referral." };
  }
}
