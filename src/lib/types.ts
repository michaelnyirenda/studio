import type { FieldValue, Timestamp } from 'firebase/firestore';

export interface Referral {
  id: string;
  patientName: string;
  phoneNumber?: string;
  email?: string;
  referralDate: string | Date | FieldValue;
  referralMessage: string;
  status: 'Pending Consent' | 'Pending Review' | 'Contacted' | 'Follow-up Scheduled' | 'Closed';
  consentStatus: 'pending' | 'agreed' | 'declined';
  notes?: string;
  type: 'HIV' | 'GBV' | 'PrEP' | 'STI';
  screeningId?: string;
  userId?: string;
  region?: string;
  constituency?: string;
  facility?: string;
  contactMethod?: 'email' | 'whatsapp';
  appointmentDateTime?: Timestamp;
  services?: string[];
}
