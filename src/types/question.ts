
export interface QuestionMetadata {
  // Academic Information
  topic: string[];
  subject: string;
  grade: string[];
  curriculum: string[];
  
  // Examination Details
  level: ('IGCSE' | 'GCSE' | 'A-Level' | 'O-Level')[];
  board: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Pro' | 'Foundation' | 'Core' | 'Higher' | 'Extended';
  year: number[];
  paperType: string[];
  paperCode: string[];
  
  // Assessment Details
  attempt: number[];
  syllabusCode: string[];
  syllabusType: ('Extended' | 'Core' | 'Foundation' | 'Higher')[];
  variant: (1 | 2 | 3)[];
  
  // Additional Metadata
  marks: number;
  estimatedTime: number;
  tags: string[];
  learningObjectives: string[];
  difficultyIndex?: number; // 0-1 scale
  discriminationIndex?: number; // -1 to +1 scale
  bloomsLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
}

export interface MCQOptionWithImage {
  id: string;
  text: string;
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionSubpart {
  id: string;
  partNumber: string; // e.g., 'a', 'b', 'i', 'ii'
  text: string;
  marks: number;
  subType?: 'mcq' | 'short' | 'long' | 'numerical' | 'diagram' | 'equation';
  mcqOptions?: MCQOptionWithImage[];
  markingScheme?: string;
  studentAnswer?: string;
}

export interface EnhancedQuestion {
  id: string;
  questionNumber: number; // Sequential question number in test
  type: 'main-statement' | 'child-statement' | 'diagram' | 'question';
  subType?: 'mcq' | 'short' | 'long' | 'numerical' | 'diagram' | 'equation';
  text: string;
  marks?: number;
  markingScheme?: string;
  markingSchemeImage?: string;
  includeAnswer: boolean;
  studentAnswer?: string;
  includeDiagram: boolean;
  diagram?: string;
  mcqOptions?: MCQOptionWithImage[];
  subparts?: QuestionSubpart[]; // For multi-part questions
  metadata?: QuestionMetadata;
  questionBankId?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Analytics data
  totalAttempts?: number;
  averageScore?: number;
  averageTime?: number;
  skipRate?: number;
  hintUsage?: number;
  successRate?: number;
  viewCount?: number;
  completionRate?: number;
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  curriculum: string;
  questionCount: number;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  topics: string[];
  tags: string[];
}

export interface TestTemplate {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  curriculum: string;
  topics: string[];
  suggestedQuestions: EnhancedQuestion[];
  totalMarks: number;
  estimatedDuration: number;
  createdAt: string;
  createdBy: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
    preset: 'last7days' | 'last30days' | 'term' | 'custom';
  };
  classGroups: string[];
  topics: string[];
  studentTags: string[];
  scoreRange: [number, number];
  timeRange: [number, number];
  attemptStatus: ('completed' | 'incomplete' | 'skipped')[];
  hintUsage: boolean | null;
}

export interface QuestionAnalytics {
  questionId: string;
  totalAttempts: number;
  averageScore: number;
  successRate: number;
  averageTimeSpent: number;
  skipRate: number;
  hintUsageRate: number;
  scoreDistribution: { score: number; count: number }[];
  timeDistribution: { min: number; q1: number; median: number; q3: number; max: number };
  attemptsOverTime: { date: string; count: number }[];
  optionFrequency?: { option: string; count: number; isCorrect: boolean }[];
  demographicBreakdown: {
    gender: { male: number; female: number; other: number };
    region: { [key: string]: number };
    tags: { [key: string]: number };
  };
  bloomsPerformance: { level: string; averageScore: number }[];
  recommendations: string[];
}
