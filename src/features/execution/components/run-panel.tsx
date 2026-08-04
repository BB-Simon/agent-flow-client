import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { NODE_TYPE_META } from '@/features/canvas/nodes'
import type { AgentFlowNode } from '@/features/canvas/types'
import type { Run } from '@/features/execution/api/execution-api'
import type { NodeRuntimeState, RunStatus } from '@/features/execution/types'

interface RunPanelProps {
  run: Run | undefined
  runStatus: RunStatus | null
  nodeRuntime: Record<string, NodeRuntimeState>
  nodes: AgentFlowNode[]
  onClose: () => void
}

const STATUS_STYLES: Record<RunStatus, string> = {
  queued: 'bg-muted text-muted-foreground',
  running: 'bg-accent/15 text-accent',
  waiting_human: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  failed: 'bg-destructive/15 text-destructive',
}

const STATUS_TEXT: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  waiting_human: 'Waiting on review',
  completed: 'Completed',
  failed: 'Failed',
}

export function RunPanel({ run, runStatus, nodeRuntime, nodes, onClose }: RunPanelProps) {
  const nodesById = new Map(nodes.map((n) => [n.id, n]))
  const entries = Object.entries(nodeRuntime)

  return (
    <div className="flex h-64 shrink-0 flex-col border-t border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        {runStatus ? (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_STYLES[runStatus],
            )}
          >
            {STATUS_TEXT[runStatus]}
          </span>
        ) : null}
        {run?.durationMs != null ? (
          <span className="text-xs text-muted-foreground">{(run.durationMs / 1000).toFixed(1)}s</span>
        ) : null}
        {run?.tokenUsage?.totalTokens ? (
          <span className="font-mono text-xs text-muted-foreground">
            {run.tokenUsage.totalTokens} tokens
          </span>
        ) : null}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Waiting for the run to start…</p>
        ) : (
          entries.map(([nodeId, state]) => {
            const node = nodesById.get(nodeId)
            const meta = node ? NODE_TYPE_META[node.type as keyof typeof NODE_TYPE_META] : null
            const Icon = meta?.icon

            return (
              <div key={nodeId} className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {Icon && meta ? (
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${meta.tint} 18%, transparent)`,
                        color: meta.tint,
                      }}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  ) : null}
                  <span className="text-sm font-medium text-foreground">
                    {node?.data.label ?? nodeId}
                  </span>
                  <span
                    className={cn(
                      'ml-auto text-xs',
                      state.status === 'running' && 'text-accent',
                      state.status === 'waiting_human' && 'text-warning',
                      state.status === 'done' && 'text-success',
                      state.status === 'error' && 'text-destructive',
                    )}
                  >
                    {state.status}
                  </span>
                </div>

                {state.tokens ? (
                  <pre className="mt-1.5 max-h-24 overflow-y-auto whitespace-pre-wrap rounded-md bg-panel p-2 font-mono text-xs text-foreground">
                    {state.tokens}
                  </pre>
                ) : null}

                {state.toolCalls.map((call, i) => (
                  <div
                    key={i}
                    className="mt-1.5 rounded-md border border-border bg-panel p-2 font-mono text-xs"
                  >
                    <div className="text-muted-foreground">
                      {call.toolName}({JSON.stringify(call.arguments)})
                    </div>
                    {call.result ? (
                      <div className="mt-1 text-foreground">{call.result}</div>
                    ) : null}
                    {call.error ? (
                      <div className="mt-1 text-destructive">{call.error}</div>
                    ) : null}
                  </div>
                ))}

                {state.status === 'error' && state.errorMessage ? (
                  <p className="mt-1.5 text-xs text-destructive">{state.errorMessage}</p>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
