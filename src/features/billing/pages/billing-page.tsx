import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'

import { AppHeader } from '@/components/app-header'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageMeter } from '@/features/billing/components/usage-meter'
import {
  useCreateCheckout,
  useCreatePortal,
  useCurrentUsageQuery,
} from '@/features/billing/hooks/use-billing'
import type { Plan } from '@/features/billing/api/billing-api'

const PLAN_ORDER: Plan[] = ['FREE', 'PRO', 'TEAM']

const PLANS: { plan: Plan; name: string; features: string[] }[] = [
  {
    plan: 'FREE',
    name: 'Free',
    features: ['1 workflow', '20 runs / month', 'No team invites'],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    features: ['Unlimited workflows', '500 runs / month', 'Team invites'],
  },
  {
    plan: 'TEAM',
    name: 'Team',
    features: [
      'Unlimited workflows',
      'Unlimited runs (usage-based overages)',
      'Priority support',
      'SSO option',
    ],
  },
]

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

export function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const canManageBilling = user?.role === 'OWNER' || user?.role === 'ADMIN'

  const { data: usage, isLoading, refetch } = useCurrentUsageQuery()
  const createCheckout = useCreateCheckout()
  const createPortal = useCreatePortal()

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'success') {
      toast.success('Subscription updated')
      refetch()
    } else if (checkout === 'cancelled') {
      toast.info('Checkout cancelled')
    }
    if (checkout) {
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleUpgrade(plan: 'PRO' | 'TEAM') {
    createCheckout.mutate(plan, {
      onSuccess: ({ url }) => {
        window.location.href = url
      },
      onError: (error) => {
        toast.error('Could not start checkout', {
          description: errorMessage(error, 'Please try again.'),
        })
      },
    })
  }

  function handleManageBilling() {
    createPortal.mutate(undefined, {
      onSuccess: ({ url }) => {
        window.location.href = url
      },
      onError: (error) => {
        toast.error('Could not open billing portal', {
          description: errorMessage(error, 'Please try again.'),
        })
      },
    })
  }

  const currentRank = usage ? PLAN_ORDER.indexOf(usage.plan) : -1

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Billing</h1>
          {canManageBilling ? (
            <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={createPortal.isPending}>
              {createPortal.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Manage in Stripe portal
            </Button>
          ) : null}
        </div>

        {!canManageBilling ? (
          <p className="mb-6 text-sm text-muted-foreground">
            Only team owners and admins can manage billing.
          </p>
        ) : null}

        {isLoading || !usage ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current usage</CardTitle>
                <CardDescription>
                  Billing period {new Date(usage.periodStart).toLocaleDateString()} –{' '}
                  {new Date(usage.periodEnd).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageMeter label="Runs" used={usage.runsUsed} limit={usage.runsLimit} unit="runs" />
                <UsageMeter
                  label="Workflows"
                  used={usage.workflowsUsed}
                  limit={usage.workflowsLimit}
                  unit="workflows"
                />
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-foreground">Tokens used this period</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {usage.tokensUsed.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PLANS.map(({ plan, name, features }) => {
                const rank = PLAN_ORDER.indexOf(plan)
                const isCurrent = plan === usage.plan
                const isUpgrade = rank > currentRank

                return (
                  <Card key={plan} className={isCurrent ? 'border-accent/50' : undefined}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {name}
                        {isCurrent ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                            Current plan
                          </span>
                        ) : null}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {features.map((feature) => (
                          <li key={feature} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {plan === 'FREE' ? (
                        <p className="text-xs text-muted-foreground">
                          {isCurrent ? 'Your current plan.' : 'Downgrade from the billing portal.'}
                        </p>
                      ) : isCurrent ? (
                        <p className="text-xs text-muted-foreground">Your current plan.</p>
                      ) : isUpgrade ? (
                        <Button
                          className="w-full"
                          disabled={!canManageBilling || createCheckout.isPending}
                          onClick={() => handleUpgrade(plan as 'PRO' | 'TEAM')}
                        >
                          {createCheckout.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Upgrade to {name}
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">Manage from the billing portal.</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
