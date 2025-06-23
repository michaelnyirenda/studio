// src/app/forum/page.tsx
"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/role-context';
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
}

export default function ForumPage() {
  const { role } = useRole();
  const isAdmin = role === 'admin';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(q);
        const postsList = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore Timestamp to a readable date string
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
          } as Post;
        });
        setPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <PageHeader
        title="Community Forum"
        description="Browse discussions, share insights, and connect with others."
      />
      
      <div className="grid gap-8 mt-8 mb-24">
        {loading ? (
           Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-6 w-24" />
              </CardFooter>
            </Card>
           ))
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg py-10">
            No posts yet. Be the first to start a discussion!
          </p>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out bg-card hover:-translate-y-1">
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
              <CardContent>
                <p className="line-clamp-3 text-card-foreground/90">{post.content}</p>
              </CardContent>
              <CardFooter>
                 <Link href={`/forum/posts/${post.id}`} passHref>
                  <Button variant="link" className="p-0 h-auto text-accent font-semibold hover:underline">
                    Read More &rarr;
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {isAdmin && (
        <Link href="/forum/create" passHref>
          <Button
            aria-label="Create new post"
            className="fixed bottom-24 right-8 h-16 px-6 rounded-2xl shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground z-50 flex items-center"
          >
            <Plus className="mr-2 h-6 w-6" />
            <span className="text-lg font-semibold">Create Post</span>
          </Button>
        </Link>
      )}
    </div>
  );
}