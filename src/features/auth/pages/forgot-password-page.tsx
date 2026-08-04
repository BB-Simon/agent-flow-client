import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'

import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authErrorMessage } from '@/features/auth/hooks/use-auth'
import { requestPasswordReset } from '@/features/auth/api/auth-api'
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

const requestSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
})

type RequestValues = z.infer<typeof requestSchema>

export function ForgotPasswordPage() {
  const requestReset = useMutation({
    mutationFn: (payload: RequestValues) => requestPasswordReset(payload.email),
  })

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    requestReset.mutate(values)
  })

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      {requestReset.isSuccess ? (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription>
            If an account exists for that email, a reset link is on its way.
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {requestReset.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {authErrorMessage(requestReset.error, 'Could not send the reset email.')}
                </AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={requestReset.isPending}>
              {requestReset.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </Form>
      )}
    </AuthLayout>
  )
}
