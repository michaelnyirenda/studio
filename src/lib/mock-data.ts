
export interface MockPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

// Mock data - in a real app, this would come from an API or database
export const mockPosts: MockPost[] = [
  { 
    id: '1', 
    title: 'Getting Started with iCare Platform', 
    content: 'Welcome to iCare! This platform is designed to foster community engagement and learning. Explore the features and share your knowledge.', 
    author: 'iCare Admin', 
    date: 'July 29, 2024' 
  },
  { 
    id: '2', 
    title: 'Tips for Effective Online Learning', 
    content: 'Online learning can be challenging. Here are some tips: set a schedule, minimize distractions, participate actively, and take regular breaks.', 
    author: 'Community Educator', 
    date: 'July 28, 2024' 
  },
  { 
    id: '3', 
    title: 'Understanding HIV Prevention Methods', 
    content: 'Knowledge is power when it comes to HIV prevention. Learn about safe practices, regular testing, and available resources in our community.', 
    author: 'Health Awareness Team', 
    date: 'July 27, 2024' 
  },
];

export interface MockReferral {
  id: string;
  patientName: string;
  referralDate: string;
  referralMessage: string;
  status: 'Pending Review' | 'Contacted' | 'Follow-up Scheduled' | 'Closed';
  notes?: string;
}

export const mockReferrals: MockReferral[] = [
  {
    id: 'ref1',
    patientName: 'John Doe',
    referralDate: 'August 1, 2024',
    referralMessage: 'Dear John Doe, thank you for completing the screening. Given your sexual activity and no prior testing, a referral for HIV testing and counseling is recommended. Please consult a healthcare professional to discuss this further. Early testing is key for your health.',
    status: 'Pending Review',
    notes: 'Patient seemed anxious during screening.',
  },
  {
    id: 'ref2',
    patientName: 'Jane Smith',
    referralDate: 'August 2, 2024',
    referralMessage: 'Dear Jane Smith, thank you for completing the screening. We acknowledge your testing history. It\'s important to continue with regular medical follow-ups and adhere to any prescribed treatment. If you need support or further consultation, please reach out to a healthcare provider.',
    status: 'Contacted',
    notes: 'Patient was receptive during the call. Appointment scheduled for next week.',
  },
  {
    id: 'ref3',
    patientName: 'Alex Lee',
    referralDate: 'August 3, 2024',
    referralMessage: 'Dear Alex Lee, thank you for completing the screening. It\'s good that you are aware of your status. Remember that regular testing is advisable if you are sexually active. Please consult a healthcare professional about appropriate testing frequency for you.',
    status: 'Follow-up Scheduled',
  },
];
