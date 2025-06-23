
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

  const { name, suicideAttempt, seriousInjury, sexualViolenceTimeline } = validationResult.data;

  console.log("GBV Screening Data for", name, ":", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

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
  let referralObject: MockReferral | undefined = undefined;

  if (needsImmediateReferral) {
    fullReferralMessage = `Dear ${name}, thank you for your honesty. Based on your answers, your safety and health may be at immediate risk. ${recommendations.join(' ')} Please follow the guidance of the support worker who will be in touch shortly.`;
  } else {
    fullReferralMessage = `Dear ${name}, thank you for completing the GBV screening. Your safety and well-being are important. We encourage you to connect with our support staff via the chat or explore resources in the forum if you need to talk.`;
    notes.push("No immediate high-risk factors identified, but general support may be beneficial.");
  }

  // Always generate a referral object for this prototype to show the flow
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
    referralMessage: fullReferralMessage,
    status: needsImmediateReferral ? 'Pending Review' : 'Closed',
    notes: notes.join(' '),
  };
  
  console.log("Generated GBV Referral Object:", referralObject);

  return { 
    success: true, 
    message: "GBV Screening submitted successfully.",
    referralMessage: fullReferralMessage,
    referralDetails: referralObject 
  };
}
