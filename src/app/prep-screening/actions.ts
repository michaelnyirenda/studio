
"use server";

import { addDoc, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PrEpScreeningFormData } from '@/lib/schemas';
import { PrEpScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { Referral } from '@/lib/types';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: Referral;
  errors?: z.ZodIssue[];
}

export async function submitPrEpScreeningAction(
  data: PrEpScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = PrEpScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  const { name, phoneNumber, email, ...answers } = validationResult.data;
  const isEligible = Object.values(answers).some(answer => answer === 'yes');
  let recommendation = "";

  if (isEligible) {
    recommendation = "Based on your responses, you may be eligible for PrEP (Pre-Exposure Prophylaxis), which is a highly effective medication to prevent HIV. We strongly recommend discussing your results with a healthcare provider to determine if PrEP is the right option for you.";
  } else {
    recommendation = "Thank you for completing the screening. While your responses do not indicate an immediate high risk, it's important to continue practicing safer sex and consider regular HIV testing. If you have any questions about HIV prevention or PrEP in the future, please consult a healthcare provider.";
  }

  const fullReferralMessage = `Dear ${name}, thank you for completing the PrEP screening. ${recommendation}`;

  try {
    const screeningDocRef = await addDoc(collection(db, 'prepScreenings'), { name, phoneNumber, email, ...answers, createdAt: serverTimestamp(), userId: 'client-test-user' });

    let referralObjectForClient: Referral | undefined = undefined;
    if (isEligible) {
      const newReferralDataForDb = {
        patientName: name,
        phoneNumber,
        email,
        referralDate: serverTimestamp(),
        referralMessage: `Based on the PrEP screening, the user is likely eligible for PrEP and requires a consultation. Guidance provided: ${recommendation}`,
        status: 'Pending Consent' as const,
        consentStatus: 'pending' as const,
        type: 'PrEP' as const,
        screeningId: screeningDocRef.id,
        userId: 'client-test-user'
      };

      const referralDocRef = await addDoc(collection(db, 'referrals'), newReferralDataForDb);
      referralObjectForClient = { id: referralDocRef.id, ...newReferralDataForDb, referralDate: new Date() } as Referral;
    }

    return {
      success: true,
      message: "PrEP Screening submitted successfully.",
      referralMessage: fullReferralMessage,
      referralDetails: referralObjectForClient
    };
  } catch (error) {
    console.error("Error submitting PrEP screening:", error);
    return { success: false, message: "An error occurred during submission." };
  }
}
