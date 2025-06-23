
"use server";

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
    console.error("Validation failed:", validationResult.error.issues);
    return { success: false, message: "Validation failed. Please check the form for errors.", errors: validationResult.error.issues };
  }

  const { name } = validationResult.data;

  // In a real app, this data would be saved to a secure database.
  // For this prototype, we're just logging it to the server console.
  console.log("Full HIV Screening Data for", name, ":", JSON.stringify(validationResult.data, null, 2));
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

  // Simplified referral logic for the prototype
  const baseMessage = `Dear ${name}, thank you for completing the detailed screening. Your responses have been recorded.`;
  const recommendation = "Based on your answers, we recommend you discuss your health profile with a healthcare professional. They can provide personalized advice and support. A record of this screening has been made for follow-up if needed.";
  
  const fullReferralMessage = `${baseMessage} ${recommendation}`;

  // For prototype purposes, always generate a referral object to show the flow.
  const referralId = `ref-hiv-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const referralObject: MockReferral = {
    id: referralId,
    patientName: name,
    referralDate: currentDate,
    referralMessage: "Referral generated from detailed HIV screening. Patient requires consultation with a healthcare professional for a full review of their risk profile.",
    status: 'Pending Review',
    consentStatus: 'pending',
    notes: 'Generated from detailed screening form. See server logs for submitted data.',
  };
  
  console.log("Generated Referral Object:", referralObject);

  return { 
    success: true, 
    message: "Screening submitted successfully.",
    referralMessage: fullReferralMessage,
    referralDetails: referralObject 
  };
}
