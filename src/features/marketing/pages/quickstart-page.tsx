import { Link } from 'react-router-dom'

import { MarketingHeader } from '@/features/marketing/components/marketing-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS = [
  {
    title: 'Create an account',
    description: 'Sign up with email — a personal team is created for you automatically.',
  },
  {
    title: 'Start a workflow',
    description:
      'From Workflows, click "New workflow." You start with a connected Input → Output pair.',
  },
  {
    title: 'Add nodes from the palette',
    description:
      'Drag in an Agent node for reasoning, a Tool node for actions, Router/Aggregator for branching and merging, and Human Review to pause for approval.',
  },
  {
    title: 'Configure each node',
    description:
      'Click a node to open its config drawer. An Agent node needs a system prompt and a model at minimum.',
  },
  {
    title: 'Connect the graph',
    description:
      'Drag from a node\'s right handle to the next node\'s left handle. Agent → Tool edges attach that tool to the agent.',
  },
  {
    title: 'Run it',
    description:
      'Hit Run in the toolbar. The canvas highlights the active node and streams tokens live as each agent responds.',
  },
  {
    title: 'Replay any past run',
    description:
      'Open History from a workflow to see every run, then scrub through the exact event log to see what happened and why.',
  },
]

const NODE_TYPES = [
  { name: 'Input', purpose: 'Entry point — the message that starts a run.' },
  { name: 'Agent', purpose: 'An LLM call with its own system prompt, model, and temperature.' },
  { name: 'Tool', purpose: 'A callable function — built-in (search, calculator, HTTP) or a custom webhook.' },
  { name: 'Router', purpose: 'Sends the message to a different branch based on the agent output.' },
  { name: 'Aggregator', purpose: 'Waits for every incoming branch before merging and continuing.' },
  { name: 'Human Review', purpose: 'Pauses the run for a human to approve, edit, or reject.' },
  { name: 'Output', purpose: 'Final sink for the result.' },
]

export function QuickstartPage() {
  return (
    <div className="min-h-svh bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quickstart</h1>
        <p className="mt-2 text-muted-foreground">
          From signup to your first observed run, in about five minutes.
        </p>

        <ol className="mt-10 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                {index + 1}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{step.title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Node types</CardTitle>
            <CardDescription>The building blocks available on the canvas.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {NODE_TYPES.map((node) => (
                <li key={node.name} className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 font-mono text-xs text-foreground">{node.name}</span>
                  <span className="text-sm text-muted-foreground">{node.purpose}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-12 flex justify-center">
          <Button size="lg" asChild>
            <Link to="/signup">Create your first workflow</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
