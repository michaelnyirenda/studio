import ScreeningForm from '@/components/hiv-screening/screening-form';
import PageHeader from '@/components/shared/page-header';
import Image from 'next/image';

export default function HivScreeningPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="HIV Screening"
        description="This screening tool is confidential and designed to help you understand your potential risk and guide you towards appropriate resources."
      />
      <div className="my-6 flex justify-center">
        <Image 
          src="https://images.unsplash.com/photo-1536064479547-7ee40b74b807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8aGVhbHRoJTIwd29ya2VyfGVufDB8fHx8MTc0ODkyMjQ1NXww&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Health worker performing a screening" 
          width={600} 
          height={400}
          className="rounded-lg shadow-md object-cover"
        />
      </div>
      <ScreeningForm />
    </div>
  );
}
