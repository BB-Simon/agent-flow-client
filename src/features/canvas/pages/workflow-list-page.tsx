import { useNavigate } from 'react-router-dom'
import { Plus, Workflow as WorkflowIcon } from 'lucide-react'

import { AppHeader } from '@/components/app-header'
import { useCreateWorkflow, useWorkflowsQuery } from '@/features/canvas/hooks/use-workflows'
import { createStarterGraph } from '@/features/canvas/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkflowListPage() {
  const navigate = useNavigate()
  const { data: workflows, isLoading } = useWorkflowsQuery()
  const createWorkflow = useCreateWorkflow()

  function handleCreate() {
    createWorkflow.mutate(
      { name: 'Untitled workflow', graphJson: createStarterGraph() },
      { onSuccess: (workflow) => navigate(`/workflows/${workflow.id}`) },
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Workflows</h1>
          <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
            <Plus className="h-4 w-4" />
            New workflow
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : workflows && workflows.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer transition-colors hover:border-accent/50"
                onClick={() => navigate(`/workflows/${workflow.id}`)}
              >
                <CardHeader>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <WorkflowIcon className="h-4 w-4" />
                  </div>
                  <CardTitle className="mt-2">{workflow.name}</CardTitle>
                  <CardDescription>
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <WorkflowIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No workflows yet. Create your first one to start building.
              </p>
              <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
                <Plus className="h-4 w-4" />
                New workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
