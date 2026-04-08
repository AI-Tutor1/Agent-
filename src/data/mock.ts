export const TEACHERS = [
  { name: 'Inayat Karim', subjects: ['Mathematics', 'Further Mathematics'] },
  { name: 'Zehra Saleem', subjects: ['English Language', 'English Literature'] },
  { name: 'Ahrar', subjects: ['Biology', 'Chemistry'] },
  { name: 'Moazzam Malik', subjects: ['Mathematics', 'Further Mathematics'] },
  { name: 'Vivek Madan', subjects: ['Business Studies', 'Economics', 'Accounting'] },
  { name: 'Faiza Khalid', subjects: ['Biology', 'Chemistry'] },
  { name: 'Alishba Shahzad', subjects: ['English Language', 'English Literature'] },
  { name: 'Nageena Arif', subjects: ['Mathematics', 'Science', 'Biology'] },
  { name: 'Mahnoor Gul', subjects: ['English Language', 'Mathematics'] },
  { name: 'Sophia Abid', subjects: ['Psychology', 'Biology'] },
  { name: 'Musharraf Ramzy', subjects: ['Chemistry', 'Biology'] },
  { name: 'Raheel Nasser', subjects: ['Business Studies', 'Economics'] },
  { name: 'Ahmed Shaheer', subjects: ['Biology', 'Chemistry'] },
  { name: 'Laiba Nadeem', subjects: ['English Language', 'Science'] },
  { name: 'Abdur Rehman', subjects: ['Business Studies', 'Accounting', 'Economics'] },
  { name: 'Maryam Imran', subjects: ['Physics', 'Science'] },
  { name: 'Hassam Umer', subjects: ['Mathematics', 'Physics'] },
  { name: 'Faizan Altaf', subjects: ['Physics', 'Mathematics'] },
  { name: 'Ali Akbar', subjects: ['Mathematics', 'Computer Science'] },
  { name: 'Basma', subjects: ['Mathematics', 'Further Mathematics'] },
  { name: 'Dur e Kashaf', subjects: ['Chemistry', 'Biology'] },
  { name: 'Samina Kausar', subjects: ['Chemistry'] },
  { name: 'Rizwan Anwer', subjects: ['Mathematics', 'Further Mathematics'] },
  { name: 'Sara Jawaid', subjects: ['Mathematics', 'Biology'] },
  { name: 'Hira Saeed', subjects: ['Geography', 'ESS', 'ICT'] },
]

export const ALL_SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Language', 'English Literature', 'Business Studies', 'Economics',
  'Accounting', 'Computer Science', 'ICT', 'Psychology', 'History',
  'Geography', 'Arabic', 'French', 'Spanish', 'Environmental Science', 'Other',
]

export const ACADEMIC_LEVELS = [
  'Grade 1-8', 'IGCSE / GCSE', 'AS Level', 'A2 Level', 'IB', 'University', 'Other',
]

export const CURRICULUM_BOARDS = [
  'Pearson Edexcel', 'Cambridge IGCSE / A Level', 'AQA', 'OCR',
  'IB (MYP)', 'IB (DP)', 'CBSE', 'Other',
]

export const RATE_TIERS = ['Standard Rate', 'Premium Rate', 'Flexible']

export const LOST_REASONS = [
  'Price too high', 'Teacher mismatch', 'Face-to-face preferred',
  'Budget limited', 'Ghosted', 'Timing', 'Student not ready', 'Other',
]

export const FOLLOW_UP_OPTIONS = [
  'Follow up in 1 week', 'Follow up in 1 month',
  'Offer another demo', 'No follow-up needed', 'Closed lost',
]

export interface PendingDemo {
  id: string
  teacher: string
  student: string
  level: string
  subject: string
  loggedAgo: string
  loggedHours: number
}

export const PENDING_DEMOS: PendingDemo[] = [
  { id: '20260407_inayat_olimpos', teacher: 'Inayat Karim', student: 'Olimpos', level: 'IGCSE', subject: 'Mathematics', loggedAgo: '4h ago', loggedHours: 4 },
  { id: '20260407_zehra_abdul', teacher: 'Zehra Saleem', student: 'Abdul Hadi', level: 'IGCSE', subject: 'English', loggedAgo: '6h ago', loggedHours: 6 },
  { id: '20260406_sophia_nicole', teacher: 'Sophia Abid', student: 'Nicole', level: 'AS Level', subject: 'Psychology', loggedAgo: '1d ago', loggedHours: 24 },
  { id: '20260406_vivek_auroora', teacher: 'Vivek Madan', student: 'Auroora', level: 'IGCSE', subject: 'Accounting', loggedAgo: '1d ago', loggedHours: 24 },
  { id: '20260405_ahrar_aarav', teacher: 'Ahrar', student: 'Aarav Rustagi', level: 'GCSE', subject: 'Biology', loggedAgo: '2d ago', loggedHours: 48 },
]

export type SubmissionStatus = 'Processing' | 'Awaiting Sales' | 'Pending Review' | 'Reviewed' | 'Escalated'

