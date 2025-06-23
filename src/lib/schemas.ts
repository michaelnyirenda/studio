
import { z } from 'zod';

export const ForumPostSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }).max(150, { message: "Title must be 150 characters or less." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters long." }).max(5000, { message: "Content must be 5000 characters or less." }),
});

export type ForumPostFormData = z.infer<typeof ForumPostSchema>;

export const HivScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  
  // A1
  knowsHivStatus: z.enum(['yes', 'no', 'no_answer'], { required_error: "Please select an option." }),
  // A2
  lastTestDate: z.enum(['less_than_3_months', '3_to_6_months', '6_to_12_months', 'more_than_12_months', 'never_tested'], { required_error: "Please select an option." }),
  // A3
  lastTestResult: z.enum(['positive', 'negative', 'dont_know', 'refused']).optional(),
  // A4
  treatmentStatus: z.enum(['taking_art', 'started_stopped', 'not_on_art', 'dont_know']).optional(),
  // A5
  hadSex: z.enum(['within_6_months', '6_to_12_months', 'more_than_12_months', 'never', 'refused'], { required_error: "Please select an option." }),
  // A6
  usedCondoms: z.enum(['yes', 'no', 'cant_remember', 'refused']).optional(),
  // A7
  transactionalSex: z.enum(['yes', 'no', 'forced', 'refused']).optional(),
  // A8
  multiplePartners: z.enum(['no', 'two', 'three_or_more', 'dont_remember', 'refused']).optional(),
  // A9
  partnerAgeDifferenceP1: z.enum(['0-3', '4-9', '10+', 'dont_know']).optional(),
  partnerAgeDifferenceP2: z.enum(['0-3', '4-9', '10+', 'dont_know']).optional(),
  partnerAgeDifferenceP3: z.enum(['0-3', '4-9', '10+', 'dont_know']).optional(),
  // A10
  consumedAlcohol: z.enum(['any', 'none', 'cant_remember', 'refused'], { required_error: "Please select an option." }),
  // A11
  alcoholFrequency: z.enum(['every_day', 'every_week', '2_3_times_month', 'once_month', 'special_occasions', 'never']).optional(),
  // A12
  symptoms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }).optional(),
  // A13
  pregnancyHistory: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }).optional(),
  // A14
  attendingAnc: z.enum(['attending_anc', 'attending_post_natal', 'eligible_not_attending', 'na']).optional(),
  // A15
  isOrphan: z.enum(['yes', 'no'], { required_error: "Please select an option." }),
  orphanStatus: z.enum(['single', 'double', 'child_headed']).optional(),
  // A16
  hasDisability: z.enum(['yes', 'no'], { required_error: "Please select an option." }),
  isDisabilityRegistered: z.enum(['yes', 'no']).optional(),
}).superRefine((data, ctx) => {
    if (data.lastTestDate !== 'never_tested' && !data.lastTestResult) {
        ctx.addIssue({
            code: 'custom',
            path: ['lastTestResult'],
            message: 'Result is required if you have been tested before.',
        });
    }
    if (data.lastTestResult === 'positive' && !data.treatmentStatus) {
        ctx.addIssue({
            code: 'custom',
            path: ['treatmentStatus'],
            message: 'Treatment status is required if you tested positive.',
        });
    }
     if (data.hadSex !== 'never' && !data.usedCondoms) {
        ctx.addIssue({ code: 'custom', path: ['usedCondoms'], message: 'This question is required.' });
    }
    if (data.hadSex !== 'never' && !data.transactionalSex) {
        ctx.addIssue({ code: 'custom', path: ['transactionalSex'], message: 'This question is required.' });
    }
    if (data.hadSex !== 'never' && !data.multiplePartners) {
        ctx.addIssue({ code: 'custom', path: ['multiplePartners'], message: 'This question is required.' });
    }
    if (data.consumedAlcohol === 'any' && !data.alcoholFrequency) {
        ctx.addIssue({
            code: 'custom',
            path: ['alcoholFrequency'],
            message: 'Frequency is required if you consume alcohol.',
        });
    }
    if (data.isOrphan === 'yes' && !data.orphanStatus) {
        ctx.addIssue({
            code: 'custom',
            path: ['orphanStatus'],
            message: 'Orphan status is required if applicable.',
        });
    }
    if (data.hasDisability === 'yes' && !data.isDisabilityRegistered) {
        ctx.addIssue({
            code: 'custom',
            path: ['isDisabilityRegistered'],
            message: 'Registration status is required if you have a disability.',
        });
    }
    if (data.pregnancyHistory && data.pregnancyHistory.length > 0 && !data.pregnancyHistory.includes('never_pregnant') && !data.attendingAnc) {
       ctx.addIssue({
            code: 'custom',
            path: ['attendingAnc'],
            message: 'This field is required based on your pregnancy history.',
        });
    }
});
export type HivScreeningFormData = z.infer<typeof HivScreeningSchema>;

