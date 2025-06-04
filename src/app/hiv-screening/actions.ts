
"use server";

import type { HivScreeningFormData } from '@/lib/schemas';
import { HivScreeningSchema } from '@/lib/schemas';
import type * as z from 'zod';
import type { MockReferral } from '@/lib/mock-data'; // Import MockReferral

interface ScreeningResult {
  success: boolean;
  message: string;
  referralMessage?: string;
  referralDetails?: MockReferral; // Add this to include the structured referral object
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

  console.log("HIV Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  let baseMessage = `Dear ${name}, thank you for completing the screening.`;
  let recommendation = "";
  let needsReferral = false;
  let referralObject: MockReferral | undefined = undefined;

  if (sexualActivity === "yes") {
    if (testingHistory === "never_tested") {
      recommendation = "Given your sexual activity and no prior testing, a referral for HIV testing and counseling is recommended. Please consult a healthcare professional to discuss this further. Early testing is key for your health.";
      needsReferral = true;
    } else if (testingHistory === "tested_positive") {
      recommendation = "We acknowledge your testing history. It's important to continue with regular medical follow-ups and adhere to any prescribed treatment. If you need support or further consultation, please reach out to a healthcare provider.";
      // Potentially still a referral for support, but let's consider this a specific type
      needsReferral = true; // Or false, depending on how "referral" is defined for existing positive cases
    } else if (testingHistory === "tested_negative") {
      recommendation = "It's good that you are aware of your status. Remember that regular testing is advisable if you are sexually active. Please consult a healthcare professional about appropriate testing frequency for you.";
      needsReferral = false; // Or true if proactive follow-up is desired
    } else { // prefer_not_to_say for testingHistory
       recommendation = "Considering your sexual activity, discussing your testing options with a healthcare provider is a good step to ensure you have the latest information and support. They can provide personalized advice."
       needsReferral = true;
    }
  } else if (sexualActivity === "no") {
    if (testingHistory === "never_tested") {
      recommendation = "While your current responses do not indicate a high immediate risk, understanding HIV and prevention methods is always beneficial. Consider discussing general sexual health with a healthcare provider if you have questions.";
      needsReferral = false;
    } else if (testingHistory === "tested_positive") {
       recommendation = "We acknowledge your testing history. It's important to continue with regular medical follow-ups and adhere to any prescribed treatment. If you need support or further consultation, please reach out to a healthcare provider.";
       needsReferral = true; // Support referral
    } else { // tested_negative or prefer_not_to_say for testingHistory
       recommendation = "Thank you for completing the screening. Maintaining open communication with healthcare providers about your health is always a good practice."
       needsReferral = false;
    }
  } else { // prefer_not_to_say for sexualActivity
    recommendation = "Understanding your risk and options is important. We recommend discussing HIV testing and sexual health with a healthcare provider who can offer confidential advice tailored to you."
    needsReferral = true;
  }

  const fullReferralMessage = `${baseMessage} ${recommendation}`;

  if (needsReferral) {
    const referralId = `ref-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    referralObject = {
      id: referralId,
      patientName: name,
      referralDate: currentDate,
      referralMessage: fullReferralMessage, // Using the full message for the referral record
      status: 'Pending Review',
      notes: 'Generated from screening.', // Default note
    };
    console.log("Generated Referral Object:", referralObject);
  }

  return { 
    success: true, 
    message: "Screening submitted successfully.",
    referralMessage: fullReferralMessage, // This is the message shown to the user completing the screening
    referralDetails: referralObject // This is the object that would be saved for referral tracking
  };
}
