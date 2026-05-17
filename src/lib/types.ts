export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  linkedin_url: string | null
  github_url: string | null
  target_role: string | null
  target_industry: string | null
  skills: string[] | null
  created_at: string
}

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_url: string
  status: 'pending' | 'analyzing' | 'complete' | 'failed'
  uploaded_at: string
  resume_data?: ResumeData
}

export interface ResumeData {
  contact: {
    name: string
    email: string
    phone: string
    linkedin: string
    github: string
    location: string
  }
  summary: string
  experience: ExperienceBlock[]
  education: EducationBlock[]
  skills: string[]
  projects: ProjectBlock[]
  certifications: CertificationBlock[]
  template: 'classic' | 'modern' | 'minimal'
}

export interface ExperienceBlock {
  id: string
  company: string
  role: string
  dates: string
  description: string
  achievements: string[]
}

export interface EducationBlock {
  id: string
  school: string
  degree: string
  dates: string
  description?: string
}

export interface ProjectBlock {
  id: string
  name: string
  description: string
  link?: string
}

export interface CertificationBlock {
  id: string
  name: string
  issuer: string
  date: string
}

export interface ScoreBreakdown {
  formatting: number
  keywords: number
  experience: number
  skills_match: number
}

export interface SkillsDetected {
  technical: string[]
  soft: string[]
  tools: string[]
}

export interface AnalysisResult {
  id: string
  resume_id: string
  user_id: string
  ats_score: number
  score_breakdown: ScoreBreakdown
  overall_verdict: string
  summary: string
  strengths: string[]
  missing_keywords: string[]
  improvement_suggestions: ImprovementSuggestion[]
  skills_detected: SkillsDetected
  recommended_roles: Array<{
    title: string
    match_percentage: number
    reason: string
  }>
  experience_level: string
  industry_fit: string[]
  red_flags: string[]
  word_count: number
  estimated_years_experience: number
  analyzed_at: string
}


export interface ImprovementSuggestion {
  priority: 'High' | 'Medium' | 'Low'
  category: string
  suggestion: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface SavedJob {
  id: string
  user_id: string
  job_title: string
  company: string
  job_url: string
  location?: string
  salary?: string
  saved_at: string
}

export interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  company_logo?: string
  category: string
  tags: string[]
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary?: string
  description: string
}
