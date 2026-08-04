import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowLeft, Loader2, Pause, Play, SkipBack, SkipForward } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWorkflowQuery } from '@/features/canvas/hooks/use-workflows'
import { nodeTypes } from '@/features/canvas/nodes'
import { edgeTypes } from '@/features/canvas/edges'
import type { AgentFlowNode, NodeStatus } from '@/features/canvas/types'
import { useRunQuery } from '@/features/execution/hooks/use-run'
import { applyRunEvent } from '@/features/execution/apply-run-event'
import { RunPanel } from '@/features/execution/components/run-panel'
import type { NodeRuntimeState } from '@/features/execution/types'

const MIN_STEP_MS = 40
const MAX_STEP_MS = 1500

function RunReplay() {
  const { id, runId } = useParams<{ id: string; runId: string }>()
  const navigate = useNavigate()
  const { data: workflow, isLoading: isWorkflowLoading } = useWorkflowQuery(id)
  const { data: run, isLoading: isRunLoading } = useRunQuery(runId ?? null)

  const [cursor, setCursor] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPanel, setShowPanel] = useState(true)

  const events = useMemo(() => run?.events ?? [], [run])

  // Reset the scrub position whenever a different run's events load.
  useEffect(() => {
    setCursor(0)
    setIsPlaying(false)
  }, [runId])

  // Auto-advance using the real gap between consecutive events (clamped) so
  // playback speed roughly tracks how the original run actually paced.
  useEffect(() => {
    if (!isPlaying) return
    if (cursor >= events.length) {
      setIsPlaying(false)
      return
    }
    const prevTs = cursor === 0 ? events[0]?.timestamp : events[cursor - 1].timestamp
    const nextTs = events[cursor].timestamp
    const rawDelta = prevTs ? new Date(nextTs).getTime() - new Date(prevTs).getTime() : MIN_STEP_MS
    const delay = Math.min(Math.max(rawDelta, MIN_STEP_MS), MAX_STEP_MS)

    const timer = setTimeout(() => setCursor((c) => c + 1), delay)
    return () => clearTimeout(timer)
  }, [isPlaying, cursor, events])

  const nodeRuntime = useMemo(() => {
    let state: Record<string, NodeRuntimeState> = {}
    for (const event of events.slice(0, cursor)) {
      state = applyRunEvent(state, {
        nodeId: event.nodeId,
        eventType: event.eventType,
        payload: (event.payload ?? {}) as Record<string, unknown>,
      })
    }
    return state
  }, [events, cursor])

  const lastEvent = cursor > 0 ? events[cursor - 1] : null

  const nodes: AgentFlowNode[] = useMemo(() => {
    const graphNodes = workflow?.graphJson.nodes ?? []
    return graphNodes.map((n) => ({
      ...n,
      draggable: false,
      connectable: false,
      data: { ...n.data, status: (nodeRuntime[n.id]?.status ?? 'idle') as NodeStatus },
    }))
  }, [workflow, nodeRuntime])

  const edges = useMemo(() => {
    const graphEdges = workflow?.graphJson.edges ?? []
    const activeTarget = lastEvent?.eventType === 'node.started' ? lastEvent.nodeId : null
    return graphEdges.map((e) => ({
      ...e,
      type: e.type ?? 'animated',
      data: { ...e.data, active: activeTarget != null && e.target === activeTarget },
    }))
  }, [workflow, lastEvent])

  if (isWorkflowLoading || isRunLoading || !workflow || !run) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/workflows/${id}/runs`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm font-medium text-foreground">{workflow.name}</p>
          <p className="text-xs text-muted-foreground">Replaying run {run.id.slice(0, 8)}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3">
          <Button variant="outline" size="icon" onClick={() => setCursor(0)} disabled={cursor === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={events.length === 0}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(events.length)}
            disabled={cursor >= events.length}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <input
            type="range"
            min={0}
            max={events.length}
            value={cursor}
            onChange={(e) => {
              setIsPlaying(false)
              setCursor(Number(e.target.value))
            }}
            className="mx-2 h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-accent"
          />

          <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
            {cursor} / {events.length}
          </span>
          {lastEvent ? (
            <span className="w-40 shrink-0 truncate font-mono text-xs text-muted-foreground">
              {lastEvent.eventType}
            </span>
          ) : null}
        </div>

        {showPanel ? (
          <RunPanel
            run={run}
            runStatus={run.status}
            nodeRuntime={nodeRuntime}
            nodes={nodes}
            onClose={() => setShowPanel(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            className="border-t border-border bg-card px-4 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            Show run panel
          </button>
        )}
      </div>
    </div>
  )
}

export function RunReplayPage() {
  return (
    <ReactFlowProvider>
      <RunReplay />
    </ReactFlowProvider>
  )
}
