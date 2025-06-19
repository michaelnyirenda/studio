
"use client";

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import ScreeningForm from '@/components/hiv-screening/screening-form';
import GbvScreeningForm from '@/components/gbv-screening/gbv-screening-form';
import PrEpScreeningForm from '@/components/prep-screening/prep-screening-form';
import ScreeningTypeCard from '@/components/hiv-screening/screening-type-card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Pill, ArrowLeft } from 'lucide-react';

type ScreeningType = 'hiv' | 'gbv' | 'prep' | null;

export default function ScreeningPage() {
  const [selectedScreening, setSelectedScreening] = useState<ScreeningType>(null);

  const handleSelectScreening = (type: ScreeningType) => {
    setSelectedScreening(type);
  };

  const handleBackToSelection = () => {
    setSelectedScreening(null);
  };

  const renderScreeningForm = () => {
    switch (selectedScreening) {
      case 'hiv':
        return (
          <>
            <PageHeader
              title="HIV Screening"
              description="This screening tool is confidential and designed to help you understand your potential risk and guide you towards appropriate resources."
            />
            <ScreeningForm />
          </>
        );
      case 'gbv':
        return (
          <>
            <PageHeader
              title="GBV Screening"
              description="This confidential screening can help identify experiences of Gender-Based Violence and connect you with support."
            />
            <GbvScreeningForm />
          </>
        );
      case 'prep':
        return (
          <>
            <PageHeader
              title="PrEP Screening"
              description="This screening helps assess if PrEP (Pre-Exposure Prophylaxis) might be a suitable HIV prevention option for you."
            />
            <PrEpScreeningForm />
          </>
        );
      default:
        return null;
    }
  };

  if (selectedScreening) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={handleBackToSelection} className="mb-4 text-accent hover:text-accent/80 pl-0">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Screening Selection
        </Button>
        {renderScreeningForm()}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Select Screening Type"
        description="Choose the type of screening you would like to proceed with. All screenings are confidential."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <ScreeningTypeCard
          title="HIV Screening"
          description="Assess your risk for HIV and receive guidance on next steps. Confidential and informative."
          icon={<ShieldCheck className="h-10 w-10 text-primary mb-3" />}
          onSelect={() => handleSelectScreening('hiv')}
          imageSrc="https://images.unsplash.com/photo-1576074892931-753d42b5d831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8aGl2JTIwfGVufDB8fHx8MTc1MDMxMjc1MHww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="HIV rapid test kit"
          imageHint="HIV test"
        />
        <ScreeningTypeCard
          title="GBV Screening"
          description="Screening for Gender-Based Violence. Support and resources are available."
          icon={<ShieldAlert className="h-10 w-10 text-primary mb-3" />}
          onSelect={() => handleSelectScreening('gbv')}
          imageSrc="https://images.unsplash.com/photo-1656577796467-e049bfc98376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d29tZW4lMjBzdXBwb3J0fGVufDB8fHx8MTc1MDMxMjgzOXww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Hands offering support"
          imageHint="support help"
        />
        <ScreeningTypeCard
          title="PrEP Screening"
          description="Determine if PrEP (Pre-Exposure Prophylaxis) is a suitable HIV prevention option for you."
          icon={<Pill className="h-10 w-10 text-primary mb-3" />}
          onSelect={() => handleSelectScreening('prep')}
          imageSrc="https://images.unsplash.com/photo-1584308666744-848080a99157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMHBpbGxzfGVufDB8fHx8MTc1MDI4MTQzMnww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Pills and medication"
          imageHint="medication pills"
        />
      </div>
    </div>
  );
}
