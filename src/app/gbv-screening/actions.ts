
"use server";

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

  const { name, experiencedHarm, feltUnsafe, hasSafePlace, wantsSupportInfo } = validationResult.data;

  console.log("GBV Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  let baseMessage = `Dear ${name}, thank you for completing the GBV screening. Your safety and well-being are important.`;
  let recommendation = "";
  let needsReferral = false;
  let referralObject: MockReferral | undefined = undefined;

  if (experiencedHarm === "yes") {
    recommendation = "We are concerned that you have experienced harm. It is important to seek support. ";
    if (hasSafePlace === "no") {
      recommendation += "Since you mentioned not having a safe place, we strongly recommend contacting a local support service or helpline immediately. ";
    }
    recommendation += "We can provide you with information on available resources.";
    needsReferral = true;
  } else if (feltUnsafe === "yes") {
    recommendation = "Feeling unsafe is a serious concern. There are resources available to help you create a safety plan and find support. ";
    needsReferral = true;
  } else {
    recommendation = "Thank you for sharing. Maintaining your safety and well-being is crucial. ";
  }

  if (wantsSupportInfo === "yes" && !needsReferral) {
    recommendation += "You indicated you'd like information on support services. We can provide you with resources. ";
    needsReferral = true; // Consider this a referral for information
  } else if (wantsSupportInfo === "yes" && needsReferral) {
     recommendation += " You will also receive information on support services as requested."
  }


  if (recommendation === "Thank you for sharing. Maintaining your safety and well-being is crucial. " && wantsSupportInfo === "no") {
     recommendation += "If you ever need support or information, please don't hesitate to reach out or use our chat feature."
  }
  
  const fullReferralMessage = `${baseMessage} ${recommendation}`;

  if (needsReferral) {
    const referralId = `ref-gbv-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    referralObject = {
      id: referralId,
      patientName: name,
      referralDate: currentDate,
      referralMessage: `Based on your GBV screening, the following guidance was provided: ${recommendation}`,
      status: 'Pending Review',
      notes: 'GBV screening referral. Patient may require immediate support or resources.',
    };
    console.log("Generated GBV Referral Object:", referralObject);
  }

  return { 
    success: true, 
    message: "GBV Screening submitted successfully.",
    referralMessage: fullReferralMessage,
    referralDetails: referralObject 
  };
}
