import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { AnalysisResult, RemotiveJob, SavedJob } from '@/lib/types'
import { Briefcase, Bookmark, BookmarkCheck, ExternalLink, Search, Loader2, Globe, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { truncate } from '@/lib/utils'

function JobCard({ job, saved, onSave }: { job: RemotiveJob; saved: boolean; onSave: (job: RemotiveJob) => void }) {
  return (
    <div className="card hover:border-[#6366F1]/30 transition-all">
      <div className="flex items-start gap-3">
        {job.company_logo ? (
          <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 rounded-lg object-contain bg-white/5 flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#6366F1]/15 flex items-center justify-center flex-shrink-0 text-[#6366F1] font-bold text-sm">
            {job.company_name?.[0] || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#F1F5F9] leading-tight">{job.title}</h3>
            <button
              onClick={() => onSave(job)}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${saved ? 'text-[#6366F1] bg-[#6366F1]/15' : 'text-[#4A5568] hover:text-[#6366F1] hover:bg-[#6366F1]/10'}`}
              title={saved ? 'Saved' : 'Save job'}
            >
              {saved ? <BookmarkCheck style={{ width: 15, height: 15 }} /> : <Bookmark style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">{job.company_name}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {job.candidate_required_location && (
              <span className="flex items-center gap-1 text-[10px] text-[#4A5568]">
                <MapPin style={{ width: 10, height: 10 }} /> {truncate(job.candidate_required_location, 25)}
              </span>
            )}
            {job.job_type && (
              <span className="text-[10px] badge badge-indigo">{job.job_type}</span>
            )}
            {job.salary && <span className="text-[10px] text-[#10B981]">{truncate(job.salary, 30)}</span>}
          </div>
        </div>
      </div>
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary w-full mt-3 text-xs"
      >
        Apply <ExternalLink style={{ width: 12, height: 12 }} />
      </a>
    </div>
  )
}

export default function JobsPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const initSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(initSearch)
  const [jobs, setJobs] = useState<RemotiveJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'full_time' | 'part_time'>('all')

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!user) return
      const { data } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setAnalysis(data as AnalysisResult)
    }
    const loadSaved = async () => {
      if (!user) return
      const { data } = await supabase.from('saved_jobs').select('job_url').eq('user_id', user.id)
      if (data) setSavedIds(new Set(data.map((j: { job_url: string }) => j.job_url)))
    }
    loadAnalysis()
    loadSaved()
  }, [user])

  useEffect(() => {
    if (initSearch) fetchJobs(initSearch)
  }, [initSearch])

  const fetchJobs = async (query: string) => {
    if (!query.trim()) return
    setLoadingJobs(true)
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch {
      toast.error('Failed to fetch jobs. Try again.')
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchJobs(search) }

  const handleSave = async (job: RemotiveJob) => {
    if (!user) return
    if (savedIds.has(job.url)) {
      toast('Already saved!')
      return
    }
    const { error } = await supabase.from('saved_jobs').insert({
      user_id: user.id,
      job_title: job.title,
      company: job.company_name,
      job_url: job.url,
      location: job.candidate_required_location,
      salary: job.salary,
    })
    if (!error) {
      setSavedIds((prev) => new Set([...prev, job.url]))
      toast.success('Job saved!')
    }
  }

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'full_time') return j.job_type?.toLowerCase().includes('full')
    if (filter === 'part_time') return j.job_type?.toLowerCase().includes('part')
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Job Matches</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Roles matched to your resume + live remote job search</p>
      </div>

      {/* Recommended from AI */}
      {analysis?.recommended_roles?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <Briefcase style={{ width: 15, height: 15, color: '#6366F1' }} /> AI Recommended Roles
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.recommended_roles.map((r, i) => (
              <button
                key={i}
                onClick={() => { setSearch(r.title); fetchJobs(r.title) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-[#6366F1]/10 transition-all border border-[#2A2A3A] hover:border-[#6366F1]/30"
              >
                <span className="text-[#F1F5F9] font-medium">{r.title}</span>
                <span className="badge badge-indigo">{r.match_percentage}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" style={{ width: 16, height: 16 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs (e.g. React Developer, Data Analyst...)"
            className="input pl-9"
          />
        </div>
        <button type="submit" disabled={loadingJobs} className="btn btn-primary px-5">
          {loadingJobs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search style={{ width: 15, height: 15 }} />}
          Search
        </button>
      </form>

      {/* Filters */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-2">
          {(['all', 'full_time', 'part_time'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === f ? 'bg-[#6366F1]/15 border-[#6366F1]/30 text-[#6366F1]' : 'border-[#2A2A3A] text-[#94A3B8] hover:border-[#6366F1]/20'}`}
            >
              {f === 'all' ? 'All' : f === 'full_time' ? 'Full-time' : 'Part-time'}
            </button>
          ))}
          <span className="text-xs text-[#4A5568] ml-2">{filteredJobs.length} jobs found</span>
        </div>
      )}

      {/* Job grid */}
      {loadingJobs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-xl" />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} saved={savedIds.has(job.url)} onSave={handleSave} />
          ))}
        </div>
      ) : jobs.length === 0 && !loadingJobs ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Globe style={{ width: 48, height: 48, color: '#2A2A3A' }} />
          <p className="text-[#F1F5F9] font-semibold">Search for remote jobs</p>
          <p className="text-[#94A3B8] text-sm max-w-sm">Use the search bar or click on an AI-recommended role above to find live remote job listings.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-[#94A3B8] text-sm">No jobs found for that filter. Try "All".</p>
        </div>
      )}
    </div>
  )
}
