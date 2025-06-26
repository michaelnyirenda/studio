
"use client";

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitReferralConsentAction } from '@/app/referrals/actions';
import { ReferralConsentSchema, type ReferralConsentFormData } from '@/lib/schemas';
import type { MockReferral } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from 'lucide-react';

const locationData = {
  "Region 1": {
    "Constituency 1.1": ["Clinic A", "Clinic B", "Clinic C"],
    "Constituency 1.2": ["Clinic D", "Clinic E"],
  },
  "Region 2": {
    "Constituency 2.1": ["Clinic F", "Clinic G"],
    "Constituency 2.2": ["Clinic H", "Clinic I", "Clinic J"],
  },
  "Region 3": {
    "Constituency 3.1": ["Clinic K"],
    "Constituency 3.2": ["Clinic L", "Clinic M"],
  }
};

type LocationData = typeof locationData;
type Region = keyof LocationData;
type Constituency = keyof LocationData[Region];

interface ReferralConsentFormProps {
    referral: MockReferral;
    onConsentSubmit: (referralId: string, data: ReferralConsentFormData) => void;
}

export default function ReferralConsentForm({ referral, onConsentSubmit }: ReferralConsentFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ReferralConsentFormData>({
        resolver: zodResolver(ReferralConsentSchema),
        defaultValues: {
            consent: false,
            region: undefined,
            constituency: undefined,
            facility: undefined,
        },
    });

    const hasAgreed = useWatch({ control: form.control, name: 'consent' });
    const selectedRegion = useWatch({ control: form.control, name: 'region' }) as Region | undefined;
    const selectedConstituency = useWatch({ control: form.control, name: 'constituency' }) as Constituency | undefined;
    
    useEffect(() => {
        form.setValue('constituency', undefined, { shouldValidate: true });
        form.setValue('facility', undefined, { shouldValidate: true });
    }, [selectedRegion, form]);

    useEffect(() => {
        form.setValue('facility', undefined, { shouldValidate: true });
    }, [selectedConstituency, form]);

    const constituencies = selectedRegion ? Object.keys(locationData[selectedRegion]) : [];
    const facilities = selectedRegion && selectedConstituency ? locationData[selectedRegion][selectedConstituency] : [];

    async function onSubmit(values: ReferralConsentFormData) {
        setIsSubmitting(true);
        try {
            const result = await submitReferralConsentAction(referral.id, values);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: result.message,
                });
                onConsentSubmit(referral.id, values);
            } else {
                 toast({
                    title: "Error",
                    description: result.message || "Failed to submit consent. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-2 border-accent bg-card">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-accent">Action Required: Referral Consent</CardTitle>
                <CardDescription>
                    A referral has been generated based on your screening responses. Please review and provide your consent to proceed.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Generated Referral For: {referral.patientName}</AlertTitle>
                    <AlertDescription>
                        {referral.referralMessage}
                    </AlertDescription>
                </Alert>

                 <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="font-semibold">
                             I agree to be referred for the services mentioned above.
                            </FormLabel>
                             <FormMessage />
                        </div>
                        </FormItem>
                    )}
                 />

                {hasAgreed && (
                    <div className="space-y-4 pt-4 border-t">
                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Region</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Choose a region" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.keys(locationData).map(region => (
                                                <SelectItem key={region} value={region}>{region}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="constituency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Constituency</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedRegion}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Choose a constituency" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {constituencies.map(constituency => (
                                                <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="facility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Health Facility</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedConstituency}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Choose a clinic or facility" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {facilities.map(facility => (
                                                <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                     <FormDescription>
                                        Please select a facility where you would like to receive services.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={isSubmitting || !hasAgreed}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Confirm Referral'}
                </Button>
            </CardFooter>
        </form>
        </Form>
    </Card>
  );
}
