
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitHivScreeningAction } from '@/app/hiv-screening/actions';
import { HivScreeningSchema, type HivScreeningFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const symptomsItems = [
  { id: 'coughing', label: 'Coughing' },
  { id: 'weight_loss', label: 'Weight loss' },
  { id: 'night_sweats', label: 'Night sweats' },
  { id: 'fever', label: 'Fever' },
  { id: 'swelling', label: 'Swelling (neck, armpit, or groin)' },
  { id: 'no', label: 'None of the above' },
] as const;

const pregnancyItems = [
  { id: 'currently_pregnant', label: 'Currently pregnant' },
  { id: 'pregnant_in_past', label: 'Pregnant in the past' },
  { id: 'child_passed_on', label: 'Child passed on' },
  { id: 'child_under_2', label: 'Have a child ≤ 2 years' },
  { id: 'child_over_2', label: 'Have a child older than 2 years' },
  { id: 'abortion_miscarriage', label: 'Had a history of abortion or miscarriage' },
  { id: 'never_pregnant', label: 'Never been pregnant' },
] as const;


export default function ScreeningForm() {
  const { toast } = useToast();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HivScreeningFormData>({
    resolver: zodResolver(HivScreeningSchema),
    defaultValues: {
      name: '',
      age: undefined,
      knowsHivStatus: undefined,
      lastTestDate: undefined,
      hadSex: undefined,
      usedCondoms: undefined,
      transactionalSex: undefined,
      multiplePartners: undefined,
      consumedAlcohol: undefined,
      symptoms: [],
      pregnancyHistory: [],
      isOrphan: undefined,
      hasDisability: undefined,
    },
  });

  const watchLastTestDate = form.watch("lastTestDate");
  const watchLastTestResult = form.watch("lastTestResult");
  const watchConsumedAlcohol = form.watch("consumedAlcohol");
  const watchIsOrphan = form.watch("isOrphan");
  const watchHasDisability = form.watch("hasDisability");
  const watchPregnancyHistory = form.watch("pregnancyHistory");
  const watchHadSex = form.watch("hadSex");
  const watchMultiplePartners = form.watch("multiplePartners");
  
  async function onSubmit(values: HivScreeningFormData) {
    setIsSubmitting(true);
    setReferralMessage(null);
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
          console.log(result.errors);
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

  const renderQuestion = (name: keyof HivScreeningFormData, question: string, options: {value: string, label: string}[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{question}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
            <SelectContent>
              {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Confidential HIV Screening</CardTitle>
        <CardDescription>
          This tool provides general guidance and is not a substitute for professional medical advice. 
          Your information will be handled with privacy.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
               <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-lg">Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel className="text-lg">Age</FormLabel><FormControl><Input type="number" placeholder="Enter your age" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Separator/>
             {/* HIV Testing History */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">HIV Testing</h3>
              {renderQuestion("knowsHivStatus", "A1. Do you know your HIV Status?", [{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}, {value: 'no_answer', label: 'No answer'}])}
              {renderQuestion("lastTestDate", "A2. When last did you have an HIV Test Done?", [{value: 'less_than_3_months', label: 'Less than 3 months back'}, {value: '3_to_6_months', label: '3-6 months back'}, {value: '6_to_12_months', label: '6-12 months back'}, {value: 'more_than_12_months', label: 'More than 12 months back'}, {value: 'never_tested', label: 'Never tested'}])}
              {watchLastTestDate !== 'never_tested' && renderQuestion("lastTestResult", "A3. What was the result for your most recent HIV test?", [{value: 'positive', label: 'HIV Positive'}, {value: 'negative', label: 'HIV Negative'}, {value: 'dont_know', label: 'Do not know'}, {value: 'refused', label: 'Refused to answer'}])}
              {watchLastTestResult === 'positive' && renderQuestion("treatmentStatus", "A4. If HIV positive, what is your treatment status?", [{value: 'taking_art', label: 'Currently taking ART'}, {value: 'started_stopped', label: 'Started ART but Stopped'}, {value: 'not_on_art', label: 'Not on ART'}, {value: 'dont_know', label: 'Do not know'}])}
            </div>
            <Separator/>
            {/* Sexual History */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Sexual History</h3>
              {renderQuestion("hadSex", "A5. Have you ever had sexual intercourse?", [{value: 'within_6_months', label: 'Yes (within the last six months)'}, {value: '6_to_12_months', label: 'Yes (6-12 months back)'}, {value: 'more_than_12_months', label: 'Yes (more than 12 months back)'}, {value: 'never', label: 'Never had Sex'}, {value: 'refused', label: 'Refused to answer'}])}
              {watchHadSex !== 'never' && renderQuestion("usedCondoms", "A6. In the past 12 months, did you use condoms every time you had sex?", [{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}, {value: 'cant_remember', label: 'Can’t Remember'}, {value: 'refused', label: 'Refused to answer'}])}
              {watchHadSex !== 'never' && renderQuestion("transactionalSex", "A7. Have you ever had sex for food, gifts, support, or other benefits?", [{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}, {value: 'forced', label: 'Forced'}, {value: 'refused', label: 'Refused to answer'}])}
              {watchHadSex !== 'never' && renderQuestion("multiplePartners", "A8. In the past 12 months, have you had more than one sexual partner?", [{value: 'no', label: 'No'}, {value: 'two', label: 'Yes, two partners'}, {value: 'three_or_more', label: 'Yes, three or more partners'}, {value: 'dont_remember', label: 'Yes, I don’t remember the number'}, {value: 'refused', label: 'Refused to answer'}])}
              
              {watchHadSex !== 'never' && (
                <FormItem>
                  <FormLabel className="text-lg">A9. What is the age difference between you and your sexual partner(s)?</FormLabel>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderQuestion("partnerAgeDifferenceP1", "Partner 1", [{value: '0-3', label: '0-3 years'}, {value: '4-9', label: '4-9 years'}, {value: '10+', label: '10+ years'}, {value: 'dont_know', label: 'Don’t know'}])}
                    {(watchMultiplePartners === 'two' || watchMultiplePartners === 'three_or_more' || watchMultiplePartners === 'dont_remember') && renderQuestion("partnerAgeDifferenceP2", "Partner 2", [{value: '0-3', label: '0-3 years'}, {value: '4-9', label: '4-9 years'}, {value: '10+', label: '10+ years'}, {value: 'dont_know', label: 'Don’t know'}])}
                    {(watchMultiplePartners === 'three_or_more' || watchMultiplePartners === 'dont_remember') && renderQuestion("partnerAgeDifferenceP3", "Partner 3", [{value: '0-3', label: '0-3 years'}, {value: '4-9', label: '4-9 years'}, {value: '10+', label: '10+ years'}, {value: 'dont_know', label: 'Don’t know'}])}
                   </div>
                </FormItem>
              )}
            </div>
            <Separator/>
            {/* Other Health & Social Factors */}
             <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">Other Health & Social Factors</h3>
                {renderQuestion("consumedAlcohol", "A10. In the past 12 months, have you been consuming alcohol?", [{value: 'any', label: 'Consumed any alcohol'}, {value: 'none', label: 'Did not consume any alcohol'}, {value: 'cant_remember', label: 'Cannot Remember'}, {value: 'refused', label: 'Refused to answer'}])}
                {watchConsumedAlcohol === 'any' && renderQuestion("alcoholFrequency", "A11. In the past 12 Months, how often have you consumed alcohol?", [{value: 'every_day', label: 'Every day'}, {value: 'every_week', label: 'Every Week'}, {value: '2_3_times_month', label: '2-3 times a month'}, {value: 'once_month', label: 'Once a month'}, {value: 'special_occasions', label: 'Only on specific occasions (parties)'}, {value: 'never', label: 'Never consumed alcohol'}])}
                
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">A12. Are you having any of the following symptoms for more than 2 weeks? (Tick all that apply)</FormLabel>
                      <div className="space-y-2">
                        {symptomsItems.map((item) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
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
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pregnancyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">A13. Have you ever been pregnant? (Tick all that apply)</FormLabel>
                      <div className="space-y-2">
                        {pregnancyItems.map((item) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const currentVal = field.value || [];
                                  if (item.id === 'never_pregnant') {
                                    return field.onChange(checked ? ['never_pregnant'] : []);
                                  } else {
                                    const newArr = currentVal.filter(v => v !== 'never_pregnant');
                                    return checked ? field.onChange([...newArr, item.id]) : field.onChange(newArr.filter((value) => value !== item.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchPregnancyHistory && !watchPregnancyHistory.includes('never_pregnant') && watchPregnancyHistory.length > 0 && renderQuestion("attendingAnc", "A14. If you are pregnant or had a child in the past 6 weeks, are you attending care?", [{value: 'attending_anc', label: 'Attending ANC/PMTCT'}, {value: 'attending_post_natal', label: 'Attending Post Natal Care'}, {value: 'eligible_not_attending', label: 'Eligible but not attending'}, {value: 'na', label: 'N/A'}])}
                
                {renderQuestion("isOrphan", "A15. Are you an orphan?", [{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}])}
                {watchIsOrphan === 'yes' && renderQuestion("orphanStatus", "If yes, please specify:", [{value: 'single', label: 'Single (lost one parent)'}, {value: 'double', label: 'Double (lost both parents)'}, {value: 'child_headed', label: 'Child-headed household (no adult carer)'}])}

                {renderQuestion("hasDisability", "A16. Do you identify as a person living with a disability?", [{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}])}
                {watchHasDisability === 'yes' && renderQuestion("isDisabilityRegistered", "If yes, are you registered?", [{value: 'yes', label: 'No'}])}
             </div>

            {referralMessage && (
              <Alert variant={"destructive"} className="mt-6">
                <Info className="h-5 w-5" />
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
