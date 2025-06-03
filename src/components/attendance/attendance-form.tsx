
"use client";

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitAttendanceAction } from '@/app/attendance/actions';
import { AttendanceSchema, type AttendanceFormData } from '@/lib/schemas';
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { mockPosts } from '@/lib/mock-data';

export default function AttendanceForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      lessonName: undefined, // Changed for Select component
      date: new Date(),
      attendees: [{ name: '', present: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  async function onSubmit(values: AttendanceFormData) {
    setIsSubmitting(true);
    try {
      const result = await submitAttendanceAction(values);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset({ 
            lessonName: undefined, 
            date: new Date(), 
            attendees: [{ name: '', present: false }] 
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit attendance. Please try again.",
          variant: "destructive",
        });
         if (result.errors) {
          result.errors.forEach(error => {
            const path = error.path.join('.') as any; // Adjust for nested paths if needed
            form.setError(path, { message: error.message });
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
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Capture Attendance</CardTitle>
        <CardDescription>Record attendance for your educational lessons or events.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="lessonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Lesson/Event Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lesson/event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockPosts.map(post => (
                        <SelectItem key={post.id} value={post.title}>
                          {post.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-lg">Date of Lesson/Event</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="text-lg mb-2 block">Attendees</FormLabel>
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3 mb-3 p-3 border rounded-md bg-secondary/50">
                  <FormField
                    control={form.control}
                    name={`attendees.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder={`Attendee ${index + 1} Name`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`attendees.${index}.present`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Present</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-primary border-primary hover:bg-primary/10"
                onClick={() => append({ name: '', present: false })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Attendee
              </Button>
               <FormMessage>{form.formState.errors.attendees?.root?.message || form.formState.errors.attendees?.message}</FormMessage>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
