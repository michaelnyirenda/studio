
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
import { submitStiScreeningAction } from '@/app/sti-screening/actions';
import { StiScreeningSchema, type StiScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Loader2 } from 'lucide-react';

export default function StiScreeningForm() {
  const { toast } = useToast();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StiScreeningFormData>({
    resolver: zodResolver(StiScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      diagnosedOrTreated: undefined,
      abnormalDischarge: undefined,
      vaginalItchiness: undefined,
      genitalSores: undefined,
    },
  });

  async function onSubmit(values: StiScreeningFormData) {
    setIsSubmitting(true);
    setReferralMessage(null);
    try {
      const result = await submitStiScreeningAction(values);
      if (result.success) {
        toast({
          title: "Screening Submitted",
          description: result.message,
        });
        setReferralMessage(result.referralMessage || "No specific referral advice at this time.");
        form.reset(); 
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit screening. Please try again.",
          variant: "destructive",
        });
         if (result.errors) {
          result.errors.forEach(error => {
            form.setError(error.path[0] as keyof StiScreeningFormData, { message: error.message });
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
  
  const renderQuestion = (fieldName: keyof StiScreeningFormData, label: string) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Confidential STI Screening</CardTitle>
        <CardDescription>
          This screening is for informational purposes and is not a medical diagnosis. Your answers are confidential.
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
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="number" placeholder="Enter your age" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {renderQuestion("diagnosedOrTreated", "D1. Have you ever been diagnosed or treated for STI?")}
            {renderQuestion("abnormalDischarge", "D2. Do you have any abnormal vaginal discharge (more than normal, abnormal colour? foul smelling)?")}
            {renderQuestion("vaginalItchiness", "D3. Do you have any vaginal itchiness or abnormal discomfort?")}
            {renderQuestion("genitalSores", "D4. Do you have sore, ulcers, or wounds on your genitals?")}
            
            {referralMessage && (
              <Alert variant={referralMessage.toLowerCase().includes("recommend") ? "destructive" : "default"} className="mt-6">
                {referralMessage.toLowerCase().includes("recommend") ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                <AlertTitle className="font-headline">Screening Recommendation</AlertTitle>
                <AlertDescription>{referralMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit STI Screening'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
