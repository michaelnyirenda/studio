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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitHivScreeningAction } from '@/app/hiv-screening/actions';
import { HivScreeningSchema, type HivScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Loader2 } from 'lucide-react';


export default function ScreeningForm() {
  const { toast } = useToast();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HivScreeningFormData>({
    resolver: zodResolver(HivScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined, // Default to undefined for numeric input
      sexualActivity: undefined,
      testingHistory: undefined,
    },
  });

  async function onSubmit(values: HivScreeningFormData) {
    setIsSubmitting(true);
    setReferralMessage(null); // Clear previous message
    try {
      const result = await submitHivScreeningAction(values);
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
            form.setError(error.path[0] as keyof HivScreeningFormData, { message: error.message });
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
        <CardTitle className="font-headline text-2xl">Confidential HIV Screening</CardTitle>
        <CardDescription>
          Please answer the following questions honestly. Your information will be handled with privacy.
          This tool provides general guidance and is not a substitute for professional medical advice.
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
                    <Input type="number" placeholder="Enter your age" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sexualActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Are you currently sexually active?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
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
              name="testingHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">What is your HIV testing history?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never_tested">Never tested</SelectItem>
                      <SelectItem value="tested_negative">Tested negative in the past</SelectItem>
                      <SelectItem value="tested_positive">Tested positive in the past</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {referralMessage && (
              <Alert variant={referralMessage.toLowerCase().includes("recommended") ? "destructive" : "default"} className="mt-6">
                {referralMessage.toLowerCase().includes("recommended") ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                <AlertTitle className="font-headline">Screening Recommendation</AlertTitle>
                <AlertDescription>{referralMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Screening'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
