
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
    title: 'Getting Started with #BeFree Platform', 
    content: `Welcome to #BeFree! This platform is designed to foster community engagement and learning.
Explore the features and share your knowledge. You can embed images and videos in your posts to make them more engaging.

This is an example of a paragraph.
And another line in the same paragraph.

Key Features to Explore:
- Community Forum: Engage in discussions.
- Attendance Capture: Track participation.
- HIV Screening: Access confidential screening.

We hope you find this platform valuable!`,
    author: '#BeFree Admin', 
    date: 'July 29, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBlbmdhZ2VtZW50fGVufDB8fHx8MTc0OTAxMjM0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'community engagement',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
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
