import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, PlayCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useWorkflowQuery } from '@/features/canvas/hooks/use-workflows'
import { useRunsQuery } from '@/features/execution/hooks/use-run'
import { runExportUrl } from '@/features/execution/api/execution-api'
import type { RunStatus } from '@/features/execution/types'

const PAGE_SIZE = 20

const STATUS_STYLES: Record<RunStatus, string> = {
  queued: 'bg-muted text-muted-foreground',
  running: 'bg-accent/15 text-accent',
  waiting_human: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  failed: 'bg-destructive/15 text-destructive',
}

export function RunHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: workflow } = useWorkflowQuery(id)
  const [offset, setOffset] = useState(0)
  const { data, isLoading } = useRunsQuery(id!, { limit: PAGE_SIZE, offset })

  return (
    <div className="min-h-svh bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/workflows/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm font-medium text-foreground">{workflow?.name ?? 'Workflow'}</p>
          <p className="text-xs text-muted-foreground">Run history</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No runs yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-panel text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Started</th>
                  <th className="px-4 py-2 font-medium">Duration</th>
                  <th className="px-4 py-2 font-medium">Tokens</th>
                  <th className="px-4 py-2 font-medium">Input</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.runs.map((run) => (
                  <tr key={run.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS_STYLES[run.status],
                        )}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {run.durationMs != null ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {run.tokenUsage.totalTokens}
                    </td>
                    <td className="max-w-48 truncate px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {run.input || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/workflows/${id}/runs/${run.id}`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="View replay"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Link>
                        <a
                          href={runExportUrl(run.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Export as JSON"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > PAGE_SIZE ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {offset + 1}–{Math.min(offset + PAGE_SIZE, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= data.total}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
