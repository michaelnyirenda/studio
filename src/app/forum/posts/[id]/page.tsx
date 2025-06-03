
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { mockPosts, type MockPost } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/page-header'; // Though not used directly, good for consistency if needed

export default function ForumPostPage({ params }: { params: { id: string } }) {
  const post = mockPosts.find(p => p.id === params.id);

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The post you are looking for does not exist or may have been moved.
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

  // Robust YouTube embed URL conversion
  const getEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = post.videoUrl ? getEmbedUrl(post.videoUrl) : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/forum" passHref>
        <Button variant="ghost" className="mb-6 text-accent hover:text-accent/80 pl-0">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Forum
        </Button>
      </Link>
      
      <Card className="shadow-xl overflow-hidden">
        {post.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={post.imageUrl}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={post.imageHint || 'forum post image'}
            />
          </div>
        )}
        <CardHeader className="pt-6">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary leading-tight">
            {post.title}
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
            By {post.author} on {post.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="text-foreground/90 text-lg leading-relaxed whitespace-pre-wrap">
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
