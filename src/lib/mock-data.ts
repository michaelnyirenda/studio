
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
    title: 'Getting Started with EduNexus Platform', 
    content: 'Welcome to EduNexus! This platform is designed to foster community engagement and learning. Explore the features and share your knowledge.', 
    author: 'EduNexus Admin', 
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
