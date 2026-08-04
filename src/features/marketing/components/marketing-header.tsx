import { Link } from 'react-router-dom'

import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'

export function MarketingHeader() {
  const status = useAuthStore((s) => s.status)
  const isAuthenticated = status === 'authenticated'

  return (
    <header className="border-b border-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <span className="af-glow-running block h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Agent Flow</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button size="sm" asChild>
              <Link to="/workflows">Go to app</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