const emotionalViolenceOptions = z.enum(['mocked', 'controlled', 'no']);
const physicalViolenceOptions = z.enum(['punched', 'threatened', 'no']);
const sexualViolenceOptions = z.enum(['touched', 'forced', 'no']);

export const GbvScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  
  // C1
  emotionalViolence: z.array(emotionalViolenceOptions).min(1, { message: "Please select at least one option for Emotional Violence." }),
  // C2
  suicideAttempt: z.enum(['yes', 'no']).optional(),
  // C3
  physicalViolence: z.array(physicalViolenceOptions).min(1, { message: "Please select at least one option for Physical Violence." }),
  // C4
  seriousInjury: z.enum(['yes', 'no']).optional(),
  // C5
  sexualViolence: z.array(sexualViolenceOptions).min(1, { message: "Please select at least one option for Sexual Violence." }),
  // C6
  sexualViolenceTimeline: z.enum(['le_72_hr', 'gt_72_le_120_hr', 'gt_120_hr', 'no_history']).optional(),
}).superRefine((data, ctx) => {
    // C2 is required if C1 is not 'no'
    if (data.emotionalViolence.length > 0 && !data.emotionalViolence.includes('no') && !data.suicideAttempt) {
        ctx.addIssue({ code: 'custom', path: ['suicideAttempt'], message: 'This question is required based on your previous answer.' });
    }
    // C4 is required if C3 is not 'no'
    if (data.physicalViolence.length > 0 && !data.physicalViolence.includes('no') && !data.seriousInjury) {
        ctx.addIssue({ code: 'custom', path: ['seriousInjury'], message: 'This question is required based on your previous answer.' });
    }
    // C6 is required if C5 is not 'no'
    if (data.sexualViolence.length > 0 && !data.sexualViolence.includes('no') && !data.sexualViolenceTimeline) {
        ctx.addIssue({ code: 'custom', path: ['sexualViolenceTimeline'], message: 'This question is required based on your previous answer.' });
    }
     // If C5 is 'no', then sexualViolenceTimeline must be 'no_history'
    if (data.sexualViolence.includes('no') && data.sexualViolenceTimeline && data.sexualViolenceTimeline !== 'no_history') {
       ctx.addIssue({ code: 'custom', path: ['sexualViolenceTimeline'], message: "This should be 'No History' if you selected 'No' for sexual violence." });
    }
});
export type GbvScreeningFormData = z.infer<typeof GbvScreeningSchema>;

export const PrEpScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  multiplePartners: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  unprotectedSex: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  unknownStatusPartners: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  atRiskPartners: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  sexUnderInfluence: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  newStiDiagnosis: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  considersAtRisk: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  usedPepMultipleTimes: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
  forcedSex: z.enum(['yes', 'no'], { required_error: "Please answer this question." }),
});
export type PrEpScreeningFormData = z.infer<typeof PrEpScreeningSchema>;

export const StiScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  symptoms: z.enum(['yes', 'no', 'unsure'], { required_error: "Please select an option." }),
  partnerSymptoms: z.enum(['yes', 'no', 'unsure', 'unknown'], { required_error: "Please select an option." }),
  wantsTesting: z.enum(['yes', 'no'], { required_error: "Please select an option." }),
});
export type StiScreeningFormData = z.infer<typeof StiScreeningSchema>;


export const UpdateReferralFormSchema = z.object({
  status: z.enum(['Pending Review', 'Contacted', 'Follow-up Scheduled', 'Closed'], { required_error: "Please select a status."}),
  notes: z.string().max(1000, { message: "Notes must be 1000 characters or less." }).optional(),
});
export type UpdateReferralFormData = z.infer<typeof UpdateReferralFormSchema>;


export const ChatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }).max(1000, { message: "Message must be 1000 characters or less." }),
});
export type ChatMessageFormData = z.infer<typeof ChatMessageSchema>;

export const ChatResponseSchema = z.object({
  response: z.string(),
});
export type ChatResponseType = z.infer<typeof ChatResponseSchema>;


export const AttendanceSchema = z.object({
  lessonName: z.string({ required_error: "Please select a lesson." }),
  date: z.date({ required_error: "Please select a date." }),
  attendees: z.array(z.object({
    name: z.string().min(1, "Name cannot be empty."),
    present: z.boolean(),
  })).min(1, "You must add at least one attendee."),
});

export type AttendanceFormData = z.infer<typeof AttendanceSchema>;
