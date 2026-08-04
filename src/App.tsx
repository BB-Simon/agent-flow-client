import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuthStore } from '@/store/auth-store'
import { useAuthBootstrap } from '@/features/auth/hooks/use-auth'
import { LoginPage } from '@/features/auth/pages/login-page'
import { SignupPage } from '@/features/auth/pages/signup-page'
import { VerifyEmailPage } from '@/features/auth/pages/verify-email-page'
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { WorkflowListPage } from '@/features/canvas/pages/workflow-list-page'
import { WorkflowEditorPage } from '@/features/canvas/pages/workflow-editor-page'
import { RunHistoryPage } from '@/features/execution/pages/run-history-page'
import { RunReplayPage } from '@/features/execution/pages/run-replay-page'
import { BillingPage } from '@/features/billing/pages/billing-page'
import { TeamSettingsPage } from '@/features/team/pages/team-settings-page'
import { ApiKeysPage } from '@/features/api-keys/pages/api-keys-page'
import { LandingPage } from '@/features/marketing/pages/landing-page'
import { QuickstartPage } from '@/features/marketing/pages/quickstart-page'

function RootRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return null
  if (status === 'authenticated') return <Navigate to="/workflows" replace />
  return <LandingPage />
}

function App() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/docs" element={<QuickstartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <WorkflowListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/:id"
        element={
          <ProtectedRoute>
            <WorkflowEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/:id/runs"
        element={
          <ProtectedRoute>
            <RunHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/:id/runs/:runId"
        element={
          <ProtectedRoute>
            <RunReplayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute>
            <ApiKeysPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
