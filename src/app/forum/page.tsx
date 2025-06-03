
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - in a real app, this would come from an API or database
const mockPosts = [
  { 
    id: '1', 
    title: 'Getting Started with EduNexus Platform', 
    content: 'Welcome to EduNexus! This platform is designed to foster community engagement and learning. Explore the features and share your knowledge.', 
    author: 'EduNexus Admin', 
    date: 'July 29, 2024' 
  },
  { 
    id: '2', 
    title: 'Tips for Effective Online Learning', 
    content: 'Online learning can be challenging. Here are some tips: set a schedule, minimize distractions, participate actively, and take regular breaks.', 
    author: 'Community Educator', 
    date: 'July 28, 2024' 
  },
  { 
    id: '3', 
    title: 'Understanding HIV Prevention Methods', 
    content: 'Knowledge is power when it comes to HIV prevention. Learn about safe practices, regular testing, and available resources in our community.', 
    author: 'Health Awareness Team', 
    date: 'July 27, 2024' 
  },
];

export default function ForumPage() {
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
                <CardTitle className="text-xl font-headline text-primary">{post.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                  By {post.author} on {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-foreground/90">{post.content}</p>
                {/* In a real app, you might have a "Read More" link here that navigates to a full post page:
                <Link href={`/forum/posts/${post.id}`} passHref>
                  <Button variant="link" className="p-0 h-auto mt-2 text-accent">Read More</Button>
                </Link> 
                */}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Link href="/forum/create" passHref>
        <Button
          aria-label="Create new post"
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground z-50 flex items-center justify-center"
          size="icon"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
