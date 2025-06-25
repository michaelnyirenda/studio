
"use server";

import { addDoc, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GbvScreeningFormData } from '@/lib/schemas';
import { GbvScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { MockReferral } from '@/lib/mock-data';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: MockReferral;
  errors?: z.ZodIssue[];
}

export async function submitGbvScreeningAction(
  data: GbvScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = GbvScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  const { name, suicideAttempt, seriousInjury, sexualViolenceTimeline, ...screeningData } = validationResult.data;
  let recommendations: string[] = [];
  let notes: string[] = [];

  const isHighRiskSuicide = suicideAttempt === 'yes';
  const isHighRiskInjury = seriousInjury === 'yes';
  const isHighRiskSexualViolence = sexualViolenceTimeline === 'le_72_hr' || sexualViolenceTimeline === 'gt_72_le_120_hr';
  const needsImmediateReferral = isHighRiskSuicide || isHighRiskInjury || isHighRiskSexualViolence;

  if (isHighRiskSuicide) {
    recommendations.push("You indicated thoughts of suicide or self-harm. Your safety is the top priority. We are immediately connecting you with support services.");
    notes.push("High Risk: Suicide/self-harm thoughts indicated.");
  }
  if (isHighRiskInjury) {
    recommendations.push("You indicated a serious injury. It is critical to get medical attention immediately. We are providing an urgent referral for medical care.");
    notes.push("High Risk: Serious injury requires urgent medical attention.");
  }
  if (isHighRiskSexualViolence) {
    recommendations.push("You indicated recent sexual violence. It's important to seek medical care (like PEP) and support services as soon as possible. We are generating an urgent referral for you.");
    notes.push("High Risk: Recent sexual violence exposure (within 5 days).");
  }

  let fullReferralMessage: string;
  if (needsImmediateReferral) {
    fullReferralMessage = `Dear ${name}, thank you for your honesty. Based on your answers, your safety and health may be at immediate risk. ${recommendations.join(' ')} Please follow the guidance of the support worker who will be in touch shortly.`;
  } else {
    fullReferralMessage = `Dear ${name}, thank you for completing the GBV screening. Your safety and well-being are important. We encourage you to connect with our support staff via the chat or explore resources in the forum if you need to talk.`;
    notes.push("No immediate high-risk factors identified, but general support may be beneficial.");
  }

  try {
    const screeningDocRef = await addDoc(collection(db, 'gbvScreenings'), { name, ...screeningData, createdAt: serverTimestamp(), userId: 'client-test-user' });

    const newReferralDataForDb = {
      patientName: name,
      referralDate: serverTimestamp(),
      referralMessage: fullReferralMessage,
      status: 'Pending Consent' as const,
      consentStatus: 'pending' as const,
      notes: notes.join(' '),
      type: 'GBV' as const,
      screeningId: screeningDocRef.id,
      userId: 'client-test-user'
    };

    const referralDocRef = await addDoc(collection(db, 'referrals'), newReferralDataForDb);
    const referralObjectForClient: MockReferral = { id: referralDocRef.id, ...newReferralDataForDb, referralDate: new Date() } as MockReferral;

    return {
      success: true,
      message: "GBV Screening submitted successfully.",
      referralMessage: fullReferralMessage,
      referralDetails: referralObjectForClient
    };

  } catch (error) {
    console.error("Error submitting GBV screening:", error);
    return { success: false, message: "An error occurred during submission." };
  }
}
