import CreatePostForm from '@/components/forum/create-post-form';
import Footer from '@/components/shared/footer';
import PageHeader from '@/components/shared/page-header';

export default function CreateForumPostPage() {
  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <PageHeader
        title="Create a Forum Post"
        description="Contribute to the #iBreakFree community by sharing your thoughts and expertise."
      />
      <CreatePostForm />
      <Footer />
    </div>
  );
}
