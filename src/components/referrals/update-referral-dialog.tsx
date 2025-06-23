"use client";

import type { MockReferral } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UpdateReferralFormSchema, type UpdateReferralFormData } from '@/lib/schemas';
import { Edit3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

const serviceItems = [
  { id: 'HTS', label: 'HTS' },
  { id: 'PrEP', label: 'PrEP' },
  { id: 'ART', label: 'ART' },
  { id: 'GBV post Care', label: 'GBV post Care' },
  { id: 'STI Assessment', label: 'STI Assessment' },
  { id: 'PEP', label: 'PEP' },
  { id: 'TB Screening', label: 'TB Screening' },
  { id: 'PMTCT', label: 'PMTCT' },
  { id: 'ANC', label: 'ANC' },
  { id: 'Family Planning', label: 'Family Planning' },
  { id: 'Pap Smear', label: 'Pap Smear' },
  { id: 'Others', label: 'Others' },
] as const;

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
      services: referral.services || [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        status: referral.status,
        notes: referral.notes || '',
        services: referral.services || [],
      });
    }
  }, [isOpen, referral, form]);

  async function onSubmit(values: UpdateReferralFormData) {
    setIsSubmitting(true);
    console.log("Simulating update for referral ID:", referral.id, "with data:", values);
    
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Update Referral: {referral.patientName}</DialogTitle>
          <CardDescription className="text-sm text-muted-foreground pt-1">
            ID: {referral.id} | Facility: {referral.facility || 'N/A'}
          </CardDescription>
        </DialogHeader>

        <div className="py-2">
            <p className="text-sm font-semibold text-foreground/90 mb-1">Referral Reason:</p>
            <p className="text-sm text-muted-foreground">{referral.referralMessage}</p>
        </div>
        <Separator className="-mt-2 mb-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="services"
                render={() => (
                    <FormItem>
                        <FormLabel>Services Referred</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-48 overflow-y-auto">
                            {serviceItems.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="services"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                (field.value || []).filter(
                                                (value) => value !== item.id
                                                )
                                            );
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                </FormItem>
                                )}
                            />
                            ))}
                        </div>
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
