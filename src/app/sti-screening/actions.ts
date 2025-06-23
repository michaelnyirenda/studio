
"use server";

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

  const { name, ...answers } = validationResult.data;

  console.log("STI Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  let baseMessage = `Dear ${name}, thank you for completing the STI screening.`;
  let recommendation = "";
  let needsReferral = false;
  let referralObject: MockReferral | undefined = undefined;

  const answeredYes = Object.values(answers).some(answer => answer === 'yes');

  if (answeredYes) {
    recommendation = "Based on your responses, we recommend a clinical STI assessment. Getting tested is a proactive step for your health and the health of your partners.";
    needsReferral = true;
  } else {
    recommendation = "Thank you for completing the screening. Remember that regular STI testing can be an important part of your overall health, even without symptoms. Please consult a healthcare provider for personalized advice on testing frequency.";
    needsReferral = false;
  }
  
  const fullReferralMessage = `${baseMessage} ${recommendation}`;

  if (needsReferral) {
    const referralId = `ref-sti-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    referralObject = {
      id: referralId,
      patientName: name,
      referralDate: currentDate,
      referralMessage: `Based on your STI screening, the following guidance was provided: ${recommendation}`,
      status: 'Pending Review',
      notes: 'STI screening referral. Patient recommended for clinical assessment.',
    };
    console.log("Generated STI Referral Object:", referralObject);
  }

  return { 
    success: true, 
    message: "STI Screening submitted successfully.",
    referralMessage: fullReferralMessage,
    referralDetails: referralObject 
  };
}
