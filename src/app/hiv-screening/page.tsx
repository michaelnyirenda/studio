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
          src="https://placehold.co/600x400.png" 
          alt="Cartoon of health worker performing a screening" 
          width={600} 
          height={400}
          className="rounded-lg shadow-md"
          data-ai-hint="health screening cartoon" 
        />
      </div>
      <ScreeningForm />
    </div>
  );
}
