
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
import { submitGbvScreeningAction } from '@/app/gbv-screening/actions';
import { GbvScreeningSchema, type GbvScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Loader2 } from 'lucide-react';

export default function GbvScreeningForm() {
  const { toast } = useToast();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GbvScreeningFormData>({
    resolver: zodResolver(GbvScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      feltUnsafe: undefined,
      experiencedHarm: undefined,
      hasSafePlace: undefined,
      wantsSupportInfo: undefined,
    },
  });

  async function onSubmit(values: GbvScreeningFormData) {
    setIsSubmitting(true);
    setReferralMessage(null);
    try {
      const result = await submitGbvScreeningAction(values);
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
            form.setError(error.path[0] as keyof GbvScreeningFormData, { message: error.message });
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
        <CardTitle className="font-headline text-2xl">Confidential GBV Screening</CardTitle>
        <CardDescription>
          This screening is confidential. Please answer honestly. Your safety and well-being are important.
          This tool provides general guidance and is not a substitute for professional advice.
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
              name="feltUnsafe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">In the past year, have you felt unsafe or threatened by someone?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
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
              name="experiencedHarm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Have you experienced physical, emotional, or sexual harm from someone?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
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
              name="hasSafePlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Do you have a safe place to go or someone you trust to talk to if you need help?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
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
              name="wantsSupportInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Would you like information about support services or resources for GBV?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
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
            {referralMessage && (
              <Alert variant={referralMessage.toLowerCase().includes("unsafe") || referralMessage.toLowerCase().includes("harm") ? "destructive" : "default"} className="mt-6">
                {referralMessage.toLowerCase().includes("unsafe") || referralMessage.toLowerCase().includes("harm") ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                <AlertTitle className="font-headline">Screening Recommendation</AlertTitle>
                <AlertDescription>{referralMessage}</AlertDescription>
              </Alert>
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
