// src/app/referrals/actions.ts
"use server";

import { doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReferralConsentFormData } from '@/lib/schemas';
import { ReferralConsentSchema } from '@/lib/schemas';
import type * as z from 'zod';
import { generateReferralPdf } from '@/services/pdf-service';
import type { Referral } from '@/lib/types';

export async function submitReferralConsentAction(
  referralId: string,
  data: ReferralConsentFormData
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = ReferralConsentSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }
  
  const referralRef = doc(db, 'referrals', referralId);
  const referralSnap = await getDoc(referralRef);

  if (!referralSnap.exists()) {
    return { success: false, message: "Referral not found." };
  }

  if (validationResult.data.contactMethod === 'email' && !referralSnap.data().email) {
    return { 
        success: false, 
        message: "Cannot select email as contact method because no email was provided during screening.",
        errors: [{
            path: ['contactMethod'],
            message: 'Email not available for this user. Please select another method.',
            code: 'custom'
        }]
    };
  }


  try {
    
    // Update the document in Firestore
    await updateDoc(referralRef, {
      consentStatus: 'agreed',
      region: validationResult.data.region,
      constituency: validationResult.data.constituency,
      facility: validationResult.data.facility,
      contactMethod: validationResult.data.contactMethod,
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

export async function downloadReferralPdfAction(
  referralId: string
): Promise<{ success: boolean; pdfData?: string; message?: string }> {
  try {
    const referralRef = doc(db, 'referrals', referralId);
    const referralSnap = await getDoc(referralRef);

    if (!referralSnap.exists()) {
      return { success: false, message: "Referral not found." };
    }

    const referralData = { id: referralSnap.id, ...referralSnap.data() } as Referral;
    const pdfBytes = await generateReferralPdf(referralData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    return { success: true, pdfData: pdfBase64 };

  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: "An error occurred while generating the PDF." };
  }
}
