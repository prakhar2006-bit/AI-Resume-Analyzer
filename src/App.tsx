import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from '@/stores/themeStore'

// Layout
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Public
import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage'
import UploadPage from '@/pages/dashboard/UploadPage'
import AnalysisPage from '@/pages/dashboard/AnalysisPage'
import JobsPage from '@/pages/dashboard/JobsPage'
import SavedJobsPage from '@/pages/dashboard/SavedJobsPage'
import EditorPage from '@/pages/dashboard/EditorPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import HistoryPage from '@/pages/dashboard/HistoryPage'

function App() {
  // Initialize theme from store (runs side effects on import)
  useThemeStore()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16161E',
            color: '#F1F5F9',
            border: '1px solid #2A2A3A',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/upload"
          element={
            <ProtectedRoute>
              <AppShell>
                <UploadPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analysis/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <AnalysisPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/jobs"
          element={
            <ProtectedRoute>
              <AppShell>
                <JobsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/saved-jobs"
          element={
            <ProtectedRoute>
              <AppShell>
                <SavedJobsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/editor"
          element={
            <ProtectedRoute>
              <AppShell>
                <EditorPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <AppShell>
                <HistoryPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
