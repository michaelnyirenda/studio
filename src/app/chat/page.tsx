
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Chat with Support"
        description="Connect with administrators or social workers for assistance and support."
      />
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquareText className="h-6 w-6 mr-2 text-primary" />
            Feature Under Development
          </CardTitle>
          <CardDescription>
            This chat feature is currently being built.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Soon, you'll be able to use this space to communicate directly with our support team, including administrators and social workers, for any help or guidance you may need.
          </p>
          <p className="mt-4 text-muted-foreground">
            Thank you for your patience as we work to bring this valuable feature to #BeFree.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
