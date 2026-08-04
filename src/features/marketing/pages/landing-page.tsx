import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, Eye, GitFork, MousePointerClick } from 'lucide-react'

import { MarketingHeader } from '@/features/marketing/components/marketing-header'
import { CanvasDemo } from '@/features/marketing/components/canvas-demo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PLANS } from '@/features/billing/plans'

const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'Visual',
    description: 'See the whole architecture as a graph, not buried in code.',
  },
  {
    icon: Eye,
    title: 'Observable',
    description: "Watch each agent's reasoning and tool calls stream live.",
  },
  {
    icon: GitFork,
    title: 'Replayable',
    description: 'Every run is logged event-by-event and can be replayed later for debugging.',
  },
  {
    icon: Check,
    title: 'No-code buildable',
    description: 'Non-engineers can assemble a pipeline; engineers can drop into custom tools.',
  },
]

export function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <div className="min-h-svh bg-background">
      <MarketingHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Build multi-agent AI workflows{' '}
              <span className="text-accent">you can actually watch run</span>
            </h1>
            <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
              A visual canvas for wiring together AI agents into a live, observable,
              replayable workflow. Drag, connect, run — watch every token and tool call
              stream in real time.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">Get started free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/docs">View docs</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-5xl">
            <CanvasDemo />
          </div>
        </section>

        <section className="border-t border-border bg-panel/40 px-6 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="scroll-mt-16 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pricing</h2>
              <p className="mt-2 text-muted-foreground">
                Start free. Upgrade when your team needs more runs.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PLANS.map(({ plan, name, features }) => (
                <Card key={plan} className={plan === 'PRO' ? 'border-accent/50' : undefined}>
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
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
                    <Button className="w-full" variant={plan === 'PRO' ? 'default' : 'outline'} asChild>
                      <Link to="/signup">Get started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>Agent Flow</span>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link to="/#pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
