
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

  const { name, partnersLast6Months, knowPartnerStatus, consistentCondomUse, stiLast6Months, wantsPrEpInfo } = validationResult.data;

  console.log("PrEP Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000));

  let baseMessage = `Dear ${name}, thank you for completing the PrEP screening. This information helps assess if PrEP could be a beneficial HIV prevention option for you.`;
  let recommendation = "";
  let needsReferral = false; // Referral for PrEP consultation
  let referralObject: MockReferral | undefined = undefined;

  let riskFactors = 0;
  if (["2-4", "5+"].includes(partnersLast6Months)) riskFactors++;
  if (knowPartnerStatus === "no" || knowPartnerStatus === "yes_some") riskFactors++;
  if (["sometimes", "rarely", "never"].includes(consistentCondomUse)) riskFactors++;
  if (stiLast6Months === "yes") riskFactors++;

  if (riskFactors >= 2) {
    recommendation = "Based on your responses, you may have factors that increase your risk of HIV exposure. PrEP (Pre-Exposure Prophylaxis) is a highly effective medication to prevent HIV. We recommend discussing PrEP with a healthcare provider to see if it's right for you.";
    needsReferral = true;
  } else if (wantsPrEpInfo === "yes") {
    recommendation = "You expressed interest in learning more about PrEP. PrEP is a medication that can significantly reduce the risk of getting HIV. We recommend discussing this with a healthcare provider who can provide detailed information and assess if it's suitable for you.";
    needsReferral = true;
  } else if (riskFactors === 1 && partnersLast6Months !== "0") {
     recommendation = "Your responses indicate some factors that are important to consider for HIV prevention. While PrEP might be an option, maintaining consistent safer sex practices is also key. Consider discussing your overall sexual health and PrEP with a healthcare provider for personalized advice."
     needsReferral = true; // Soft referral for discussion
  }
  else {
    recommendation = "Thank you for completing the screening. It's good to be proactive about your health. Remember to continue practicing safer sex and consider regular HIV testing as appropriate. If you have any questions about HIV prevention or PrEP in the future, please consult a healthcare provider.";
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
      referralMessage: `Based on your PrEP screening, the following guidance was provided: ${recommendation}`,
      status: 'Pending Review',
      notes: 'PrEP screening referral. Patient may benefit from a PrEP consultation.',
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
