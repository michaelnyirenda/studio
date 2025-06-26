
import { FieldValue } from 'firebase/firestore';

export interface MockPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  imageHint?: string;
  videoUrl?: string;
}

// Mock data - in a real app, this would come from an API or database
export const mockPosts: MockPost[] = [
  {
    id: '1',
    title: 'Getting Started with i-BreakFree Platform',
    content: `Welcome to i-BreakFree! This platform is designed to foster community engagement and learning.
Explore the features and share your knowledge. You can embed images and videos in your posts to make them more engaging.

This is an example of a paragraph.
And another line in the same paragraph.

Key Features to Explore:
- Community Forum: Engage in discussions.
- HIV Screening: Access confidential screening.
- PrEP Screening: Learn about PrEP.
- GBV Screening: Access GBV support information.

We hope you find this platform valuable!`,
    author: 'i-BreakFree Admin',
    date: 'July 29, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBlbmdhZ2VtZW50fGVufDB8fHx8MTc0OTAxMjM0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'community engagement',
    videoUrl: 'https://youtu.be/NnfkVsVnl3s?si=ZjKcWKiSUULn4bjW'
  },
  {
    id: '2',
    title: 'Tips for Effective Online Learning',
    content: `Online learning can be challenging, but with the right strategies, it can be very rewarding.
Here are some tips to help you succeed:
1.  **Set a Schedule**: Treat your online courses like traditional classes. Allocate specific times for study and stick to them.
2.  **Minimize Distractions**: Find a quiet study space. Turn off notifications on your phone and computer.
3.  **Participate Actively**: Engage in online discussions, ask questions, and collaborate with peers.
4.  **Take Regular Breaks**: Avoid burnout by taking short breaks every hour.
5.  **Utilize Resources**: Take advantage of all available resources, such as lecture notes, supplementary materials, and instructor office hours.`,
    author: 'Community Educator',
    date: 'July 28, 2024'
  },
  {
    id: '3',
    title: 'Understanding HIV Prevention Methods',
    content: `Knowledge is power when it comes to HIV prevention. Learn about safe practices, regular testing, and available resources in our community.
Key prevention strategies include:
- Consistent and correct use of condoms.
- Regular HIV testing.
- Pre-exposure prophylaxis (PrEP) for individuals at high risk.
- Post-exposure prophylaxis (PEP) after potential exposure.
- Avoiding sharing needles or other injection equipment.
- Treatment as Prevention (TasP): People with HIV who take ART daily as prescribed and achieve and maintain an undetectable viral load have effectively no risk of sexually transmitting HIV to their HIV-negative partners.`,
    author: 'Health Awareness Team',
    date: 'July 27, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwYXdhcmVuZXNzfGVufDB8fHx8MTc0OTAxMjM0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'healthcare awareness'
  },
];

export interface MockReferral {
  id: string;
  patientName: string;
  referralDate: string | Date | FieldValue;
  referralMessage: string;
  status: 'Pending Consent' | 'Pending Review' | 'Contacted' | 'Follow-up Scheduled' | 'Closed';
  consentStatus: 'pending' | 'agreed' | 'declined';
  type: 'HIV' | 'GBV' | 'PrEP' | 'STI';
  screeningId?: string;
  region?: string;
  constituency?: string;
  facility?: string;
  services?: string[];
  notes?: string;
  phoneNumber?: string;
  email?: string;
}


export const mockReferrals: MockReferral[] = [
  {
    id: 'ref-hiv-john-doe-1627840000000',
    patientName: 'John Doe (HIV)',
    phoneNumber: '123-456-7890',
    email: 'john.doe@example.com',
    referralDate: 'August 1, 2024',
    referralMessage: 'Dear John Doe, thank you for completing the screening. Given your sexual activity and no prior testing, a referral for HIV testing and counseling is recommended. Please consult a healthcare professional to discuss this further. Early testing is key for your health.',
    status: 'Pending Review',
    consentStatus: 'pending',
    type: 'HIV',
    screeningId: 'mock-hiv-1',
    notes: 'Patient seemed anxious during HIV screening.',
  },
  {
    id: 'ref-gbv-jane-smith-1627926400000',
    patientName: 'Jane Smith (GBV)',
    phoneNumber: '234-567-8901',
    email: 'jane.smith@example.com',
    referralDate: 'August 2, 2024',
    referralMessage: 'Based on your GBV screening, the following guidance was provided: We are concerned that you have experienced harm. It is important to seek support. We can provide you with information on available resources.',
    status: 'Contacted',
    consentStatus: 'agreed',
    type: 'GBV',
    screeningId: 'mock-gbv-1',
    region: 'Region 1',
    constituency: 'Constituency 1.1',
    facility: "Clinic A",
    services: ['GBV post Care'],
    notes: 'Patient was receptive during the call. Safety planning discussed, resources provided.',
  },
  {
    id: 'ref-prep-alex-lee-1628012800000',
    patientName: 'Alex Lee (PrEP)',
    phoneNumber: '345-678-9012',
    email: 'alex.lee@example.com',
    referralDate: 'August 3, 2024',
    referralMessage: 'Based on your PrEP screening, the following guidance was provided: Based on your responses, you may have factors that increase your risk of HIV exposure. PrEP (Pre-Exposure Prophylaxis) is a highly effective medication to prevent HIV. We recommend discussing PrEP with a healthcare provider to see if it\'s right for you.',
    status: 'Follow-up Scheduled',
    consentStatus: 'agreed',
    type: 'PrEP',
    screeningId: 'mock-prep-1',
    region: 'Region 2',
    constituency: 'Constituency 2.1',
    facility: 'Clinic F',
    services: ['PrEP', 'HTS'],
    notes: 'PrEP consultation scheduled with Dr. Carter.',
  },
  {
    id: 'ref-hiv-samuel-green-1628099200000',
    patientName: 'Samuel Green (HIV)',
    phoneNumber: '456-789-0123',
    email: 'samuel.green@example.com',
    referralDate: 'August 4, 2024',
    referralMessage: 'Dear Samuel Green, we acknowledge your testing history. It\'s important to continue with regular medical follow-ups and adhere to any prescribed treatment. If you need support or further consultation, please reach out to a healthcare provider.',
    status: 'Closed',
    consentStatus: 'agreed',
    type: 'HIV',
    screeningId: 'mock-hiv-2',
    region: 'Region 3',
    constituency: 'Constituency 3.2',
    facility: 'Clinic L',
    services: ['ART', 'Family Planning'],
    notes: 'Patient confirmed linkage to care.',
  },
];
