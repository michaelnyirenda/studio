"use server";

import type { HivScreeningFormData } from '@/lib/schemas';
import { HivScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  errors?: z.ZodIssue[];
}

export async function submitHivScreeningAction(
  data: HivScreeningFormData
): Promise<ScreeningResult> {
  const validationResult = HivScreeningSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  const { name, age, sexualActivity, testingHistory } = validationResult.data;

  // Simulate saving to a database or calling an API
  console.log("HIV Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

  // Referral Logic
  let referralMessage = `Dear ${name}, thank you for completing the screening. Based on your responses, no immediate referral is specifically indicated at this time. However, regular check-ups and open discussions with healthcare professionals are always encouraged for maintaining good health.`;

  if (sexualActivity === "yes") {
    if (testingHistory === "never_tested") {
      referralMessage = `Dear ${name}, thank you for completing the screening. Given your sexual activity and no prior testing, a referral for HIV testing and counseling is recommended. Please consult a healthcare professional to discuss this further. Early testing is key for your health.`;
    } else if (testingHistory === "tested_positive") {
      referralMessage = `Dear ${name}, thank you for completing the screening. We acknowledge your testing history. It's important to continue with regular medical follow-ups and adhere to any prescribed treatment. If you need support or further consultation, please reach out to a healthcare provider.`;
    } else if (testingHistory === "tested_negative") {
      referralMessage = `Dear ${name}, thank you for completing the screening. It's good that you are aware of your status. Remember that regular testing is advisable if you are sexually active. Please consult a healthcare professional about appropriate testing frequency for you.`;
    }
  } else if (sexualActivity === "no" && testingHistory === "never_tested") {
     referralMessage = `Dear ${name}, thank you for completing the screening. While your current responses do not indicate a high immediate risk, understanding HIV and prevention methods is always beneficial. Consider discussing general sexual health with a healthcare provider if you have questions.`;
  }


  return { 
    success: true, 
    message: "Screening submitted successfully.",
    referralMessage: referralMessage
  };
}
