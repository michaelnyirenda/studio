// src/app/forum/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
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

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(q);
        const postsList = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          const date = (data.createdAt as Timestamp)?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) || new Date().toLocaleDateString();
          
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            author: data.author,
            date: date,
            bannerImageUrl: data.bannerImageUrl,
            bannerImageHint: data.bannerImageHint,
          } as Post;
        });
        setPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts: ", error);
        // Optionally, set an error state to show a message to the user
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <PageHeader
        title="Community Forum"
        description="Browse discussions, share insights, and connect with others."
      />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="shadow-lg overflow-hidden flex flex-col">
              <Skeleton className="h-48 w-full" />
              <div className="p-6 flex flex-col flex-grow">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <div className="flex-grow mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-auto pt-4">
                    <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </Card>
           ))
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-10 col-span-full">
            <p>No posts yet.</p>
          </div>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out bg-card hover:-translate-y-1 relative flex flex-col overflow-hidden">
              {post.bannerImageUrl && (
                <Link href={`/forum/posts/${post.id}`} passHref className="block">
                    <div className="relative w-full h-48">
                        <Image
                            src={post.bannerImageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            data-ai-hint={post.bannerImageHint || 'forum post banner'}
                        />
                    </div>
                </Link>
              )}

              <div className="flex flex-col flex-grow">
                <CardHeader>
                    <Link href={`/forum/posts/${post.id}`} passHref>
                    <CardTitle className="text-2xl font-headline text-primary hover:text-accent cursor-pointer transition-colors">
                        {post.title}
                    </CardTitle>
                    </Link>
                    <CardDescription className="text-sm text-muted-foreground pt-1">
                    By {post.author} on {post.date}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="line-clamp-3 text-card-foreground/90">{post.content}</p>
                </CardContent>
                <CardFooter>
                    <Link href={`/forum/posts/${post.id}`} passHref>
                    <Button variant="link" className="p-0 h-auto text-accent font-semibold hover:underline">
                        Read More &rarr;
                    </Button>
                    </Link>
                </CardFooter>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
