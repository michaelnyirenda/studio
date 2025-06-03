import ScreeningForm from '@/components/hiv-screening/screening-form';
import PageHeader from '@/components/shared/page-header';

export default function HivScreeningPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="HIV Screening"
        description="This screening tool is confidential and designed to help you understand your potential risk and guide you towards appropriate resources."
      />
      <ScreeningForm />
    </div>
  );
}
