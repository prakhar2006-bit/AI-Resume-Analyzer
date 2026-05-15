import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

interface Props { children: React.ReactNode }

export function ProtectedRoute({ children }: Props) {
  const { user, setUser, setSession, fetchProfile } = useAuthStore()
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            setSession(session)
            fetchProfile(session.user.id).catch(() => {})
          }
          setChecking(false)
        }
      } catch (err) {
        if (mounted) setChecking(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user)
          setSession(session)
          fetchProfile(session.user.id).catch(() => {})
        } else {
          setUser(null)
          setSession(null)
        }
        setChecking(false)
      }
    })

    // Timeout fallback: If we are still "checking" after 2 seconds, just stop and let the user in
    const timeout = setTimeout(() => {
      if (mounted && checking) setChecking(false)
    }, 2000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [setUser, setSession, fetchProfile, checking])

  // Only show loading for a maximum of 2 seconds, or until checking is done
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="text-[#4A5568] text-sm">Resyncing session...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
