
"use client";

import type React from 'react';
import { CardDescription } from '../ui/card';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start py-2 border-b last:border-none">
        <dt className="text-sm text-muted-foreground pr-2">{label}</dt>
        <dd className="text-sm font-medium text-right break-words">{value === undefined || value === null || value === '' ? 'N/A' : value}</dd>
    </div>
);

const formatArray = (arr?: string[]) => {
    if (!arr || arr.length === 0) return 'N/A';
    return arr.join(', ');
};

const HivDetails = ({ details }: { details: any }) => (
    <dl className="space-y-1">
        <DetailItem label="Knows HIV Status?" value={details.knowsHivStatus} />
        <DetailItem label="Last Test Date" value={details.lastTestDate} />
        <DetailItem label="Last Test Result" value={details.lastTestResult} />
        <DetailItem label="Treatment Status" value={details.treatmentStatus} />
        <DetailItem label="Ever Had Sex?" value={details.hadSex} />
        <DetailItem label="Used Condoms?" value={details.usedCondoms} />
        <DetailItem label="Transactional Sex?" value={details.transactionalSex} />
        <DetailItem label="Multiple Partners?" value={details.multiplePartners} />
        <DetailItem label="Consumed Alcohol?" value={details.consumedAlcohol} />
        <DetailItem label="Alcohol Frequency" value={details.alcoholFrequency} />
        <DetailItem label="Symptoms" value={formatArray(details.symptoms)} />
        <DetailItem label="Pregnancy History" value={formatArray(details.pregnancyHistory)} />
        <DetailItem label="Attending ANC/PNC?" value={details.attendingAnc} />
        <DetailItem label="Is Orphan?" value={details.isOrphan} />
        <DetailItem label="Orphan Status" value={details.orphanStatus} />
        <DetailItem label="Has Disability?" value={details.hasDisability} />
        <DetailItem label="Disability Registered?" value={details.isDisabilityRegistered} />
    </dl>
);

const GbvDetails = ({ details }: { details: any }) => (
    <dl className="space-y-1">
        <DetailItem label="Emotional Violence" value={formatArray(details.emotionalViolence)} />
        <DetailItem label="Suicide/Self-Harm Attempt?" value={details.suicideAttempt} />
        <DetailItem label="Physical Violence" value={formatArray(details.physicalViolence)} />
        <DetailItem label="Serious Injury?" value={details.seriousInjury} />
        <DetailItem label="Sexual Violence" value={formatArray(details.sexualViolence)} />
        <DetailItem label="Sexual Violence Timeline" value={details.sexualViolenceTimeline} />
    </dl>
);

const PrEpDetails = ({ details }: { details: any }) => (
     <dl className="space-y-1">
        <DetailItem label="Multiple Partners?" value={details.multiplePartners} />
        <DetailItem label="Unprotected Sex?" value={details.unprotectedSex} />
        <DetailItem label="Unknown Status Partners?" value={details.unknownStatusPartners} />
        <DetailItem label="At-Risk Partners?" value={details.atRiskPartners} />
        <DetailItem label="Sex Under Influence?" value={details.sexUnderInfluence} />
        <DetailItem label="New STI Diagnosis?" value={details.newStiDiagnosis} />
        <DetailItem label="Considers Self at Risk?" value={details.considersAtRisk} />
        <DetailItem label="Used PEP Multiple Times?" value={details.usedPepMultipleTimes} />
        <DetailItem label="Forced Sex?" value={details.forcedSex} />
    </dl>
);

const StiDetails = ({ details }: { details: any }) => (
    <dl className="space-y-1">
        <DetailItem label="Ever Diagnosed/Treated for STI?" value={details.diagnosedOrTreated} />
        <DetailItem label="Abnormal Discharge?" value={details.abnormalDischarge} />
        <DetailItem label="Vaginal Itchiness/Discomfort?" value={details.vaginalItchiness} />
        <DetailItem label="Genital Sores/Ulcers?" value={details.genitalSores} />
    </dl>
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

    return (
        <div>
            <CardDescription className="mb-2">Answers from the {type} screening:</CardDescription>
            {content}
        </div>
    );
}
