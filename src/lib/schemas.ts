import { z } from 'zod';

export const ForumPostSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }).max(150, { message: "Title must be 150 characters or less." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters long." }).max(5000, { message: "Content must be 5000 characters or less." }),
});

export type ForumPostFormData = z.infer<typeof ForumPostSchema>;

const AttendeeSchema = z.object({
  id: z.string().optional(), // For potential future use with dynamic fields
  name: z.string().min(2, { message: "Attendee name must be at least 2 characters." }),
  present: z.boolean().default(false),
});

export const AttendanceSchema = z.object({
  lessonName: z.string().min(3, { message: "Lesson name must be at least 3 characters." }),
  date: z.date({ required_error: "Please select a date for the lesson." }),
  attendees: z.array(AttendeeSchema).min(1, { message: "At least one attendee is required." }),
});

export type AttendanceFormData = z.infer<typeof AttendanceSchema>;


export const HivScreeningSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(1, { message: "Age must be a positive number." }).max(120, { message: "Please enter a valid age."}),
  sexualActivity: z.enum(["yes", "no", "prefer_not_to_say"], { required_error: "Please select an option for sexual activity." }),
  testingHistory: z.enum(["never_tested", "tested_negative", "tested_positive", "prefer_not_to_say"], { required_error: "Please select an option for testing history." }),
});

export type HivScreeningFormData = z.infer<typeof HivScreeningSchema>;
