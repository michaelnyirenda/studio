
"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockPosts } from '@/lib/mock-data';
import { useRole } from '@/contexts/role-context';

export default function ForumPage() {
  const { role } = useRole();
  const isAdmin = role === 'admin';

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <PageHeader
        title="Community Forum"
        description="Browse discussions, share insights, and connect with others."
      />
      
      <div className="grid gap-6 mt-8 mb-24"> {/* Added mb-24 for FAB spacing */}
        {mockPosts.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg py-10">
            No posts yet. Be the first to start a discussion!
          </p>
        ) : (
          mockPosts.map(post => (
            <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <CardHeader>
                <Link href={`/forum/posts/${post.id}`} passHref>
                  <CardTitle className="text-xl font-headline text-primary hover:underline cursor-pointer">
                    {post.title}
                  </CardTitle>
                </Link>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                  By {post.author} on {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-foreground/90">{post.content}</p>
                <Link href={`/forum/posts/${post.id}`} passHref>
                  <Button variant="link" className="p-0 h-auto mt-2 text-accent hover:underline">
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isAdmin && (
        <Link href="/forum/create" passHref>
          <Button
            aria-label="Create new post"
            className="fixed bottom-24 right-8 px-6 py-4 rounded-xl shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground z-50 flex items-center"
            // size="icon" // Removed size="icon" as it's no longer just an icon
          >
            <Plus className="mr-2 h-6 w-6" />
            Create Post
          </Button>
        </Link>
      )}
    </div>
  );
}

