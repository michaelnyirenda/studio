import CreatePostForm from '@/components/forum/create-post-form';
import PageHeader from '@/components/shared/page-header';

export default function CreateForumPostPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Create a Forum Post"
        description="Contribute to the iCare community by sharing your thoughts and expertise."
      />
      <CreatePostForm />
    </div>
  );
}
