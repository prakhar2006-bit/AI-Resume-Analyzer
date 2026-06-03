import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Briefcase, Bookmark, FileEdit,
  User, History, ChevronLeft, ChevronRight, LogOut, Zap, X
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

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose()
    }
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  const sidebarContent = (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 z-30',
        'border-r border-[#2A2A3A]',
        // On mobile, always expanded; on desktop, respect collapsed state
        'w-60 md:w-auto',
        !collapsed ? 'md:w-60' : 'md:w-16'
      )}
      style={{ background: '#111118' }}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 p-4 border-b border-[#2A2A3A]', collapsed && 'md:justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className={cn('font-heading font-bold text-lg gradient-text', collapsed && 'md:hidden')}>ResumeIQ</span>
        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="ml-auto md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-all"
            aria-label="Close menu"
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
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
                collapsed && 'md:justify-center',
                active
                  ? 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/25'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-[#6366F1]' : '')} style={{ width: 18, height: 18 }} />
              <span className={cn(collapsed && 'md:hidden')}>{item.label}</span>
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
            collapsed && 'md:justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
          <span className={cn(collapsed && 'md:hidden')}>Sign Out</span>
        </button>

        {/* Collapse toggle — hidden on mobile */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full hidden md:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
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

  return (
    <>
      {/* Desktop sidebar — always visible, hidden on mobile */}
      <div className="hidden md:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-slide-in-left">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
