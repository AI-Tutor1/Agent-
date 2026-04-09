export type SubmissionStatus = 'Processing' | 'Awaiting Sales' | 'Pending Review' | 'Reviewed' | 'Escalated'

export interface RecentSubmission {
  date: string
  teacher: string
  student: string
  level: string
  subject: string
  status: SubmissionStatus
}

export interface PendingDemo {
  id: string
  teacher: string
  student: string
  level: string
  subject: string
  loggedAgo: string
  loggedHours: number
}

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

export type UserRole = 'counselor' | 'sales' | 'manager' | 'dual' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  dept: string
}
