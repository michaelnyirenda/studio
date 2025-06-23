
"use server";

import type { PrEpScreeningFormData } from '@/lib/schemas';
import { PrEpScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { MockReferral } from '@/lib/mock-data';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: MockReferral;
  errors?: z.ZodIssue[];
}

export async function submitPrEpScreeningAction(
  data: PrEpScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = PrEpScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  const { name, ...answers } = validationResult.data;

  console.log("PrEP Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000));

  let baseMessage = `Dear ${name}, thank you for completing the PrEP screening.`;
  let recommendation = "";
  let needsReferral = false;
  let referralObject: MockReferral | undefined = undefined;

  // If any answer is 'yes', the user is considered eligible for a PrEP consultation.
  const isEligible = Object.values(answers).some(answer => answer === 'yes');

  if (isEligible) {
    recommendation = "Based on your responses, you may be eligible for PrEP (Pre-Exposure Prophylaxis), which is a highly effective medication to prevent HIV. We strongly recommend discussing your results with a healthcare provider to determine if PrEP is the right option for you.";
    needsReferral = true;
  } else {
    recommendation = "Thank you for completing the screening. While your responses do not indicate an immediate high risk, it's important to continue practicing safer sex and consider regular HIV testing. If you have any questions about HIV prevention or PrEP in the future, please consult a healthcare provider.";
  }
  
  const fullReferralMessage = `${baseMessage} ${recommendation}`;

  if (needsReferral) {
    const referralId = `ref-prep-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    referralObject = {
      id: referralId,
      patientName: name,
      referralDate: currentDate,
      referralMessage: `Based on the PrEP screening, the user is likely eligible for PrEP and requires a consultation. Guidance provided: ${recommendation}`,
      status: 'Pending Review',
      consentStatus: 'pending',
      notes: 'PrEP screening indicates eligibility. Consultation recommended.',
    };
    console.log("Generated PrEP Referral Object:", referralObject);
  }

  return { 
    success: true, 
    message: "PrEP Screening submitted successfully.",
    referralMessage: fullReferralMessage,
    referralDetails: referralObject 
  };
}
