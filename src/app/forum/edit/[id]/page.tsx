"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CreatePostForm from '@/components/forum/create-post-form';
import PageHeader from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface PostData {
  id: string;
  title: string;
  content: string;
  bannerImageUrl?: string;
  bannerImageHint?: string;
}

export default function EditForumPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<PostData | null>(null);
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
          setPost({
            id: postSnap.id,
            title: data.title,
            content: data.content,
            bannerImageUrl: data.bannerImageUrl,
            bannerImageHint: data.bannerImageHint,
          });
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error("Error fetching post for edit: ", err);
        setError('Failed to load the post.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (loading) {
    return (
       <div className="container mx-auto py-8 px-4">
        <PageHeader
            title="Edit Post"
            description="Loading post details..."
        />
         <Card className="w-full max-w-2xl mx-auto p-6 space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <hr/>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full mt-4" />
         </Card>
       </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto py-8 px-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Edit Post"
        description="Refine your message and update the community."
      />
      {post && <CreatePostForm initialData={post} />}
    </div>
  );
}
