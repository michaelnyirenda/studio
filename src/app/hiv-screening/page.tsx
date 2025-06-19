
"use client";

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import ScreeningForm from '@/components/hiv-screening/screening-form';
import ScreeningTypeCard from '@/components/hiv-screening/screening-type-card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Pill, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

type ScreeningType = 'hiv' | 'gbv' | 'prep' | null;

export default function HivScreeningPage() {
  const [selectedScreening, setSelectedScreening] = useState<ScreeningType>(null);

  const handleSelectScreening = (type: ScreeningType) => {
    setSelectedScreening(type);
  };

  const handleBackToSelection = () => {
    setSelectedScreening(null);
  };

  if (selectedScreening === 'hiv') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={handleBackToSelection} className="mb-4 text-accent hover:text-accent/80 pl-0">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Screening Selection
        </Button>
        <PageHeader
          title="HIV Screening"
          description="This screening tool is confidential and designed to help you understand your potential risk and guide you towards appropriate resources."
        />
        <ScreeningForm />
      </div>
    );
  }

  if (selectedScreening === 'gbv' || selectedScreening === 'prep') {
    const title = selectedScreening === 'gbv' ? "GBV Screening" : "PrEP Screening";
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={handleBackToSelection} className="mb-6 text-accent hover:text-accent/80 pl-0">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Screening Selection
        </Button>
        <PageHeader
          title={title}
          description={`The questionnaire for ${title} is currently under development.`}
        />
        <Alert className="mt-6">
          <Info className="h-5 w-5" />
          <AlertTitle>Coming Soon!</AlertTitle>
          <AlertDescription>
            The {title} questionnaire is not yet available. Please check back later.
            You can return to the main selection to choose another screening type.
          </AlertDescription>
        </Alert>
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
          imageSrc="https://images.unsplash.com/photo-1605107054093-42789854c465?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxISVYlMjB0ZXN0fGVufDB8fHx8MTc1MDI4MTM3Nnww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="HIV rapid test kit"
          imageHint="HIV test"
        />
        <ScreeningTypeCard
          title="GBV Screening"
          description="Screening for Gender-Based Violence. Support and resources are available. (Under Development)"
          icon={<ShieldAlert className="h-10 w-10 text-primary mb-3" />}
          onSelect={() => handleSelectScreening('gbv')}
          imageSrc="https://images.unsplash.com/photo-1580088957893-b68977a1f6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzcGVha2luZyUyMHN1cHBvcnR8ZW58MHx8fDE3NTAyODE0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Hands offering support"
          imageHint="support help"
        />
        <ScreeningTypeCard
          title="PrEP Screening"
          description="Determine if PrEP (Pre-Exposure Prophylaxis) is a suitable HIV prevention option for you. (Under Development)"
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
