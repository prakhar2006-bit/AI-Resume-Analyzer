import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Minimum 8 characters'
    if (!confirm) errs.confirm = 'Please confirm your password'
    else if (password !== confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      navigate('/login')
    }
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
          <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Set new password</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Choose a strong password</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
                  placeholder="Min. 8 characters"
                  className={`input pr-10 ${errors.password ? 'error' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568]">
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {errors.password && <p className="text-[#EF4444] text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Confirm password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })) }}
                placeholder="Repeat password"
                className={`input ${errors.confirm ? 'error' : ''}`}
              />
              {errors.confirm && <p className="text-[#EF4444] text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
