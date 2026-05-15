import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/upload': 'Upload Resume',
  '/dashboard/jobs': 'Job Matches',
  '/dashboard/saved-jobs': 'Saved Jobs',
  '/dashboard/editor': 'Resume Editor',
  '/dashboard/history': 'Resume History',
  '/dashboard/profile': 'My Profile',
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'ResumeIQ'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
