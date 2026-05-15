import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Briefcase, Bookmark, FileEdit,
  User, History, ChevronLeft, ChevronRight, LogOut, Zap
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/dashboard/upload', icon: Upload, label: 'Upload Resume' },
  { to: '/dashboard/jobs', icon: Briefcase, label: 'Job Matches' },
  { to: '/dashboard/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { to: '/dashboard/editor', icon: FileEdit, label: 'Resume Editor' },
  { to: '/dashboard/history', icon: History, label: 'History' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 transition-all duration-300 z-30',
        'border-r border-[#2A2A3A]',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ background: '#111118' }}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 p-4 border-b border-[#2A2A3A]', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg gradient-text">ResumeIQ</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact)
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center',
                active
                  ? 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/25'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-[#6366F1]' : '')} style={{ width: 18, height: 18 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-[#2A2A3A] space-y-1">
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
            'text-[#4A5568] hover:text-[#94A3B8] hover:bg-white/5 transition-all',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight style={{ width: 16, height: 16 }} />
          ) : (
            <>
              <ChevronLeft style={{ width: 16, height: 16 }} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
