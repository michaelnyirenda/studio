
"use client";

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from 'lucide-react';

const mockFacilities = [
    "City Health Clinic",
    "Downtown Women's Center",
    "General Hospital",
    "Community Wellness Hub",
    "Northside Youth Services"
];

interface ReferralConsentFormProps {
    referral: MockReferral;
    onConsentSubmit: (referralId: string, facility: string) => void;
}

export default function ReferralConsentForm({ referral, onConsentSubmit }: ReferralConsentFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);

    const form = useForm<ReferralConsentFormData>({
        resolver: zodResolver(ReferralConsentSchema),
        defaultValues: {
            consent: false,
            facility: undefined,
        },
    });

    async function onSubmit(values: ReferralConsentFormData) {
        setIsSubmitting(true);
        try {
            const result = await submitReferralConsentAction(referral.id, values);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: result.message,
                });
                onConsentSubmit(referral.id, values.facility);
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
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-accent">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Action Required: Referral Consent</CardTitle>
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                                field.onChange(checked)
                                setHasAgreed(!!checked)
                            }}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                             I agree to be referred for the services mentioned above.
                            </FormLabel>
                             <FormMessage />
                        </div>
                        </FormItem>
                    )}
                 />

                {hasAgreed && (
                    <FormField
                        control={form.control}
                        name="facility"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">Select a Facility</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a healthcare facility" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {mockFacilities.map(facility => (
                                        <SelectItem key={facility} value={facility}>
                                        {facility}
                                        </SelectItem>
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
                )}
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting || !hasAgreed}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Confirm Referral'}
                </Button>
            </CardFooter>
        </form>
        </Form>
    </Card>
  );
}
