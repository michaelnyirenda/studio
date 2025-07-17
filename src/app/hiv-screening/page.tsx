"use client";

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import ScreeningForm from '@/components/hiv-screening/screening-form';
import GbvScreeningForm from '@/components/gbv-screening/gbv-screening-form';
import PrEpScreeningForm from '@/components/prep-screening/prep-screening-form';
import StiScreeningForm from '@/components/sti-screening/sti-screening-form';
import ScreeningTypeCard from '@/components/hiv-screening/screening-type-card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Pill, ArrowLeft, TestTube2 } from 'lucide-react';
import Footer from '@/components/shared/footer';

type ScreeningType = 'hiv' | 'gbv' | 'prep' | 'sti' | null;

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
      case 'sti':
        return (
          <>
            <PageHeader
              title="STI Screening"
              description="This confidential screening helps assess your risk for Sexually Transmitted Infections and provides guidance on testing."
            />
            <StiScreeningForm />
          </>
        );
      default:
        return null;
    }
  };

  if (selectedScreening) {
    return (
      <div className="container mx-auto py-8 px-4 pb-24">
        <Button variant="ghost" onClick={handleBackToSelection} className="mb-4 text-accent hover:text-accent/80 pl-0 font-semibold">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Screening Selection
        </Button>
        {renderScreeningForm()}
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <PageHeader
        title="Select Screening Type"
        description="Choose the type of screening you would like to proceed with. All screenings are confidential."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <ScreeningTypeCard
          title="HIV Screening"
          description="Assess your risk for HIV and receive guidance on next steps. Confidential and informative."
          icon={<ShieldCheck className="h-10 w-10 text-primary" />}
          onSelect={() => handleSelectScreening('hiv')}
          imageSrc="https://images.unsplash.com/photo-1576074892931-753d42b5d831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8aGl2JTIwfGVufDB8fHx8MTc1MDMxMjc1MHww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="HIV rapid test kit"
          imageHint="HIV test"
        />
        <ScreeningTypeCard
          title="PrEP Screening"
          description="Determine if PrEP (Pre-Exposure Prophylaxis) is a suitable HIV prevention option for you."
          icon={<Pill className="h-10 w-10 text-primary" />}
          onSelect={() => handleSelectScreening('prep')}
          imageSrc="https://images.unsplash.com/photo-1625402534923-e8132f4b1de4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOXx8bWVkaWNhdGlvbnxlbnwwfHx8fDE3NTAzMTI4NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Pills and medication"
          imageHint="medication pills"
        />
        <ScreeningTypeCard
          title="GBV Screening"
          description="Screening for Gender-Based Violence. Support and resources are available."
          icon={<ShieldAlert className="h-10 w-10 text-primary" />}
          onSelect={() => handleSelectScreening('gbv')}
          imageSrc="https://images.unsplash.com/photo-1656577796467-e049bfc98376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d29tZW4lMjBzdXBwb3J0fGVufDB8fHx8MTc1MDMxMjgzOXww&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Hands offering support"
          imageHint="support help"
        />
        <ScreeningTypeCard
          title="STI Screening"
          description="Screening for Sexually Transmitted Infections. Learn about symptoms and testing."
          icon={<TestTube2 className="h-10 w-10 text-primary" />}
          onSelect={() => handleSelectScreening('sti')}
          imageSrc="https://images.unsplash.com/photo-1625869736621-784a42674da4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8bWVkaWNhbCUyMHBhdGllbnR8ZW58MHx8fHwxNzUwNjY5NDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080"
          imageAlt="Laboratory test tubes"
          imageHint="laboratory test"
        />
      </div>
      <Footer />
    </div>
  );
}
