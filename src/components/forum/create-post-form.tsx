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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createForumPostAction } from '@/app/forum/actions';
import { ForumPostSchema, type ForumPostFormData } from '@/lib/schemas';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreatePostForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForumPostFormData>({
    resolver: zodResolver(ForumPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  async function onSubmit(values: ForumPostFormData) {
    setIsSubmitting(true);
    try {
      const result = await createForumPostAction(values);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create post. Please try again.",
          variant: "destructive",
        });
        // Optionally display field-specific errors if your action returns them
        if (result.errors) {
          result.errors.forEach(error => {
            form.setError(error.path[0] as keyof ForumPostFormData, { message: error.message });
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
        <CardTitle className="font-headline text-2xl">Create New Forum Post</CardTitle>
        <CardDescription>Share your knowledge and insights with the community. Please note: rich text editing is simplified to a standard text area in this version.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a catchy title for your post" {...field} />
                  </FormControl>
                  <FormDescription>
                    A concise and descriptive title helps others find your post.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Post Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your detailed post content here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information, ask questions, or share resources.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Create Post'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
