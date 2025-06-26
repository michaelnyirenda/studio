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
import { createForumPostAction, updateForumPostAction } from '@/app/forum/actions';
import { ForumPostSchema, type ForumPostFormData } from '@/lib/schemas';
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MarkdownToolbar from './markdown-toolbar';

interface CreatePostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    imageHint?: string;
    videoUrl?: string;
    audioUrl?: string;
  };
}

export default function CreatePostForm({ initialData }: CreatePostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!initialData;

  const form = useForm<ForumPostFormData>({
    resolver: zodResolver(ForumPostSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: '',
      imageHint: '',
      videoUrl: '',
      audioUrl: '',
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        imageUrl: initialData.imageUrl || '',
        imageHint: initialData.imageHint || '',
        videoUrl: initialData.videoUrl || '',
        audioUrl: initialData.audioUrl || '',
      });
    }
  }, [isEditMode, initialData, form]);

  async function onSubmit(values: ForumPostFormData) {
    setIsSubmitting(true);
    try {
      if (!isEditMode) {
        const result = await createForumPostAction(values);
        if (result.success) {
          toast({
            title: "Success!",
            description: result.message,
          });
          form.reset();
          router.push('/forum');
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create post. Please try again.",
            variant: "destructive",
          });
          if (result.errors) {
            result.errors.forEach(error => {
              form.setError(error.path[0] as keyof ForumPostFormData, { message: error.message });
            });
          }
        }
      } else if (initialData?.id) {
        const result = await updateForumPostAction(initialData.id, values);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            router.push(`/forum/posts/${initialData.id}`);
            router.refresh();
        } else {
             toast({
                title: "Error",
                description: result.message || "Failed to update post. Please try again.",
                variant: "destructive",
            });
             if (result.errors) {
                result.errors.forEach(error => {
                    form.setError(error.path[0] as keyof ForumPostFormData, { message: error.message });
                });
            }
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
        <CardTitle className="font-headline text-2xl">{isEditMode ? 'Edit Forum Post' : 'Create New Forum Post'}</CardTitle>
        <CardDescription>{isEditMode ? 'Update the details of your post.' : 'Share your knowledge and insights with the community.'}</CardDescription>
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
                  <MarkdownToolbar editorRef={contentRef} form={form} />
                  <FormControl>
                    <Textarea
                      placeholder="Write your detailed post content here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        if(e) {
                           contentRef.current = e;
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Admin: Add Media (Optional)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        <FormDescription>Link to an image to display at the top of your post.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="imageHint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image AI Hint</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'community health'" {...field} />
                        </FormControl>
                        <FormDescription>One or two keywords describing the image for AI processing.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube Video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                        </FormControl>
                         <FormDescription>Link to a YouTube video to embed in your post.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="audioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/audio.mp3" {...field} />
                        </FormControl>
                         <FormDescription>Link to an audio file (e.g., mp3) to embed in your post.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>


          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Post' : 'Create Post'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
