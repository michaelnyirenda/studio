
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
import { CalendarIcon, Edit3, Loader2, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScreeningDetailsDisplay from './screening-details-display';
import { Skeleton } from '../ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [screeningDetails, setScreeningDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const form = useForm<UpdateReferralFormData>({
    resolver: zodResolver(UpdateReferralFormSchema),
    defaultValues: {
      status: referral.status,
      notes: referral.notes || '',
      services: referral.services || [],
      appointmentDateTime: referral.appointmentDateTime ? (referral.appointmentDateTime as Timestamp).toDate() : undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        status: referral.status,
        notes: referral.notes || '',
        services: referral.services || [],
        appointmentDateTime: referral.appointmentDateTime ? (referral.appointmentDateTime as Timestamp).toDate() : undefined,
      });
      
      if (referral.screeningId && referral.type) {
        const fetchScreeningDetails = async () => {
            setIsLoadingDetails(true);
            setScreeningDetails(null);
            try {
                let collectionName = '';
                switch (referral.type) {
                    case 'HIV': collectionName = 'hivScreenings'; break;
                    case 'GBV': collectionName = 'gbvScreenings'; break;
                    case 'PrEP': collectionName = 'prepScreenings'; break;
                    case 'STI': collectionName = 'stiScreenings'; break;
                }

                if (collectionName) {
                    const screeningRef = doc(db, collectionName, referral.screeningId);
                    const screeningSnap = await getDoc(screeningRef);
                    if (screeningSnap.exists()) {
                        setScreeningDetails(screeningSnap.data());
                    } else {
                        setScreeningDetails({ error: "Screening details not found." });
                    }
                }
            } catch (error) {
                console.error("Error fetching screening details:", error);
                setScreeningDetails({ error: "Failed to load screening details." });
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchScreeningDetails();
      }
    }
  }, [isOpen, referral, form]);

  async function onSubmit(values: UpdateReferralFormData) {
    setIsSubmitting(true);
    
    try {
      const referralRef = doc(db, 'referrals', referral.id);
      await updateDoc(referralRef, {
          status: values.status,
          notes: values.notes,
          services: values.services,
          appointmentDateTime: values.appointmentDateTime ? Timestamp.fromDate(values.appointmentDateTime) : null,
      });

      toast({
        title: "Update Successful",
        description: `Referral for ${referral.patientName} has been updated.`,
      });
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (e) {
        console.error("Error updating referral: ", e);
        toast({
          title: "Update Failed",
          description: "Could not update the referral. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
    }
  }

  const location = [referral.region, referral.constituency, referral.facility].filter(Boolean).join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
            <span className="sr-only">Update</span>
            <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-2xl flex flex-col max-h-[90vh]"
        onPointerDownOutside={(e) => {
            if (e.target.closest('[data-radix-popper-content-wrapper]')) {
                e.preventDefault();
            }
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Referral: {referral.patientName}</DialogTitle>
           <CardDescription className="text-sm text-muted-foreground pt-2">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-center">
              <span className="font-semibold text-right">ID:</span>
              <span className="font-mono text-xs">{referral.id}</span>

              <span className="font-semibold text-right">Location:</span>
              <span className="truncate">{location || 'N/A'}</span>

              {referral.contactMethod && (
                <>
                  <span className="font-semibold text-right">Contact:</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                      {referral.contactMethod === 'email' ? <Mail className="h-4 w-4 text-blue-500" /> : <MessageSquare className="h-4 w-4 text-green-500" />}
                      <span>{referral.contactMethod === 'email' ? referral.email : referral.phoneNumber}</span>
                  </span>
                </>
              )}
            </div>
          </CardDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-6 -mr-6 space-y-4">
            <div className="py-2">
                <p className="text-sm font-semibold text-foreground/90 mb-1">Referral Reason:</p>
                <p className="text-sm text-muted-foreground">{referral.referralMessage}</p>
            </div>
            
            {referral.screeningId && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Screening Answers</AccordionTrigger>
                        <AccordionContent>
                            {isLoadingDetails ? (
                            <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[80%]" />
                                    <Skeleton className="h-4 w-full" />
                            </div>
                            ) : screeningDetails ? (
                            <div className="max-h-[30vh] overflow-y-auto pr-3">
                                <ScreeningDetailsDisplay details={screeningDetails} type={referral.type} />
                            </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No screening details are linked to this referral.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
            
            <Separator className="my-2" />

            <Form {...form}>
            <form id="update-referral-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                {field.value ? format(field.value, "PPP 'at' HH:mm") : <span>Pick a date and time</span>}
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
            </form>
            </Form>
        </div>
        
        <DialogFooter className="pt-4 mt-auto border-t flex-shrink-0">
            <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="update-referral-form" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
