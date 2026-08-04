import { useAuthStore } from '@/store/auth-store'
import { useLogout } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="min-h-svh bg-background p-8">
      <header className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <span className="block h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Agent Flow
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
          Log out
        </Button>
      </header>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Signed in as {user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border bg-panel px-3 py-2">
              <span className="text-muted-foreground">Email verified</span>
              <span className={user?.emailVerified ? 'text-success' : 'text-warning'}>
                {user?.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-panel px-3 py-2">
              <span className="text-muted-foreground">Role</span>
              <code className="font-mono text-xs text-foreground">{user?.role}</code>
            </div>
            <p className="pt-4 text-muted-foreground">
              The workflow canvas lands in the next build step.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
