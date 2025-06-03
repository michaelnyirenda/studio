"use server";

import type { AttendanceFormData } from '@/lib/schemas';
import { AttendanceSchema } from '@/lib/schemas';
import type * as z from 'zod';

export async function submitAttendanceAction(
  data: AttendanceFormData
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = AttendanceSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: "Validation failed.", errors: validationResult.error.issues };
  }

  // Simulate saving to a database or calling an API
  console.log("Attendance Data:", validationResult.data);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

  const presentCount = validationResult.data.attendees.filter(a => a.present).length;
  const totalCount = validationResult.data.attendees.length;

  return { success: true, message: `Attendance for "${validationResult.data.lessonName}" recorded successfully. ${presentCount}/${totalCount} attendees marked present.` };
}
