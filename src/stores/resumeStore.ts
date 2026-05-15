import { create } from 'zustand'
import type { Resume, AnalysisResult } from '@/lib/types'

interface ResumeState {
  resumes: Resume[]
  currentResume: Resume | null
  currentAnalysis: AnalysisResult | null
  loading: boolean
  analyzing: boolean
  setResumes: (resumes: Resume[]) => void
  setCurrentResume: (resume: Resume | null) => void
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void
  setLoading: (loading: boolean) => void
  setAnalyzing: (analyzing: boolean) => void
  addResume: (resume: Resume) => void
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  currentResume: null,
  currentAnalysis: null,
  loading: false,
  analyzing: false,
  setResumes: (resumes) => set({ resumes }),
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setLoading: (loading) => set({ loading }),
  setAnalyzing: (analyzing) => set({ analyzing }),
  addResume: (resume) => set((state) => ({ resumes: [resume, ...state.resumes] })),
}))
