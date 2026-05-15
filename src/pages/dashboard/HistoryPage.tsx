import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Resume, AnalysisResult } from '@/lib/types'
import { formatDate, getScoreColor } from '@/lib/utils'
import { FileText, TrendingUp, ChevronRight, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data: r } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
      const resumeList = (r as Resume[]) || []
      setResumes(resumeList)

      if (resumeList.length) {
        const ids = resumeList.map((r) => r.id)
        const { data: a } = await supabase
          .from('analysis_results')
          .select('*')
          .in('resume_id', ids)
        const map: Record<string, AnalysisResult> = {}
        for (const item of (a as AnalysisResult[]) || []) {
          map[item.resume_id] = item
        }
        setAnalyses(map)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleDelete = async (resumeId: string) => {
    await supabase.from('resumes').delete().eq('id', resumeId)
    setResumes((prev) => prev.filter((r) => r.id !== resumeId))
    toast.success('Resume deleted')
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Resume History</h1>
        <p className="text-[#94A3B8] text-sm mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Clock style={{ width: 48, height: 48, color: '#2A2A3A' }} />
          <p className="text-[#F1F5F9] font-semibold">No resumes yet</p>
          <Link to="/dashboard/upload" className="btn btn-primary">Upload Your First Resume</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => {
            const analysis = analyses[resume.id]
            return (
              <div key={resume.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center flex-shrink-0">
                  <FileText style={{ width: 18, height: 18, color: '#EF4444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F1F5F9] truncate">{resume.file_name}</p>
                  <p className="text-xs text-[#4A5568]">Uploaded {formatDate(resume.uploaded_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {analysis ? (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp style={{ width: 13, height: 13, color: getScoreColor(analysis.ats_score) }} />
                      <span className="text-sm font-bold" style={{ color: getScoreColor(analysis.ats_score) }}>
                        {analysis.ats_score}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs badge ${resume.status === 'analyzing' ? 'badge-warning' : resume.status === 'failed' ? 'badge-danger' : 'badge-indigo'}`}>
                      {resume.status}
                    </span>
                  )}
                  {analysis && (
                    <Link to={`/dashboard/analysis/${analysis.id}`} className="btn btn-secondary text-xs">
                      View <ChevronRight style={{ width: 12, height: 12 }} />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 rounded-lg text-[#4A5568] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