export interface RecentSubmission {
  date: string
  teacher: string
  student: string
  level: string
  subject: string
  status: SubmissionStatus
}

export const RECENT_SUBMISSIONS: RecentSubmission[] = [
  { date: '07 Apr', teacher: 'Inayat', student: 'Olimpos', level: 'IGCSE', subject: 'Maths', status: 'Awaiting Sales' },
  { date: '06 Apr', teacher: 'Zehra', student: 'Abdul Hadi', level: 'IGCSE', subject: 'English', status: 'Pending Review' },
  { date: '05 Apr', teacher: 'Sophia', student: 'Nicole', level: 'AS', subject: 'Psychology', status: 'Reviewed' },
  { date: '05 Apr', teacher: 'Vivek', student: 'Auroora', level: 'IGCSE', subject: 'Accounting', status: 'Reviewed' },
  { date: '04 Apr', teacher: 'Ahrar', student: 'Aarav', level: 'GCSE', subject: 'Biology', status: 'Processing' },
]

export interface DemoAnalysis {
  id: string
  demoId: string
  status: 'pending_review' | 'approved' | 'rejected' | 'redo' | 'escalated'
  teacher: string
  student: string
  level: string
  subject: string
  date: string
  salesAgent: string
  confidence: number
  studentRating: number
  analystRating: number
  conversionStatus: 'Converted' | 'Not Converted' | 'Pending'
  methodology: string
  topicSelection: string
  resourceUsage: string
  interactivity: string
  effectiveness: string
  improvements: string
  pourFlags: { category: string; severity: 'High' | 'Medium' | 'Low'; description: string }[]
  accountability: { classification: string; evidence: string; confidence: string } | null
  processingTime: string
  tokensUsed: number
  feedbackText: string
}

export const MOCK_ANALYSES: DemoAnalysis[] = [
  {
    id: 'a1', demoId: '20260407_inayat_olimpos',
    status: 'pending_review',
    teacher: 'Inayat Karim', student: 'Olimpos', level: 'IGCSE', subject: 'Mathematics',
    date: '07 Apr 2026', salesAgent: 'Maryam', confidence: 8.4,
    studentRating: 4, analystRating: 4,
    conversionStatus: 'Not Converted',
    methodology: 'Teacher demonstrated strong pedagogical approach with step-by-step problem solving. Used visual aids effectively for quadratic equations. Pacing was appropriate for IGCSE level.',
    topicSelection: 'Quadratic equations and factoring — aligned with IGCSE syllabus. Topic was relevant to upcoming examination period.',
    resourceUsage: 'Whiteboard used extensively. No supplementary worksheets provided. Could benefit from practice problem handouts.',
    interactivity: 'Student was engaged but hesitant to ask questions. Teacher encouraged participation but did not use scaffolded questioning techniques.',
    effectiveness: 'Effective demonstration of core concepts. Student showed understanding by end of session. Room for improvement in resource allocation and interactive engagement.',
    improvements: 'Incorporate more scaffolded questioning. Provide take-home practice sheets. Consider using digital tools for graph visualization.',
    pourFlags: [
      { category: 'Video', severity: 'High', description: 'Recording not available — LMS returned 404' },
      { category: 'Interaction', severity: 'Medium', description: 'Student participation below threshold — 2 responses in 45 min session' },
    ],
    accountability: { classification: 'Product', evidence: 'Incorrect resource allocation — absence of fluency-building materials and lack of interactive whiteboard utilization despite availability.', confidence: 'High' },
    processingTime: '12m 44s', tokensUsed: 1847,
    feedbackText: 'May be he can teach in a more specific way.',
  },
  {
    id: 'a2', demoId: '20260406_zehra_abdul',
    status: 'pending_review',
    teacher: 'Zehra Saleem', student: 'Abdul Hadi', level: 'IGCSE', subject: 'English Language',
    date: '06 Apr 2026', salesAgent: 'Hoor', confidence: 9.1,
    studentRating: 5, analystRating: 5,
    conversionStatus: 'Converted',
    methodology: 'Excellent scaffolded approach to essay writing. Teacher demonstrated clear thesis formation and provided real exam examples.',
    topicSelection: 'Descriptive writing techniques — perfectly aligned with Paper 2 requirements.',
    resourceUsage: 'Mark scheme shared and discussed. Sample essays provided for comparison. Excellent use of materials.',
    interactivity: 'Highly interactive session. Student actively participated in brainstorming and peer-editing exercises.',
    effectiveness: 'Outstanding session. Student produced a complete essay outline by end. Strong rapport established.',
    improvements: 'Consider timed practice segments to build exam stamina.',
    pourFlags: [],
    accountability: null,
    processingTime: '8m 22s', tokensUsed: 1423,
    feedbackText: 'Excellent session. The teacher explained everything clearly and was very patient.',
  },
  {
    id: 'a3', demoId: '20260406_sophia_nicole',
    status: 'pending_review',
    teacher: 'Sophia Abid', student: 'Nicole', level: 'AS Level', subject: 'Psychology',
    date: '05 Apr 2026', salesAgent: 'Maryam', confidence: 6.2,
    studentRating: 3, analystRating: 3,
    conversionStatus: 'Pending',
    methodology: 'Adequate coverage of cognitive psychology basics. Teacher used textbook examples but lacked real-world application examples.',
    topicSelection: 'Memory models — Atkinson-Shiffrin and Working Memory. Appropriate for AS syllabus.',
    resourceUsage: 'Textbook only. No visual aids, diagrams, or supplementary materials provided despite topic lending itself well to visual representation.',
    interactivity: 'Mostly lecture-style. Student asked one question but was not encouraged to elaborate or discuss further.',
    effectiveness: 'Below expectations for AS level. Content was covered but depth was insufficient. Student may not retain key distinctions between models.',
    improvements: 'Use diagrams for memory models. Incorporate case studies (HM, Clive Wearing). Add interactive recall exercises.',
    pourFlags: [
      { category: 'Resources', severity: 'Medium', description: 'No supplementary materials despite availability — textbook-only approach for visual topic' },
    ],
    accountability: null,
    processingTime: '15m 08s', tokensUsed: 1654,
    feedbackText: 'It was okay. I wish there were more examples and practice questions.',
  },
]

