"use client";

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitGbvScreeningAction } from '@/app/gbv-screening/actions';
import { GbvScreeningSchema, type GbvScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, CheckCircle, Info, Loader2, ShieldAlert } from 'lucide-react';

const emotionalViolenceItems = [
  { id: 'mocked', label: 'Mock you, insulted you or put you down?' },
  { id: 'controlled', label: 'Tried to control you, for example not letting you have money or food or go out of the house?' },
  { id: 'no', label: 'No' },
] as const;

const physicalViolenceItems = [
  { id: 'punched', label: 'Punched, slapped, shoved, kicked, choked, beat you with an object, burned you intentionally or physically harm you in some way?' },
  { id: 'threatened', label: 'Used or threatened you with a knife, gun, or other weapon?' },
  { id: 'no', label: 'No' },
] as const;

const sexualViolenceItems = [
  { id: 'touched', label: 'Ever touched in a sexual way (i.e., fondling, pinching, grabbing, or touching you on or around your sexual body parts) without you wanting to?' },
  { id: 'forced', label: 'Ever made you have sex, through physical force, harassment, threats, or tricks?' },
  { id: 'no', label: 'No' },
] as const;

export default function GbvScreeningForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [consent, setConsent] = useState<'agreed' | 'declined' | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{ message: string; referralId?: string; isHighRisk: boolean; } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GbvScreeningFormData>({
    resolver: zodResolver(GbvScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      phoneNumber: '',
      email: '',
      emotionalViolence: [],
      physicalViolence: [],
      sexualViolence: [],
    },
  });

  const watchEmotionalViolence = form.watch("emotionalViolence");
  const watchPhysicalViolence = form.watch("physicalViolence");
  const watchSexualViolence = form.watch("sexualViolence");

  const showSuicideQuestion = watchEmotionalViolence && watchEmotionalViolence.length > 0 && !watchEmotionalViolence.includes('no');
  const showInjuryQuestion = watchPhysicalViolence && watchPhysicalViolence.length > 0 && !watchPhysicalViolence.includes('no');
  const showTimelineQuestion = watchSexualViolence && watchSexualViolence.length > 0 && !watchSexualViolence.includes('no');

  async function onSubmit(values: GbvScreeningFormData) {
    setIsSubmitting(true);
    setSubmissionResult(null);

    const finalValues = { ...values };
    if (finalValues.sexualViolence.includes('no')) {
      finalValues.sexualViolenceTimeline = 'no_history';
    }

    try {
      const result = await submitGbvScreeningAction(finalValues);
      if (result.success) {
        toast({
          title: "Screening Submitted",
          description: result.message,
        });
        const isHighRisk = result.referralMessage?.toLowerCase().includes("immediate") || result.referralMessage?.toLowerCase().includes("urgent");
        setSubmissionResult({
          message: result.referralMessage || "No specific referral advice at this time.",
          referralId: result.referralDetails?.id,
          isHighRisk: !!isHighRisk,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit screening. Please try again.",
          variant: "destructive",
        });
        if (result.errors) {
          result.errors.forEach(error => {
            form.setError(error.path.join('.') as any, { message: error.message });
          });
        }
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

  if (submissionResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Screening Submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={submissionResult.isHighRisk ? "destructive" : "default"} className="mt-6">
            {submissionResult.isHighRisk ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            <AlertTitle className="font-headline">Screening Recommendation</AlertTitle>
            <AlertDescription>{submissionResult.message}</AlertDescription>
          </Alert>
          {submissionResult.referralId && (
            <div className="mt-6 flex justify-center">
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => router.push(`/referrals?pendingId=${submissionResult.referralId}`)}
              >
                Complete Your Referral <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (consent === null) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><ShieldAlert className="mr-2 h-6 w-6 text-destructive" />Important Information & Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle className="font-semibold">Definition of GBV</AlertTitle>
            <AlertDescription>
              GBV is defined as acts done against women, men, girls, and boys based on their sex. This causes or could cause them physical, sexual, psychological, emotional, or economic harm, including threats.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-foreground/90">
            You are free to decide whether to answer these questions or not. Based on your answers, we may be required to communicate with a government social worker or police to provide services and counselling as needed.
          </p>
          <p className="font-semibold">Do you agree to continue, understanding that we may be required to refer you to these services (or report abuse in case of Rape)?</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setConsent('declined')}>No, I Decline</Button>
          <Button onClick={() => setConsent('agreed')} className="bg-primary hover:bg-primary/90">Yes, I Agree</Button>
        </CardFooter>
      </Card>
    );
  }

  if (consent === 'declined') {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Screening Declined</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have declined to proceed with the screening. Your privacy is respected. If you need support, please consider using our confidential chat feature to speak with a support worker.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setConsent(null)}>Go Back</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Confidential GBV Screening</CardTitle>
        <CardDescription>
          Please answer honestly. Your safety and well-being are important.
          This tool provides general guidance and is not a substitute for professional advice.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-lg">Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel className="text-lg">Age</FormLabel><FormControl><Input type="number" placeholder="Enter your age" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel className="text-lg">Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Enter your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-lg">Email Address (Optional)</FormLabel><FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Separator />

            <FormField
              control={form.control}
              name="emotionalViolence"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg">C1. Have you experienced any of the following in the past 12 months by your partner or someone else? (Emotional Violence)</FormLabel>
                  <div className="space-y-2 pt-2">
                    {emotionalViolenceItems.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="emotionalViolence"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const currentVal = field.value || [];
                                  if (item.id === 'no') {
                                    return field.onChange(checked ? ['no'] : []);
                                  } else {
                                    const newArr = currentVal.filter(v => v !== 'no');
                                    return checked ? field.onChange([...newArr, item.id]) : field.onChange(newArr.filter((value) => value !== item.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showSuicideQuestion && (
              <FormField control={form.control} name="suicideAttempt" render={({ field }) => (<FormItem className="pl-4 border-l-4 border-destructive/50"><FormLabel className="text-lg text-destructive">C2. Have you attempted suicide/self-harm or have serious thoughts about suicide?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            )}
            <Separator />

            <FormField
              control={form.control}
              name="physicalViolence"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg">C3. Have you experienced any of the following in the past 12 months by your partner or someone else? (Physical Violence)</FormLabel>
                  <div className="space-y-2 pt-2">
                    {physicalViolenceItems.map((item) => (
                      <FormField key={item.id} control={form.control} name="physicalViolence" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { const currentVal = field.value || []; if (item.id === 'no') { return field.onChange(checked ? ['no'] : []); } else { const newArr = currentVal.filter(v => v !== 'no'); return checked ? field.onChange([...newArr, item.id]) : field.onChange(newArr.filter((value) => value !== item.id)); } }} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showInjuryQuestion && (
              <FormField control={form.control} name="seriousInjury" render={({ field }) => (<FormItem className="pl-4 border-l-4 border-destructive/50"><FormLabel className="text-lg text-destructive">C4. Do you have a serious injury requiring urgent medical attention?</FormLabel><FormDescription>Please observe for any signs of physical injury and hiding parts of the body.</FormDescription><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            )}
            <Separator />

            <FormField
              control={form.control}
              name="sexualViolence"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg">C5. Have you experienced any of the following in your lifetime by your partner or someone else? (Sexual Violence)</FormLabel>
                  <div className="space-y-2 pt-2">
                    {sexualViolenceItems.map((item) => (
                      <FormField key={item.id} control={form.control} name="sexualViolence" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { const currentVal = field.value || []; if (item.id === 'no') { return field.onChange(checked ? ['no'] : []); } else { const newArr = currentVal.filter(v => v !== 'no'); return checked ? field.onChange([...newArr, item.id]) : field.onChange(newArr.filter((value) => value !== item.id)); } }} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showTimelineQuestion && (
              <FormField control={form.control} name="sexualViolenceTimeline" render={({ field }) => (<FormItem className="pl-4 border-l-4 border-destructive/50"><FormLabel className="text-lg text-destructive">C6. When did you experience the sexual violence?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl><SelectContent><SelectItem value="le_72_hr">≤ 72 hours</SelectItem><SelectItem value="gt_72_le_120_hr">&gt; 72 hours to ≤ 120 hours</SelectItem><SelectItem value="gt_120_hr">&gt; 120 hours (&gt; 5 days)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit GBV Screening'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
