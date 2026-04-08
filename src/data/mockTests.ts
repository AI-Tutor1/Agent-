
export interface MockTest {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  subject: string;
  grade: string;
  status: 'Published' | 'Draft' | 'Review';
  createdAt: string;
  attempts: number;
  averageScore: number;
}

export const mockTests: MockTest[] = [
  {
    id: '1',
    title: 'Biology Chapter 5: Photosynthesis',
    description: 'Comprehensive test covering light and dark reactions, factors affecting photosynthesis',
    questionCount: 25,
    duration: 90,
    subject: 'Biology',
    grade: '10th',
    status: 'Published',
    createdAt: '2024-01-15',
    attempts: 156,
    averageScore: 78.5
  },
  {
    id: '2',
    title: 'Physics: Newton\'s Laws of Motion',
    description: 'Test on three laws of motion with numerical problems',
    questionCount: 20,
    duration: 75,
    subject: 'Physics',
    grade: '11th',
    status: 'Published',
    createdAt: '2024-01-20',
    attempts: 134,
    averageScore: 72.3
  },
  {
    id: '3',
    title: 'Chemistry: Chemical Bonding',
    description: 'Ionic, covalent, and metallic bonding concepts',
    questionCount: 30,
    duration: 120,
    subject: 'Chemistry',
    grade: '11th',
    status: 'Draft',
    createdAt: '2024-01-25',
    attempts: 0,
    averageScore: 0
  },
  {
    id: '4',
    title: 'Mathematics: Calculus Fundamentals',
    description: 'Derivatives and integration basics',
    questionCount: 35,
    duration: 150,
    subject: 'Mathematics',
    grade: '12th',
    status: 'Review',
    createdAt: '2024-01-30',
    attempts: 89,
    averageScore: 65.8
  }
];
