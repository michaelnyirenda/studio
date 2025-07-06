
import ChatInterface from '@/components/chat/chat-interface';
import PageHeader from '@/components/shared/page-header';

export default function ChatPage() {
  const MOCK_CURRENT_USER_ID = 'client-test-user';
  
  return (
    <div className="container mx-auto py-8 px-4 pb-20">
      <PageHeader
        title="Chat with Support"
        description="Get help or ask questions. Our support assistant is here for you."
      />
      <div className="mt-8 max-w-2xl mx-auto">
        <ChatInterface userId={MOCK_CURRENT_USER_ID} isClientSide={true} />
      </div>
    </div>
  );
}

    