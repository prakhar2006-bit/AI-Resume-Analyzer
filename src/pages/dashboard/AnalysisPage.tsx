import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { AnalysisResult, Resume } from '@/lib/types'
import { ScoreRing } from '@/components/analysis/ScoreRing'
import { ScoreBreakdownCards } from '@/components/analysis/ScoreBreakdownCards'
import { KeywordCloud } from '@/components/analysis/KeywordCloud'
import { SuggestionsAccordion } from '@/components/analysis/SuggestionsAccordion'
import { SkillsTags } from '@/components/analysis/SkillsTags'
import { getVerdictBadgeClass, formatDate } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, ChevronRight, Briefcase, ArrowLeft, FileText, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-heading font-semibold text-[#F1F5F9]">{title}</h2>
      {children}
    </div>
  )
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const { data, error: err } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('id', id)
        .single()
      if (err || !data) {
        setError('Analysis not found')
        setLoading(false)
        return
      }
      setAnalysis(data as AnalysisResult)

      const { data: r } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', (data as AnalysisResult).resume_id)
        .single()
      if (r) setResume(r as Resume)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-12 h-12 text-[#F59E0B]" />
        <p className="text-[#94A3B8]">{error || 'Analysis not found'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-heading font-bold text-[#F1F5F9]">
              {resume?.file_name || 'Resume Analysis'}
            </h1>
            <span className={cn('badge', getVerdictBadgeClass(analysis.overall_verdict || 'Good'))}>
              {analysis.overall_verdict}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-0.5">Analyzed {formatDate(analysis.analyzed_at)} · {analysis.word_count} words · ~{analysis.estimated_years_experience} years experience</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-indigo">{analysis.experience_level}</span>
          <Link to="/dashboard/upload" className="btn btn-secondary text-xs">
            <FileText style={{ width: 13, height: 13 }} /> New Analysis
          </Link>
        </div>
      </div>

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center justify-center py-6">
          <p className="text-xs text-[#94A3B8] font-medium mb-4 uppercase tracking-widest">ATS Score</p>
          <ScoreRing score={analysis.ats_score} animate />
          <p className="text-sm text-[#94A3B8] mt-4 text-center max-w-48">{analysis.summary}</p>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <ScoreBreakdownCards breakdown={analysis.score_breakdown} />
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths?.length > 0 && (
        <Section title="✅ Strengths">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3 card" style={{ padding: '0.875rem' }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                <p className="text-sm text-[#94A3B8]">{s}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Red Flags */}
      {analysis.red_flags?.length > 0 && (
        <Section title="🚩 Red Flags">
          <div className="space-y-2">
            {analysis.red_flags.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle style={{ width: 16, height: 16, color: '#EF4444', marginTop: 2, flexShrink: 0 }} />
                <p className="text-sm text-[#94A3B8]">{f}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Missing Keywords */}
      <Section title="🔑 Missing Keywords">
        <div className="card">
          <p className="text-xs text-[#4A5568] mb-3">These keywords are commonly expected for your target roles — click to copy.</p>
          <KeywordCloud keywords={analysis.missing_keywords || []} />
        </div>
      </Section>

      {/* Improvement Suggestions */}
      <Section title="💡 Improvement Suggestions">
        <SuggestionsAccordion suggestions={analysis.improvement_suggestions || []} />
      </Section>

      {/* Skills */}
      <Section title="🛠 Skills Detected">
        <SkillsTags skills={analysis.skills_detected} />
      </Section>

      {/* Recommended Roles */}
      {analysis.recommended_roles?.length > 0 && (
        <Section title="💼 Recommended Roles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.recommended_roles.map((role, i) => (
              <div key={i} className="card" style={{ padding: '1rem' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase style={{ width: 15, height: 15, color: '#6366F1' }} />
                    <span className="text-sm font-semibold text-[#F1F5F9]">{role.title}</span>
                  </div>
                  <span className="badge badge-indigo flex-shrink-0">{role.match_percentage}%</span>
                </div>
                <p className="text-xs text-[#94A3B8]">{role.reason}</p>
                <Link
                  to={`/dashboard/jobs?search=${encodeURIComponent(role.title)}`}
                  className="flex items-center gap-1 text-xs text-[#6366F1] hover:underline mt-2"
                >
                  Search jobs <ChevronRight style={{ width: 11, height: 11 }} />
                </Link>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Industry Fit */}
      {analysis.industry_fit?.length > 0 && (
        <Section title="🌐 Industry Fit">
          <div className="flex flex-wrap gap-2">
            {analysis.industry_fit.map((ind, i) => (
              <div key={i} className="flex items-center gap-1.5 tag">
                <Globe style={{ width: 12, height: 12 }} /> {ind}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* People / experience */}
      <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-[#94A3B8]" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <Users style={{ width: 14, height: 14, color: '#6366F1' }} />
        Want to find matching jobs? Visit the{' '}
        <Link to="/dashboard/jobs" className="text-[#6366F1] hover:underline font-medium">Job Matches</Link> page.
      </div>
    </div>
  )
}
