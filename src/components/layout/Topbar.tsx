import { useState, useEffect, useRef } from 'react'
import { Bell, Sun, Moon, X, CheckCheck } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { generateAvatarInitials, formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/lib/types'

export function Topbar({ title }: { title?: string }) {
  const { theme, toggleTheme } = useThemeStore()
  const { profile } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15)
      if (data) setNotifications(data as Notification[])
    }
    fetchNotifs()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-[#2A2A3A] sticky top-0 z-20"
      style={{ background: 'rgba(17,17,24,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <h2 className="text-base font-semibold text-[#F1F5F9]">{title || 'Dashboard'}</h2>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/8 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/8 transition-all relative"
            aria-label="Notifications"
          >
            <Bell style={{ width: 17, height: 17 }} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#6366F1] text-white text-[9px] flex items-center justify-center font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-12 w-80 rounded-xl border border-[#2A2A3A] shadow-2xl z-50 overflow-hidden animate-fade-in"
              style={{ background: '#16161E' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A3A]">
                <span className="font-semibold text-sm text-[#F1F5F9]">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#6366F1] hover:underline flex items-center gap-1">
                      <CheckCheck style={{ width: 11, height: 11 }} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifs(false)} className="text-[#4A5568] hover:text-[#94A3B8]">
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#4A5568] text-sm">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`px-4 py-3 border-b border-[#2A2A3A]/50 cursor-pointer hover:bg-white/3 transition-colors ${!n.is_read ? 'bg-[#6366F1]/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 flex-shrink-0" />}
                        <div className={!n.is_read ? '' : 'pl-3.5'}>
                          <p className="text-xs text-[#F1F5F9]">{n.message}</p>
                          <p className="text-[10px] text-[#4A5568] mt-0.5">{formatRelativeTime(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            profile?.full_name ? generateAvatarInitials(profile.full_name) : 'U'
          )}
        </div>
      </div>
    </header>
  )
}
