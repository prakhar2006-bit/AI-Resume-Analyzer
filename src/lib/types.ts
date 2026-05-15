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

export interface AnalysisResult {
  id: string
  resume_id: string
  user_id: string
  ats_score: number
  score_breakdown: {
    formatting: number
    keywords: number
    experience: number
    skills_match: number
  }
  overall_verdict: string
  summary: string
  strengths: string[]
  missing_keywords: string[]
  improvement_suggestions: Array<{
    priority: 'High' | 'Medium' | 'Low'
    category: string
    suggestion: string
  }>
  skills_detected: {
    technical: string[]
    soft: string[]
    tools: string[]
  }
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
