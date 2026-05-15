import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { SavedJob } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Bookmark, ExternalLink, Trash2, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SavedJobsPage() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })
      setJobs((data as SavedJob[]) || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleRemove = async (id: string) => {
    await supabase.from('saved_jobs').delete().eq('id', id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
    toast.success('Job removed')
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Saved Jobs</h1>
        <p className="text-[#94A3B8] text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Bookmark style={{ width: 48, height: 48, color: '#2A2A3A' }} />
          <p className="text-[#F1F5F9] font-semibold">No saved jobs yet</p>
          <p className="text-[#94A3B8] text-sm">Browse jobs and save the ones you like.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/15 flex items-center justify-center flex-shrink-0 text-[#6366F1] font-bold text-sm">
                {job.company?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F1F5F9] truncate">{job.job_title}</p>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5 flex-wrap">
                  <span>{job.company}</span>
                  {job.location && (
                    <><span className="text-[#2A2A3A]">·</span>
                    <span className="flex items-center gap-1"><MapPin style={{ width: 10, height: 10 }} /> {job.location}</span></>
                  )}
                  {job.salary && <><span className="text-[#2A2A3A]">·</span><span className="text-[#10B981]">{job.salary}</span></>}
                  <span className="text-[#4A5568]">Saved {formatDate(job.saved_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-xs"
                >
                  <ExternalLink style={{ width: 12, height: 12 }} /> Apply
                </a>
                <button
                  onClick={() => handleRemove(job.id)}
                  className="p-2 rounded-lg text-[#4A5568] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
