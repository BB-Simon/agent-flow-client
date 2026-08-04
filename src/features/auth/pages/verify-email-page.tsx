import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'

import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authErrorMessage } from '@/features/auth/hooks/use-auth'
import { resendVerification, verifyEmail } from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const user = useAuthStore((s) => s.user)
  const [resendCooldown, setResendCooldown] = useState(false)

  const verifyMutation = useMutation({
    mutationFn: (t: string) => verifyEmail(t),
  })

  const resendMutation = useMutation({
    mutationFn: (email: string) => resendVerification(email),
  })

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token, {
        onSuccess: () => {
          setTimeout(() => navigate('/login', { replace: true }), 1500)
        },
      })
    }
    // Only run once for the token present at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (token) {
    return (
      <AuthLayout title="Verifying your email">
        {verifyMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </div>
        )}
        {verifyMutation.isSuccess && (
          <Alert variant="success">
            <CheckCircle2 />
            <AlertDescription>
              Email verified. Redirecting you to log in…
            </AlertDescription>
          </Alert>
        )}
        {verifyMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {authErrorMessage(
                verifyMutation.error,
                'This verification link is invalid or has expired.',
              )}
            </AlertDescription>
          </Alert>
        )}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Check your inbox"
      description="We sent a verification link to your email address."
      footer={
        <Link to="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      <Alert>
        <MailWarning />
        <AlertDescription>
          Click the link in the email to verify your account. Didn&apos;t get it?
        </AlertDescription>
      </Alert>

      {resendMutation.isSuccess ? (
        <p className="mt-4 text-sm text-success">Verification email resent.</p>
      ) : null}
      {resendMutation.isError ? (
        <p className="mt-4 text-sm text-destructive">
          {authErrorMessage(resendMutation.error, 'Could not resend the email.')}
        </p>
      ) : null}

      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={!user?.email || resendMutation.isPending || resendCooldown}
        onClick={() => {
          if (!user?.email) return
          resendMutation.mutate(user.email)
          setResendCooldown(true)
          setTimeout(() => setResendCooldown(false), 30_000)
        }}
      >
        {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
      </Button>
    </AuthLayout>
  )
}
