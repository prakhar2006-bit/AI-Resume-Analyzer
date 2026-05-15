import { create } from 'zustand'
import type { SavedJob } from '@/lib/types'

interface JobState {
  savedJobs: SavedJob[]
  setSavedJobs: (jobs: SavedJob[]) => void
  addSavedJob: (job: SavedJob) => void
  removeSavedJob: (jobId: string) => void
}

export const useJobStore = create<JobState>((set) => ({
  savedJobs: [],
  setSavedJobs: (jobs) => set({ savedJobs: jobs }),
  addSavedJob: (job) => set((state) => ({ savedJobs: [job, ...state.savedJobs] })),
  removeSavedJob: (jobId) =>
    set((state) => ({ savedJobs: state.savedJobs.filter((j) => j.id !== jobId) })),
}))
