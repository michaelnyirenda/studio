
import { z } from 'zod';

export const ForumPostSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }).max(150, { message: "Title must be 150 characters or less." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters long." }).max(5000, { message: "Content must be 5000 characters or less." }),
});

export type ForumPostFormData = z.infer<typeof ForumPostSchema>;

export const HivScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  sexualActivity: z.enum(["yes", "no", "prefer_not_to_say"], { required_error: "Please select an option for sexual activity." }),
  testingHistory: z.enum(["never_tested", "tested_negative", "tested_positive", "prefer_not_to_say"], { required_error: "Please select an option for testing history." }),
});

export type HivScreeningFormData = z.infer<typeof HivScreeningSchema>;

export const UpdateReferralFormSchema = z.object({
  status: z.enum(['Pending Review', 'Contacted', 'Follow-up Scheduled', 'Closed'], { required_error: "Please select a status."}),
  notes: z.string().max(1000, { message: "Notes must be 1000 characters or less." }).optional(),
});
export type UpdateReferralFormData = z.infer<typeof UpdateReferralFormSchema>;
