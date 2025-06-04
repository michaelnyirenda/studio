
"use client";

import type { MockReferral } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { UpdateReferralFormSchema, type UpdateReferralFormData } from '@/lib/schemas';
import { Edit3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';

interface UpdateReferralDialogProps {
  referral: MockReferral;
}

export default function UpdateReferralDialog({ referral }: UpdateReferralDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateReferralFormData>({
    resolver: zodResolver(UpdateReferralFormSchema),
    defaultValues: {
      status: referral.status,
      notes: referral.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        status: referral.status,
        notes: referral.notes || '',
      });
    }
  }, [isOpen, referral, form]);

  async function onSubmit(values: UpdateReferralFormData) {
    setIsSubmitting(true);
    console.log("Simulating update for referral ID:", referral.id, "with data:", values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Update Simulated",
      description: `Changes for ${referral.patientName} logged to console. Data is NOT persisted in this demo.`,
    });
    setIsSubmitting(false);
    setIsOpen(false); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-accent border-accent hover:bg-accent/10">
          <Edit3 className="mr-2 h-4 w-4" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Update Referral: {referral.patientName}</DialogTitle>
          <CardDescription className="text-sm text-muted-foreground pt-1">
            ID: {referral.id}
          </CardDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormItem>
              <FormLabel>Patient Name</FormLabel>
              <Input value={referral.patientName} readOnly className="bg-secondary/30 border-border/50" />
            </FormItem>

            <FormItem>
              <FormLabel>Referred On</FormLabel>
              <Input value={referral.referralDate} readOnly className="bg-secondary/30 border-border/50" />
            </FormItem>
            
            <FormItem>
              <FormLabel>Referral Reason/Message</FormLabel>
              <Textarea value={referral.referralMessage} readOnly className="bg-secondary/30 border-border/50 h-28 resize-none" />
            </FormItem>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending Review">Pending Review</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Follow-up Scheduled">Follow-up Scheduled</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add or update notes..." {...field} className="min-h-[100px]" />
                  </FormControl>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
