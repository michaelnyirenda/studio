
"use client";

import type React from 'react';

const DetailsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4 last:mb-0">
        <h3 className="text-md font-semibold text-primary mb-2 pb-2 border-b">{title}</h3>
        <dl className="space-y-1.5">{children}</dl>
    </div>
);

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
    const displayValue = value === undefined || value === null || value === '' ? 
        <span className="text-muted-foreground/70 italic">N/A</span> : 
        String(value);

    return (
        <div className="grid grid-cols-2 gap-4 py-1.5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-right break-words">{displayValue}</dd>
        </div>
    );
};

const formatArray = (arr?: string[]) => {
    if (!arr || arr.length === 0) return 'No';
    if (arr.includes('no') || arr.includes('never_pregnant')) return 'No';
    return arr.map(item => item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ');
};

const formatValue = (value?: string) => {
    if (!value) return undefined;
    return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


const HivDetails = ({ details }: { details: any }) => (
    <>
        <DetailsSection title="HIV Testing History">
            <DetailItem label="Knows HIV Status?" value={formatValue(details.knowsHivStatus)} />
            <DetailItem label="Last Test Date" value={formatValue(details.lastTestDate)} />
            {details.lastTestResult && <DetailItem label="Last Test Result" value={formatValue(details.lastTestResult)} />}
            {details.treatmentStatus && <DetailItem label="Treatment Status" value={formatValue(details.treatmentStatus)} />}
        </DetailsSection>

        <DetailsSection title="Sexual History">
            <DetailItem label="Ever Had Sex?" value={formatValue(details.hadSex)} />
            {details.usedCondoms && <DetailItem label="Used Condoms?" value={formatValue(details.usedCondoms)} />}
            {details.transactionalSex && <DetailItem label="Transactional Sex?" value={formatValue(details.transactionalSex)} />}
            {details.multiplePartners && <DetailItem label="Multiple Partners?" value={formatValue(details.multiplePartners)} />}
        </DetailsSection>

        <DetailsSection title="Other Health & Social Factors">
            <DetailItem label="Consumed Alcohol?" value={formatValue(details.consumedAlcohol)} />
            {details.alcoholFrequency && <DetailItem label="Alcohol Frequency" value={formatValue(details.alcoholFrequency)} />}
            <DetailItem label="Symptoms" value={formatArray(details.symptoms)} />
            <DetailItem label="Pregnancy History" value={formatArray(details.pregnancyHistory)} />
            {details.attendingAnc && <DetailItem label="Attending ANC/PNC?" value={formatValue(details.attendingAnc)} />}
            <DetailItem label="Is Orphan?" value={formatValue(details.isOrphan)} />
            {details.orphanStatus && <DetailItem label="Orphan Status" value={formatValue(details.orphanStatus)} />}
            <DetailItem label="Has Disability?" value={formatValue(details.hasDisability)} />
            {details.isDisabilityRegistered && <DetailItem label="Disability Registered?" value={formatValue(details.isDisabilityRegistered)} />}
        </DetailsSection>
    </>
);

const GbvDetails = ({ details }: { details: any }) => (
    <DetailsSection title="GBV Screening Responses">
        <DetailItem label="Emotional Violence" value={formatArray(details.emotionalViolence)} />
        {details.suicideAttempt && <DetailItem label="Suicide/Self-Harm Attempt?" value={formatValue(details.suicideAttempt)} />}
        <DetailItem label="Physical Violence" value={formatArray(details.physicalViolence)} />
        {details.seriousInjury && <DetailItem label="Serious Injury?" value={formatValue(details.seriousInjury)} />}
        <DetailItem label="Sexual Violence" value={formatArray(details.sexualViolence)} />
        {details.sexualViolenceTimeline && <DetailItem label="Sexual Violence Timeline" value={formatValue(details.sexualViolenceTimeline)} />}
    </DetailsSection>
);

const PrEpDetails = ({ details }: { details: any }) => (
     <DetailsSection title="PrEP Screening Responses">
        <DetailItem label="Multiple Partners?" value={formatValue(details.multiplePartners)} />
        <DetailItem label="Unprotected Sex?" value={formatValue(details.unprotectedSex)} />
        <DetailItem label="Unknown Status Partners?" value={formatValue(details.unknownStatusPartners)} />
        <DetailItem label="At-Risk Partners?" value={formatValue(details.atRiskPartners)} />
        <DetailItem label="Sex Under Influence?" value={formatValue(details.sexUnderInfluence)} />
        <DetailItem label="New STI Diagnosis?" value={formatValue(details.newStiDiagnosis)} />
        <DetailItem label="Considers Self at Risk?" value={formatValue(details.considersAtRisk)} />
        <DetailItem label="Used PEP Multiple Times?" value={formatValue(details.usedPepMultipleTimes)} />
        <DetailItem label="Forced Sex?" value={formatValue(details.forcedSex)} />
    </DetailsSection>
);

const StiDetails = ({ details }: { details: any }) => (
    <DetailsSection title="STI Screening Responses">
        <DetailItem label="Ever Diagnosed/Treated for STI?" value={formatValue(details.diagnosedOrTreated)} />
        <DetailItem label="Abnormal Discharge?" value={formatValue(details.abnormalDischarge)} />
        <DetailItem label="Vaginal Itchiness/Discomfort?" value={formatValue(details.vaginalItchiness)} />
        <DetailItem label="Genital Sores/Ulcers?" value={formatValue(details.genitalSores)} />
    </DetailsSection>
);


export default function ScreeningDetailsDisplay({ details, type }: { details: any; type: string }) {
    if (!details) return null;
    if (details.error) return <p className="text-destructive">{details.error}</p>;

    let content;
    switch (type) {
        case 'HIV': content = <HivDetails details={details} />; break;
        case 'GBV': content = <GbvDetails details={details} />; break;
        case 'PrEP': content = <PrEpDetails details={details} />; break;
        case 'STI': content = <StiDetails details={details} />; break;
        default: content = <p>Unknown screening type.</p>; break;
    }

    return <div>{content}</div>;
}
