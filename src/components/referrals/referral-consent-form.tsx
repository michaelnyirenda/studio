
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitReferralConsentAction } from '@/app/referrals/actions';
import { ReferralConsentSchema, type ReferralConsentFormData } from '@/lib/schemas';
import type { Referral } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const locationData = {
  "Ohangwena": {
    "Eenhana": ["Eenhana district hospital", "Eenhana clinic", "Onambutu", "Oshaango"],
    "Endola": ["Endola", "Ohaulushu", "Ongha"],
    "Engela": ["Engela district hospital", "Engela clinic", "Eudafano", "Omundudu"],
    "Epembe": ["Epembe", "Omuhongo", "Onangolo"],
    "Ohangwena": ["Ohangwena", "Okatope", "Onekwaya"],
    "Okongo": ["Okongo district hospital", "Ekoka", "Okongo clinic", "Olukula", "Omauni clinic – opening soon", "Omboloka"],
    "Omulonga": ["Ohaukelo", "Onamukulo", "Ongulayanetanga"],
    "Omundaungilo": ["Epinga", "Omundaungilo"],
    "Ondobe": ["Hamukoto wakappa", "Ondobe", "Oshandi"],
    "Ongenga": ["Okambebe", "Omungwelume", "Ongenga"],
    "Oshikango": ["Edundja", "Odibo Health Centre"],
    "Oshikunde": ["Oshikunde"],
  },
  "Omusati": {
    "All Facilities": [
        "Okahao District Hospital", "Okahao Clinic", "Indira Gandhi H/C", "Eendombe Clinic", "Onamatanga Clinic", "Uutsathima Clinic", "Nujoma-Eya Clinic", "Otamanzi Clinic", "Etilyasa Clinic", "Oluteyi Clinic", "Amarika Clinic", "Oshikuku District Hospital", "Okalongo H.C.", "Elim H/C", "St. Benedict Clinic (Oshitutuma)", "Omuthitugwonyama Clinic", "Omutundungu Clinic", "Odibwa Clinic", "Omagalanga Clinic", "Onaanda Clinic", "Onkani Clinic", "Olutsiidhi Clinic", "Onheleiwa Clinic", "Othika Clinic", "Okathitu Clinic", "Epoko Clinic", "Olupandu Clinic", "Iipandayaamiti Clinic", "Ogongo Clinic", "Okando Clinic", "Sheetekela", "Outapi District Hospital", "Omonawatjihozu H.C", "Mahenene H C", "Oshaala clinic", "Outapi Clinic", "Onawa Clinic", "Anamulenge Clinic", "Eunda Clinic", "Ruacana clinic", "Eengolo Clinic", "Tsandi District Hospital", "Onesi H/C", "Tsandi Clinic", "Oshitudha Clinic", "Okatseidhi Clinic", "Ongulumbashe Clinic", "Onamandongo Clinic", "Iilyateko Clinic", "Omakange Clinic"
    ]
  },
};

type LocationData = typeof locationData;
type Region = keyof LocationData;
type Constituency = keyof LocationData['Ohangwena'] | keyof LocationData['Omusati'];

interface ReferralConsentFormProps {
    referral: Referral;
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
            contactMethod: undefined,
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

    const constituencies = selectedRegion ? Object.keys(locationData[selectedRegion]).sort() : [];
    const facilities = (selectedRegion && selectedConstituency ? (locationData[selectedRegion] as Record<string, string[]>)[selectedConstituency] : undefined) ?? [];

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
                    <div className="space-y-6 pt-4 border-t">
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
                        <FormField
                            control={form.control}
                            name="contactMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-lg">Preferred Contact Method</FormLabel>
                                    <FormDescription>
                                        How would you like our support staff to contact you?
                                    </FormDescription>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-2 pt-2"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="whatsapp" />
                                                </FormControl>
                                                <FormLabel className="font-normal flex items-center gap-2">
                                                    <MessageSquare className="h-5 w-5 text-green-600" />
                                                    WhatsApp / SMS (using {referral.phoneNumber})
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="email" disabled={!referral.email} />
                                                </FormControl>
                                                <FormLabel className={cn("font-normal flex items-center gap-2", !referral.email && "text-muted-foreground/80")}>
                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                    Email {referral.email ? `(${referral.email})` : '(No email provided)'}
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
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
