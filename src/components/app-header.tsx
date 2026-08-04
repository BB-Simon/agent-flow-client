import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useLogout } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { to: '/workflows', label: 'Workflows' },
  { to: '/billing', label: 'Billing' },
]

export function AppHeader() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <span className="block h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Agent Flow
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                location.pathname.startsWith(link.to) && 'bg-muted text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
          Log out
        </Button>
      </div>
    </header>
  )
}
