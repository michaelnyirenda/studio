
"use server";

import { addDoc, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HivScreeningFormData } from '@/lib/schemas';
import { HivScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { MockReferral } from '@/lib/mock-data';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: MockReferral;
  errors?: z.ZodIssue[];
}

export async function submitHivScreeningAction(
  data: HivScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = HivScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues, };
  }

  const { name, phoneNumber, email, ...screeningData } = validationResult.data;

  try {
    const baseMessage = `Dear ${name}, thank you for completing the detailed screening. Your responses have been recorded.`;
    const recommendation = "Based on your answers, we recommend you discuss your health profile with a healthcare professional. They can provide personalized advice and support. A record of this screening has been made for follow-up if needed.";
    const fullReferralMessage = `${baseMessage} ${recommendation}`;

    const screeningDocRef = await addDoc(collection(db, 'hivScreenings'), { name, phoneNumber, email, ...screeningData, createdAt: serverTimestamp(), userId: 'client-test-user' });

    const newReferralDataForDb = {
      patientName: name,
      phoneNumber,
      email,
      referralDate: serverTimestamp(),
      referralMessage: "Referral generated from detailed HIV screening. Patient requires consultation with a healthcare professional for a full review of their risk profile.",
      status: 'Pending Consent' as const,
      consentStatus: 'pending' as const,
      type: 'HIV' as const,
      screeningId: screeningDocRef.id,
      userId: 'client-test-user',
    };

    const referralDocRef = await addDoc(collection(db, 'referrals'), newReferralDataForDb);

    const referralObjectForClient: MockReferral = {
      id: referralDocRef.id,
      ...newReferralDataForDb,
      referralDate: new Date() // Use a standard Date object for the client
    } as MockReferral;

    return {
      success: true,
      message: "Screening submitted successfully.",
      referralMessage: fullReferralMessage,
      referralDetails: referralObjectForClient
    };

  } catch (error) {
    console.error("Error submitting HIV screening:", error);
    return { success: false, message: "An error occurred during submission." };
  }
}
