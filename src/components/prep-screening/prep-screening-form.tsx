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
import { submitPrEpScreeningAction } from '@/app/prep-screening/actions';
import { PrEpScreeningSchema, type PrEpScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, CheckCircle, Info, Loader2 } from 'lucide-react';

export default function PrEpScreeningForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [submissionResult, setSubmissionResult] = useState<{ message: string; referralId?: string; } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrEpScreeningFormData>({
    resolver: zodResolver(PrEpScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      phoneNumber: '',
      email: '',
      multiplePartners: undefined,
      unprotectedSex: undefined,
      unknownStatusPartners: undefined,
      atRiskPartners: undefined,
      sexUnderInfluence: undefined,
      newStiDiagnosis: undefined,
      considersAtRisk: undefined,
      usedPepMultipleTimes: undefined,
      forcedSex: undefined,
    },
  });

  async function onSubmit(values: PrEpScreeningFormData) {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const result = await submitPrEpScreeningAction(values);
      if (result.success) {
        toast({
          title: "Screening Submitted",
          description: result.message,
        });
        setSubmissionResult({
          message: result.referralMessage || "Your screening has been submitted.",
          referralId: result.referralDetails?.id,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit screening. Please try again.",
          variant: "destructive",
        });
        if (result.errors) {
          result.errors.forEach(error => {
            form.setError(error.path[0] as keyof PrEpScreeningFormData, { message: error.message });
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

  const renderQuestion = (fieldName: keyof PrEpScreeningFormData, label: string) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{label}</FormLabel>
          {/* This is the fix: field.value is now cast to a string */}
          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Select Yes or No" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  if (submissionResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Screening Submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={submissionResult.referralId ? "destructive" : "default"} className="mt-6">
            {submissionResult.referralId ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
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


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Confidential PrEP Screening</CardTitle>
        <CardDescription>
          This screening helps assess if PrEP might be right for you. Your answers are confidential. This is not medical advice.
          Please answer the following questions based on your experiences in the last six months.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Full Name</FormLabel>
                  <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Age</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter your age" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel className="text-lg">Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Enter your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-lg">Email Address (Optional)</FormLabel><FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl><FormMessage /></FormItem>)} />

            {renderQuestion("multiplePartners", "B1. Have you had sex with more than one sexual partner?")}
            {renderQuestion("unprotectedSex", "B2. Have you had sex without a condom on more than one occasion?")}
            {renderQuestion("unknownStatusPartners", "B3. Have you had sex with people whose HIV status you do not know?")}
            {renderQuestion("atRiskPartners", "B4. Are any of your partners at risk of HIV?")}
            {renderQuestion("sexUnderInfluence", "B5. Have you had sex under the influence of alcohol or other drugs?")}
            {renderQuestion("newStiDiagnosis", "B6. Have you received a new diagnosis of a sexually transmitted infection?")}
            {renderQuestion("considersAtRisk", "B7. Do you consider yourself at risk of getting HIV?")}
            {renderQuestion("usedPepMultipleTimes", "B8. Have you used PEP two times or more?")}
            {renderQuestion("forcedSex", "B9. Have you been forced to have sex against your will by your current sexual partner(s)?")}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit PrEP Screening'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
