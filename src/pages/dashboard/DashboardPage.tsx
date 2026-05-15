import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import type { Resume, AnalysisResult, SavedJob } from '@/lib/types'
import { formatDate, formatRelativeTime, getScoreColor } from '@/lib/utils'
import { FileText, TrendingUp, Bookmark, User, Upload, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar,
} from 'recharts'

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-[#F1F5F9]">{value}</p>
        <p className="text-sm text-[#94A3B8]">{label}</p>
        {sub && <p className="text-xs text-[#4A5568] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 border border-[#2A2A3A]" style={{ background: '#16161E' }}>
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="text-sm font-bold" style={{ color: getScoreColor(payload[0].value) }}>{payload[0].value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuthStore()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [r, a, j] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
        supabase.from('analysis_results').select('*').eq('user_id', user.id).order('analyzed_at', { ascending: false }),
        supabase.from('saved_jobs').select('*').eq('user_id', user.id),
      ])
      setResumes((r.data as Resume[]) || [])
      setAnalyses((a.data as AnalysisResult[]) || [])
      setSavedJobs((j.data as SavedJob[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.ats_score, 0) / analyses.length)
    : 0

  const profileFields = [profile?.full_name, profile?.target_role, profile?.linkedin_url, profile?.github_url]
  const profilePct = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)

  // Chart data
  const scoreHistory = analyses.slice(0, 8).reverse().map((a, i) => ({
    name: `Upload ${i + 1}`,
    score: a.ats_score,
    date: formatDate(a.analyzed_at),
  }))

  const lastAnalysis = analyses[0]
  const radarData = lastAnalysis
    ? [
        { subject: 'Formatting', A: lastAnalysis.score_breakdown.formatting * 4 },
        { subject: 'Keywords', A: lastAnalysis.score_breakdown.keywords * 4 },
        { subject: 'Experience', A: lastAnalysis.score_breakdown.experience * 4 },
        { subject: 'Skills', A: lastAnalysis.score_breakdown.skills_match * 4 },
      ]
    : []

  const skillsData = lastAnalysis
    ? [
        { name: 'Technical', count: lastAnalysis.skills_detected.technical.length, fill: '#6366F1' },
        { name: 'Soft Skills', count: lastAnalysis.skills_detected.soft.length, fill: '#22D3EE' },
        { name: 'Tools', count: lastAnalysis.skills_detected.tools.length, fill: '#10B981' },
      ]
    : []

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-[#94A3B8] text-sm mt-1">Here's your resume performance overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Resumes Uploaded" value={resumes.length} color="#6366F1" />
        <StatCard icon={TrendingUp} label="Avg ATS Score" value={avgScore || '—'} sub={avgScore ? getScoreColor(avgScore) : undefined} color="#22D3EE" />
        <StatCard icon={Bookmark} label="Jobs Saved" value={savedJobs.length} color="#10B981" />
        <StatCard icon={User} label="Profile Complete" value={`${profilePct}%`} color="#F59E0B" />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score history — spans 2 cols */}
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">ATS Score History</h3>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="name" tick={{ fill: '#4A5568', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4A5568', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-[#4A5568] gap-3">
              <TrendingUp style={{ width: 40, height: 40 }} />
              <p className="text-sm">Upload a resume to see score history</p>
              <Link to="/dashboard/upload" className="btn btn-primary text-xs">Upload Resume</Link>
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {resumes.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#6366F1]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Upload style={{ width: 13, height: 13, color: '#6366F1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F1F5F9] truncate">{r.file_name}</p>
                  <p className="text-[10px] text-[#4A5568]">{formatRelativeTime(r.uploaded_at)}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  r.status === 'complete' ? 'text-[#10B981] bg-[#10B981]/10' :
                  r.status === 'analyzing' ? 'text-[#F59E0B] bg-[#F59E0B]/10' :
                  r.status === 'failed' ? 'text-[#EF4444] bg-[#EF4444]/10' :
                  'text-[#94A3B8] bg-[#94A3B8]/10'
                }`}>{r.status}</span>
              </div>
            ))}
            {resumes.length === 0 && (
              <div className="text-center py-8 text-[#4A5568]">
                <Clock style={{ width: 32, height: 32, margin: '0 auto 8px' }} />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom charts */}
      {lastAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar */}
          <div className="card">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A3A" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills bar */}
          <div className="card">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Skills Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillsData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#16161E', border: '1px solid #2A2A3A', borderRadius: 8 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillsData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {resumes.length === 0 && (
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 border border-[#6366F1]/30"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))' }}
        >
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-[#F1F5F9] mb-1">Get started with ResumeIQ</h3>
            <p className="text-sm text-[#94A3B8]">Upload your resume and get an instant AI-powered ATS score with personalized recommendations.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/dashboard/upload" className="btn btn-primary">
              <Upload style={{ width: 16, height: 16 }} /> Upload Resume
            </Link>
            <Link to="/dashboard/profile" className="btn btn-secondary">
              <CheckCircle2 style={{ width: 16, height: 16 }} /> Complete Profile <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
