import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email address'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { toast.error(err.message) } else { setSent(true) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0A0F' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl gradient-text">ResumeIQ</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Reset password</h1>
          <p className="text-[#94A3B8] text-sm mt-1">We'll send you a reset link</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
              <h3 className="font-semibold text-[#F1F5F9] mb-2">Email sent!</h3>
              <p className="text-[#94A3B8] text-sm">Check your inbox for the password reset link.</p>
              <Link to="/login" className="btn btn-primary w-full mt-6">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className={`input ${error ? 'error' : ''}`}
                />
                {error && <p className="text-[#EF4444] text-xs mt-1">{error}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mt-5 justify-center transition-colors">
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
