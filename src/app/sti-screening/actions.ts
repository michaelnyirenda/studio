
"use server";

import { addDoc, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StiScreeningFormData } from '@/lib/schemas';
import { StiScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { MockReferral } from '@/lib/mock-data';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: MockReferral;
  errors?: z.ZodIssue[];
}

export async function submitStiScreeningAction(
  data: StiScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = StiScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  const { name, phoneNumber, email, ...answers } = validationResult.data;
  const answeredYes = Object.values(answers).some(answer => answer === 'yes');
  let recommendation = "";

  if (answeredYes) {
    recommendation = "Based on your responses, we recommend a clinical STI assessment. Getting tested is a proactive step for your health and the health of your partners.";
  } else {
    recommendation = "Thank you for completing the screening. Remember that regular STI testing can be an important part of your overall health, even without symptoms. Please consult a healthcare provider for personalized advice on testing frequency.";
  }

  const fullReferralMessage = `Dear ${name}, thank you for completing the STI screening. ${recommendation}`;

  try {
    const screeningDocRef = await addDoc(collection(db, 'stiScreenings'), { name, phoneNumber, email, ...answers, createdAt: serverTimestamp(), userId: 'client-test-user' });

    let referralObjectForClient: MockReferral | undefined = undefined;

    if (answeredYes) {
      const newReferralDataForDb = {
        patientName: name,
        phoneNumber,
        email,
        referralDate: serverTimestamp(), // Use server timestamp for DB
        referralMessage: `Based on your STI screening, the following guidance was provided: ${recommendation}`,
        status: 'Pending Consent' as const,
        consentStatus: 'pending' as const,
        type: 'STI' as const,
        screeningId: screeningDocRef.id,
        userId: 'client-test-user'
      };

      const referralDocRef = await addDoc(collection(db, 'referrals'), newReferralDataForDb);

      // Create a "plain" object to return to the client
      referralObjectForClient = {
        id: referralDocRef.id,
        ...newReferralDataForDb,
        referralDate: new Date() // Use a standard Date object for the client
      } as MockReferral;
    }

    return {
      success: true,
      message: "STI Screening submitted successfully.",
      referralMessage: fullReferralMessage,
      referralDetails: referralObjectForClient
    };
  } catch (error) {
    console.error("Error submitting STI screening:", error);
    return { success: false, message: "An error occurred during submission." };
  }
}
