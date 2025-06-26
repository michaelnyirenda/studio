
// src/app/forum/posts/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  bannerImageUrl?: string;
  bannerImageHint?: string;
}

const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
     if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const parseInline = (text: string) => {
    // Split by bold and italic markers, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};


const ContentRenderer = ({ content }: { content: string }) => {
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let currentListType: 'ul' | 'ol' | null = null;

    const flushList = (key: string | number) => {
        if (listItems.length > 0) {
            if (currentListType === 'ul') {
                elements.push(<ul key={`ul-${key}`} className="list-disc list-inside my-4 space-y-2 pl-4">{listItems}</ul>);
            } else if (currentListType === 'ol') {
                elements.push(<ol key={`ol-${key}`} className="list-decimal list-inside my-4 space-y-2 pl-4">{listItems}</ol>);
            }
        }
        listItems = [];
        currentListType = null;
    };

    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Regex for various markdown elements
        const h1Match = line.match(/^# (.*)/);
        const h2Match = line.match(/^## (.*)/);
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
        const videoMatch = line.match(/^\[video\]\((.*?)\)/);
        const audioMatch = line.match(/^\[audio\]\((.*?)\)/);
        const ulMatch = line.match(/^- (.*)/);
        const olMatch = line.match(/^(\d+)\. (.*)/);

        const isNewElement = h1Match || h2Match || imgMatch || videoMatch || audioMatch || (line.trim() === '' && listItems.length > 0);
        
        if(isNewElement) flushList(index);

        if (h1Match) {
            elements.push(<h1 key={index} className="text-4xl font-bold mt-6 mb-2 text-primary">{parseInline(h1Match[1])}</h1>);
        } else if (h2Match) {
            elements.push(<h2 key={index} className="text-3xl font-bold mt-6 mb-2">{parseInline(h2Match[1])}</h2>);
        } else if (imgMatch) {
            elements.push(
                <div key={index} className="relative w-full my-6 rounded-lg overflow-hidden shadow-md">
                    <Image
                        src={imgMatch[2]}
                        alt={imgMatch[1]}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto' }}
                    />
                </div>
            );
        } else if (videoMatch) {
            const embedUrl = getEmbedUrl(videoMatch[1]);
            if (embedUrl) {
                elements.push(
                     <div key={index} className="my-8 aspect-video">
                        <iframe width="100%" height="100%" src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="rounded-lg shadow-md"></iframe>
                    </div>
                );
            }
        } else if (audioMatch) {
             elements.push(
                 <div key={index} className="my-8">
                    <audio controls className="w-full"><source src={audioMatch[1]} />Your browser does not support the audio element.</audio>
                </div>
             );
        } else if (ulMatch) {
            if (currentListType !== 'ul') {
                flushList(index);
                currentListType = 'ul';
            }
            listItems.push(<li key={index}>{parseInline(ulMatch[1])}</li>);
        } else if (olMatch) {
             if (currentListType !== 'ol') {
                flushList(index);
                currentListType = 'ol';
            }
            listItems.push(<li key={index}>{parseInline(olMatch[2])}</li>);
        } else if (line.trim() !== '') {
            elements.push(<p key={index} className="my-4 leading-relaxed">{parseInline(line)}</p>);
        }
    });

    flushList('last'); // Flush any remaining list items at the end of content

    return <>{elements}</>;
};


export default function ForumPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postRef = doc(db, 'posts', id);
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

    if (id) {
      fetchPost();
    }
  }, [id]);

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/forum" passHref>
        <Button variant="ghost" className="mb-6 text-accent hover:text-accent/80 pl-0 font-semibold">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Forum
        </Button>
      </Link>
      
      <Card className="shadow-xl overflow-hidden bg-card">
        {post.bannerImageUrl && (
          <div className="relative w-full">
            <Image
              src={post.bannerImageUrl}
              alt={post.title}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
              data-ai-hint={post.bannerImageHint || 'forum post image'}
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
        <CardContent className="px-8 pt-2 pb-8">
           <ContentRenderer content={post.content} />
        </CardContent>
      </Card>
    </div>
  );
}
