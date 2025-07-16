
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

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: Timestamp;
  senderId: string;
  senderType: 'user' | 'ai';
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  lastMessageText: string;
  lastMessageAt: Timestamp | FieldValue;
  createdAt?: Timestamp | FieldValue; // Add createdAt for new session detection
  userUnread: boolean;
  adminUnread: boolean;
  status?: 'active' | 'closed';
}

    
