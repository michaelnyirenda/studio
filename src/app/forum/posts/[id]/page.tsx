// src/app/forum/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Update the Post type to handle potential image and video URLs
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  imageHint?: string;
  videoUrl?: string;
}

export default function ForumPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postRef = doc(db, 'posts', params.id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const data = postSnap.data();
          const date = (data.createdAt as Timestamp)?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) || 'N/A';
          
          setPost({ id: postSnap.id, ...data, date } as Post);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error("Error fetching post: ", err);
        setError('Failed to load the post.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
     if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Card className="shadow-xl overflow-hidden">
          <Skeleton className="h-96 w-full" />
          <CardHeader className="pt-8 px-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4 mt-4" />
          </CardHeader>
          <CardContent className="py-8 px-8 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The post you are looking for does not exist or may have been moved."}
        </p>
        <Link href="/forum" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(post.videoUrl);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/forum" passHref>
        <Button variant="ghost" className="mb-6 text-accent hover:text-accent/80 pl-0 font-semibold">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Forum
        </Button>
      </Link>
      
      <Card className="shadow-xl overflow-hidden bg-card">
        {post.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={post.imageHint || 'forum post image'}
              priority
            />
          </div>
        )}
        <CardHeader className="pt-8 px-8">
          <CardTitle className="text-4xl md:text-5xl font-headline text-primary leading-tight">
            {post.title}
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-3">
            By {post.author} on {post.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 px-8">
          <div className="prose prose-lg max-w-none text-card-foreground/90 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {embedUrl && (
            <div className="my-8 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={post.title || 'Forum post video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-lg shadow-md"
              ></iframe>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}