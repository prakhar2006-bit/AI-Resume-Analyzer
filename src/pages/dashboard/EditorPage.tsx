import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Loader2, Save, FileText, ChevronLeft, Layout, Sparkles, X, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { AtsScoreBadge, SectionWordCount } from '@/components/dashboard/editor/EditorStats'
import { LiveTips } from '@/components/dashboard/editor/LiveTips'
import { ResumePreview } from '@/components/dashboard/editor/ResumePreview'
import { ResumeData } from '@/lib/types'

export default function EditorPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resume, setResume] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('contact')
  const [showTemplates, setShowTemplates] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  
  const [data, setData] = useState<ResumeData>({
    contact: { name: '', email: '', phone: '', linkedin: '', github: '', location: '' },
    summary: '',
    experience: [{ id: '1', company: '', role: '', dates: '', description: '', achievements: [] }],
    education: [{ id: '1', school: '', degree: '', dates: '' }],
    skills: [],
    projects: [],
    certifications: [],
    template: 'classic'
  })

  useEffect(() => {
    if (!user) return
    const fetchResumeData = async () => {
      try {
        const { data: res, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error
        setResume(res)
        if (res.resume_data && Object.keys(res.resume_data).length > 0) {
          setData(res.resume_data)
        }

        const { data: analysisRes } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('resume_id', res.id)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .single()
        
        if (analysisRes) setAnalysis(analysisRes)
      } catch (err) {
        console.error('Error fetching resume:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResumeData()
  }, [user])

  const handleSave = async (silent = false) => {
    if (!user || !resume) return
    if (!silent) setSaving(true)
    
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ resume_data: data })
        .eq('id', resume.id)
      
      if (error) throw error
      if (!silent) toast.success('Resume saved!')
    } catch (err) {
      console.error('Save error:', err)
      if (!silent) toast.error('Failed to save')
    } finally {
      if (!silent) setSaving(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && resume) handleSave(true)
    }, 30000)
    return () => clearTimeout(timer)
  }, [data])

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData({ ...data, skills: [...data.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    )
  }

  const sections = [
    { id: 'contact', name: 'Contact' },
    { id: 'summary', name: 'Summary' },
    { id: 'experience', name: 'Experience' },
    { id: 'education', name: 'Education' },
    { id: 'skills', name: 'Skills' }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#16161E] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#94A3B8]" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">AI Resume Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                saving ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {saving ? 'Saving...' : 'All Changes Saved'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <AtsScoreBadge data={data} />
          <div className="flex items-center gap-2 bg-[#16161E] border border-[#2A2A3A] rounded-lg p-1">
            <button 
              onClick={() => setShowTemplates(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${!showTemplates ? 'bg-[#6366F1] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              <Layout className="w-3.5 h-3.5" /> Editor
            </button>
            <button 
              onClick={() => setShowTemplates(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${showTemplates ? 'bg-[#6366F1] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Templates
            </button>
          </div>
          <button onClick={() => handleSave()} className="btn btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Now
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.id 
                    ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20' 
                    : 'bg-[#16161E] text-[#94A3B8] border border-[#2A2A3A] hover:border-[#6366F1]/50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="card space-y-6">
            {activeSection === 'contact' && (
              <div className="space-y-4 animate-slide-up">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Full Name</label>
                    <input type="text" value={data.contact.name} onChange={(e) => setData({...data, contact: {...data.contact, name: e.target.value}})} className="input" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Email</label>
                    <input type="email" value={data.contact.email} onChange={(e) => setData({...data, contact: {...data.contact, email: e.target.value}})} className="input" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Phone</label>
                    <input type="text" value={data.contact.phone} onChange={(e) => setData({...data, contact: {...data.contact, phone: e.target.value}})} className="input" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Location</label>
                    <input type="text" value={data.contact.location} onChange={(e) => setData({...data, contact: {...data.contact, location: e.target.value}})} className="input" placeholder="New York, NY" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'summary' && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Professional Summary</label>
                    <SectionWordCount content={data.summary} min={50} max={100} />
                  </div>
                  <textarea value={data.summary} onChange={(e) => setData({...data, summary: e.target.value})} className="input min-h-[160px] leading-relaxed" placeholder="Briefly describe your career goals..." />
                </div>
                <LiveTips section="Professional Summary" content={data.summary} />
              </div>
            )}

            {activeSection === 'education' && (
              <div className="space-y-6 animate-slide-up">
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="p-6 rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F]/50 space-y-4 relative group hover:border-[#6366F1]/30 transition-all">
                    <button onClick={() => setData({...data, education: data.education.filter((_, i) => i !== index)})} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4A5568] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">School / University</label>
                        <input className="input" value={edu.school} onChange={(e) => { const n = [...data.education]; n[index].school = e.target.value; setData({...data, education: n}) }} placeholder="e.g. Stanford University" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Degree</label>
                        <input className="input" value={edu.degree} onChange={(e) => { const n = [...data.education]; n[index].degree = e.target.value; setData({...data, education: n}) }} placeholder="e.g. B.S. Computer Science" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Dates</label>
                      <input className="input" value={edu.dates} onChange={(e) => { const n = [...data.education]; n[index].dates = e.target.value; setData({...data, education: n}) }} placeholder="e.g. 2018 - 2022" />
                    </div>
                  </div>
                ))}
                <button onClick={() => setData({...data, education: [...data.education, { id: Date.now().toString(), school: '', degree: '', dates: '' }]})} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2A2A3A] text-[#94A3B8] hover:border-[#6366F1]/50 hover:text-[#6366F1] transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            )}

            {activeSection === 'experience' && (
              <div className="space-y-6 animate-slide-up">
                {analysis?.missing_keywords && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-500">Missing ATS Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_keywords.map((kw: string) => {
                        const isIncluded = JSON.stringify(data).toLowerCase().includes(kw.toLowerCase())
                        return (
                          <span key={kw} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${isIncluded ? 'bg-emerald-500 text-white' : 'bg-[#16161E] text-[#94A3B8] border border-[#2A2A3A]'}`}>
                            {isIncluded && '✓ '}{kw}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-6 rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F]/50 space-y-4 relative group hover:border-[#6366F1]/30 transition-all">
                    <button onClick={() => setData({...data, experience: data.experience.filter((_, i) => i !== index)})} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4A5568] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Company</label>
                        <input className="input" value={exp.company} onChange={(e) => { const n = [...data.experience]; n[index].company = e.target.value; setData({...data, experience: n}) }} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Role</label>
                        <input className="input" value={exp.role} onChange={(e) => { const n = [...data.experience]; n[index].role = e.target.value; setData({...data, experience: n}) }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Description</label>
                        <SectionWordCount content={exp.description} min={50} max={150} />
                      </div>
                      <textarea className="input min-h-[120px] leading-relaxed" value={exp.description} onChange={(e) => { const n = [...data.experience]; n[index].description = e.target.value; setData({...data, experience: n}) }} />
                    </div>
                    <LiveTips section="Work Experience" content={exp.description} />
                  </div>
                ))}
                <button onClick={() => setData({...data, experience: [...data.experience, { id: Date.now().toString(), company: '', role: '', dates: '', description: '', achievements: [] }]})} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2A2A3A] text-[#94A3B8] hover:border-[#6366F1]/50 hover:text-[#6366F1] transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="space-y-6 animate-slide-up">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Add Technical Skills</label>
                  <div className="flex gap-2">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} className="input" placeholder="e.g. React, Python, AWS..." />
                    <button onClick={addSkill} className="btn btn-primary px-4"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-bold flex items-center gap-2">
                      {s}
                      <button onClick={() => setData({...data, skills: data.skills.filter(sk => sk !== s)})}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 bg-[#16161E] rounded-2xl border border-[#2A2A3A] p-8 overflow-y-auto flex justify-center custom-scrollbar">
          {showTemplates ? (
            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-2">Choose a Template</h2>
              {[
                { id: 'classic', name: 'Classic', desc: 'Traditional, professional, serif font.' },
                { id: 'modern', name: 'Modern', desc: 'Sleek, colored headers, sans-serif.' },
                { id: 'minimal', name: 'Minimal', desc: 'Clean typography, ultra-modern.' }
              ].map(t => (
                <button key={t.id} onClick={() => setData({...data, template: t.id as any})} className={`p-6 rounded-2xl border-2 text-left transition-all ${data.template === t.id ? 'border-[#6366F1] bg-[#6366F1]/10' : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#6366F1]/30'}`}>
                  <h3 className="font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{t.desc}</p>
                </button>
              ))}
            </div>
          ) : (
            <ResumePreview data={data} />
          )}
        </div>
      </div>
    </div>
  )
}
