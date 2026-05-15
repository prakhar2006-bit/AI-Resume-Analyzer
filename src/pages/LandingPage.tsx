import { Link } from 'react-router-dom'
import { Zap, Brain, TrendingUp, Briefcase, FileEdit, Moon, Shield, CheckCircle2, Star, ArrowRight, ExternalLink, Code, Users } from 'lucide-react'
import { ScoreRing } from '@/components/analysis/ScoreRing'

const features = [
  { icon: Brain, title: 'AI Analysis', desc: 'It reads your resume like a recruiter and surfaces actionable insights instantly.', color: '#6366F1' },
  { icon: TrendingUp, title: 'ATS Score', desc: 'Know exactly where you stand with a 0–100 ATS compatibility score and breakdown.', color: '#22D3EE' },
  { icon: Briefcase, title: 'Job Matching', desc: 'Get matched to relevant roles and search 20,000+ live remote jobs in one click.', color: '#10B981' },
  { icon: FileEdit, title: 'Resume Editor', desc: 'Build and polish your resume with a rich editor and export to PDF in seconds.', color: '#F59E0B' },
  { icon: Moon, title: 'Dark Mode', desc: 'A premium dark-first UI that is as beautiful as it is functional.', color: '#8B5CF6' },
  { icon: Shield, title: 'Privacy First', desc: 'Your resume data is encrypted and never shared. You own your data.', color: '#EF4444' },
]

const steps = [
  { n: '01', title: 'Upload Your Resume', desc: 'Drag and drop your PDF. We accept resumes up to 5MB.' },
  { n: '02', title: 'Get AI Analysis', desc: 'It analyzes your resume across 4 dimensions in seconds.' },
  { n: '03', title: 'Land Interviews', desc: 'Apply with confidence using your improved, ATS-optimized resume.' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer @ Google', text: 'ResumeIQ helped me identify exactly what my resume was missing. After the suggestions, I landed 3 interviews in a week!', rating: 5 },
  { name: 'Marcus Chen', role: 'Product Manager @ Stripe', text: 'The ATS score feature is a game changer. I went from 42 to 89 in two iterations. Highly recommend.', rating: 5 },
  { name: 'Amara Osei', role: 'Data Scientist @ Netflix', text: 'The missing keywords feature alone is worth it. Clean UI, fast analysis, and genuinely useful suggestions.', rating: 5 },
]

const mockAnalysis = {
  ats_score: 73,
  score_breakdown: { formatting: 18, keywords: 16, experience: 20, skills_match: 19 },
}

export default function LandingPage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#F1F5F9', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3A] sticky top-0 z-50" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg gradient-text">ResumeIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn btn-ghost text-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6366F1]/12 rounded-full blur-[100px]" />
          <div className="absolute top-32 right-1/4 w-[300px] h-[300px] bg-[#22D3EE]/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
            <Zap style={{ width: 12, height: 12 }} /> Powered by Claude AI · claude-sonnet-4
          </div> */}
          <h1 className="font-heading font-bold mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1 }}>
            Land Your Dream Job.<br />
            <span className="gradient-text">Beat the ATS.</span>
          </h1>
          <p className="text-[#94A3B8] text-lg mb-8 max-w-2xl mx-auto">
            ResumeIQ analyzes your resume with AI, gives you an instant ATS score, identifies missing keywords, and matches you with live remote job listings — all in seconds.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Get Started Free <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="relative max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl border border-[#2A2A3A] overflow-hidden shadow-2xl" style={{ background: '#111118' }}>
            <div className="flex items-center gap-2 p-3 border-b border-[#2A2A3A]">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-xs text-[#4A5568] ml-2">ResumeIQ — Analysis</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl" style={{ background: '#16161E' }}>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider">ATS Score</p>
                <ScoreRing score={mockAnalysis.ats_score} size={120} animate />
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                {[
                  { label: 'Formatting', val: 18, max: 25, color: '#10B981' },
                  { label: 'Keywords', val: 16, max: 25, color: '#F59E0B' },
                  { label: 'Experience', val: 20, max: 25, color: '#6366F1' },
                  { label: 'Skills Match', val: 19, max: 25, color: '#22D3EE' },
                ].map(({ label, val, max, color }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: '#16161E' }}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[#94A3B8]">{label}</span>
                      <span className="font-bold" style={{ color }}>{val}/{max}</span>
                    </div>
                    <div className="w-full bg-[#2A2A3A] rounded-full" style={{ height: 4 }}>
                      <div className="rounded-full" style={{ width: `${(val / max) * 100}%`, height: 4, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-y border-[#2A2A3A]" style={{ background: '#111118' }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap">
          {[
            { val: '10,000+', label: 'Resumes Analyzed' },
            { val: '94%', label: 'ATS Improvement Rate' },
            { val: '500+', label: 'Job Roles Matched' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-heading font-bold gradient-text">{val}</p>
              <p className="text-sm text-[#94A3B8] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-heading font-bold text-[#F1F5F9]">Everything you need to get hired</h2>
          <p className="text-[#94A3B8] mt-3">A complete toolkit for the modern job seeker</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card group hover:border-[#6366F1]/30" style={{ padding: '1.5rem' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <h3 className="font-heading font-semibold text-[#F1F5F9] mb-2">{title}</h3>
              <p className="text-sm text-[#94A3B8]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6" style={{ background: '#111118' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold text-[#F1F5F9] mb-14">How ResumeIQ works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                <div className="text-5xl font-heading font-bold gradient-text mb-4 opacity-30">{n}</div>
                <h3 className="font-heading font-semibold text-[#F1F5F9] mb-2">{title}</h3>
                <p className="text-sm text-[#94A3B8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-heading font-bold text-[#F1F5F9]">Loved by job seekers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(({ name, role, text, rating }) => (
            <div key={name} className="card" style={{ padding: '1.5rem' }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} style={{ width: 14, height: 14, color: '#F59E0B', fill: '#F59E0B' }} />
                ))}
              </div>
              <p className="text-sm text-[#94A3B8] mb-5 italic">"{text}"</p>
              <div>
                <p className="text-sm font-semibold text-[#F1F5F9]">{name}</p>
                <p className="text-xs text-[#4A5568]">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-[#F1F5F9] mb-3">Ready to get hired?</h2>
          <p className="text-[#94A3B8] mb-8">Join thousands of job seekers who improved their resume with ResumeIQ. No credit card, no trials — just a better resume.</p>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Get Started Now <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A3A] py-10 px-6" style={{ background: '#111118' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold gradient-text">ResumeIQ</span>
          </div>
          <p className="text-xs text-[#4A5568]">© 2026 ResumeIQ.</p>
          <div className="flex items-center gap-3">
            {[ExternalLink, Code, Users].map((Icon, i) => (
              <button key={i} className="p-2 rounded-lg text-[#4A5568] hover:text-[#94A3B8] hover:bg-white/5 transition-all">
                <Icon style={{ width: 16, height: 16 }} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
