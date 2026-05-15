import { Link } from 'react-router-dom'
import { Zap, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: '#0A0A0F' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6366F1]/8 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 space-y-6 animate-slide-up">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl gradient-text">ResumeIQ</span>
        </div>
        <h1 className="text-8xl font-heading font-bold gradient-text">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-[#F1F5F9]">Page not found</h2>
        <p className="text-[#94A3B8] max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            <Home style={{ width: 16, height: 16 }} /> Go Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
