import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authErrorMessage } from '@/features/auth/hooks/use-auth'
import { confirmPasswordReset } from '@/features/auth/api/auth-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type ResetValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const confirmReset = useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      confirmPasswordReset(payload),
  })

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!token) return
    confirmReset.mutate(
      { token, newPassword: values.password },
      {
        onSuccess: () => setTimeout(() => navigate('/login', { replace: true }), 1500),
      },
    )
  })

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        footer={
          <Link to="/forgot-password" className="text-accent hover:underline">
            Request a new link
          </Link>
        }
      >
        <Alert variant="destructive">
          <AlertDescription>
            This password reset link is missing its token. Request a new one below.
          </AlertDescription>
        </Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" footer={
      <Link to="/login" className="text-accent hover:underline">
        Back to log in
      </Link>
    }>
      {confirmReset.isSuccess ? (
        <Alert variant="success">
          <AlertDescription>Password updated. Redirecting you to log in…</AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {confirmReset.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {authErrorMessage(
                    confirmReset.error,
                    'This reset link is invalid or has expired.',
                  )}
                </AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={confirmReset.isPending}>
              {confirmReset.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </Form>
      )}
    </AuthLayout>
  )
}
