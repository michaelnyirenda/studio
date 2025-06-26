"use client";

import type { MockReferral } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ScheduleAppointmentFormSchema, type ScheduleAppointmentFormData } from '@/lib/schemas';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { doc, Timestamp } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { scheduleAppointmentAction } from '@/app/referrals/actions';

interface ScheduleAppointmentDialogProps {
  referral: MockReferral;
}

export default function ScheduleAppointmentDialog({ referral }: ScheduleAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ScheduleAppointmentFormData>({
    resolver: zodResolver(ScheduleAppointmentFormSchema),
    defaultValues: {
      appointmentDateTime: referral.appointmentDateTime ? (referral.appointmentDateTime as Timestamp).toDate() : new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        appointmentDateTime: referral.appointmentDateTime ? (referral.appointmentDateTime as Timestamp).toDate() : new Date(),
      });
    }
  }, [isOpen, referral, form]);

  async function onSubmit(values: ScheduleAppointmentFormData) {
    setIsSubmitting(true);
    try {
      const result = await scheduleAppointmentAction(referral.id, values);
      if (result.success) {
        toast({
          title: "Appointment Scheduled",
          description: `An appointment for ${referral.patientName} has been scheduled.`,
        });
        setIsOpen(false);
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.message || "Could not schedule the appointment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error("Error scheduling appointment: ", e);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground h-9 w-9">
          <span className="sr-only">Schedule Appointment</span>
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="appointmentDateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Appointment Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP 'at' p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <input
                          type="time"
                          className="w-full border-input bg-input p-2 rounded-md"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const time = e.target.value;
                            if (!time) return;
                            const [hours, minutes] = time.split(':').map(Number);
                            const newDate = field.value ? new Date(field.value) : new Date();
                            newDate.setHours(hours, minutes, 0, 0);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Set Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
