
"use client";

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { CheckCircle, Info, Loader2 } from 'lucide-react';

export default function PrEpScreeningForm() {
  const { toast } = useToast();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrEpScreeningFormData>({
    resolver: zodResolver(PrEpScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      partnersLast6Months: undefined,
      knowPartnerStatus: undefined,
      consistentCondomUse: undefined,
      stiLast6Months: undefined,
      currentPrevention: '',
      wantsPrEpInfo: undefined,
    },
  });

  async function onSubmit(values: PrEpScreeningFormData) {
    setIsSubmitting(true);
    setReferralMessage(null);
    try {
      const result = await submitPrEpScreeningAction(values);
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Confidential PrEP Screening</CardTitle>
        <CardDescription>
          This screening helps assess if PrEP (Pre-Exposure Prophylaxis) might be right for you. 
          Your answers are confidential. This is not medical advice.
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
                  <FormControl><Input type="number" placeholder="Enter your age" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partnersLast6Months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">How many sexual partners have you had in the past 6 months?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-4">2-4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="knowPartnerStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Do you know the HIV status of all your sexual partners?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="yes_all">Yes, all of them</SelectItem>
                      <SelectItem value="yes_some">Yes, some of them</SelectItem>
                      <SelectItem value="no">No, I don't know for some/all</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consistentCondomUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">How consistently do you use condoms during sexual activity?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stiLast6Months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Have you been diagnosed with a sexually transmitted infection (STI) in the past 6 months?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentPrevention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Are you currently using any HIV prevention methods? If so, what?</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Condoms, PrEP, TasP. Leave blank if none." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="wantsPrEpInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Would you be interested in learning more about PrEP as an HIV prevention option?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I'm interested</SelectItem>
                      <SelectItem value="no">No, not at this time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              {isSubmitting ? 'Submitting...' : 'Submit PrEP Screening'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
