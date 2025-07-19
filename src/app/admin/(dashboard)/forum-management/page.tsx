
// src/app/admin/forum-management/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteForumPostAction } from '@/app/forum/actions';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  bannerImageUrl?: string;
  bannerImageHint?: string;
}

export default function ForumManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (!postToDelete) return;

    const result = await deleteForumPostAction(postToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setPosts(posts.filter(p => p.id !== postToDelete.id));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setPostToDelete(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Forum Management"
          description="Create, edit, and delete forum posts."
        />
         <Link href="/admin/forum/create" passHref>
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Post
          </Button>
        </Link>
      </div>
      
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
            <p>No posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out bg-card hover:-translate-y-1 relative flex flex-col overflow-hidden">
               <div className="absolute top-2 right-2 z-10">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
                       <MoreHorizontal className="h-5 w-5" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild>
                       <Link href={`/forum/edit/${post.id}`} className="cursor-pointer flex items-center">
                         <Edit className="mr-2 h-4 w-4" />
                         <span>Edit</span>
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setPostToDelete(post)} className="text-destructive cursor-pointer flex items-center">
                       <Trash2 className="mr-2 h-4 w-4" />
                       <span>Delete</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>

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

      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post titled "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Yes, delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