export const DEPARTMENTS = [
  {
    id: 'cto', name: 'CTO', head: 'Ahmar Hussain',
    agents: ['Mudasir Ahmed', 'Manzar Ahmed', 'Ammar Abid', 'Ashir Ahsan'],
    totalAgents: 4, activeAgents: 2, hasEscalations: false,
    lastAction: '12 min ago',
  },
  {
    id: 'sales', name: 'Chief Sales Officer', head: 'Ahmed Shaheer',
    agents: ['Maryam Rasheeed', 'Hoor ul Ain Khatri'],
    totalAgents: 3, activeAgents: 2, hasEscalations: false,
    lastAction: '3 min ago',
  },
  {
    id: 'product', name: 'Head of Product / Counseling', head: 'Dawood Larejani',
    agents: ['Wajeeha Gul'],
    totalAgents: 2, activeAgents: 1, hasEscalations: false,
    lastAction: '1 min ago',
  },
  {
    id: 'excellence', name: 'Head of Student Excellence', head: 'Alisha Ahmed',
    agents: ['Faizan Salfi', 'Waleed Kamal', 'Neha Ashar'],
    totalAgents: 4, activeAgents: 3, hasEscalations: false,
    lastAction: '8 min ago',
  },
  {
    id: 'finance', name: 'Head of Financial Planning', head: 'Zeeshan Shaikh',
    agents: ['Ayza Shahid'],
    totalAgents: 2, activeAgents: 1, hasEscalations: false,
    lastAction: '45 min ago',
  },
  {
    id: 'marketing', name: 'Chief Marketing Officer', head: 'Mirza Sinan Baig',
    agents: ['Ahtisham', 'Shiza Islam'],
    totalAgents: 3, activeAgents: 2, hasEscalations: false,
    lastAction: '22 min ago',
  },
  {
    id: 'hr', name: 'Head of Human Resources', head: 'Heba',
    agents: ['Areeba Zaidi'],
    totalAgents: 2, activeAgents: 0, hasEscalations: false,
    lastAction: '2h ago',
  },
  {
    id: 'bizdev', name: 'Head of Business Development', head: 'Jason Mathew',
    agents: ['Sara'],
    totalAgents: 2, activeAgents: 1, hasEscalations: false,
    lastAction: '35 min ago',
  },
]

export const CURRICULUM_HINTS: Record<string, Record<string, string>> = {
  'Mathematics': { 'Pearson Edexcel': 'Common: 9MA0 (A Level) or 4MA1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0580 (IGCSE) or 9709 (A Level)' },
  'Chemistry': { 'Pearson Edexcel': 'Common: 9CH0 (A Level) or 4CH1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0620 (IGCSE) or 9701 (A Level)' },
  'Physics': { 'Pearson Edexcel': 'Common: 9PH0 (A Level) or 4PH1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0625 (IGCSE) or 9702 (A Level)' },
  'Biology': { 'Pearson Edexcel': 'Common: 9BI0 (A Level) or 4BI1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0610 (IGCSE) or 9700 (A Level)' },
  'English Language': { 'Pearson Edexcel': 'Common: 4EA1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0500 (IGCSE) or 0522 (IGCSE)' },
  'Business Studies': { 'Pearson Edexcel': 'Common: 9BS0 (A Level) or 4BS1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0450 (IGCSE) or 9609 (A Level)' },
  'Economics': { 'Pearson Edexcel': 'Common: 9EC0 (A Level) or 4EC1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0455 (IGCSE) or 9708 (A Level)' },
  'Accounting': { 'Pearson Edexcel': 'Common: 9AC0 (A Level) or 4AC1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0452 (IGCSE) or 9706 (A Level)' },
}
