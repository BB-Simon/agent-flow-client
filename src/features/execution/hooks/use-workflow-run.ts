import { useCallback, useRef, useState } from 'react'

import { useRunSocket } from '@/features/execution/hooks/use-run-socket'
import { useResumeRun, useRunQuery, useStartRun } from '@/features/execution/hooks/use-run'
import { applyRunEvent } from '@/features/execution/apply-run-event'
import type { NodeRuntimeState, RunEventPayload } from '@/features/execution/types'
import type { AgentFlowEdge, NodeStatus } from '@/features/canvas/types'

const EDGE_ACTIVE_DURATION_MS = 1200

interface UseWorkflowRunOptions {
  workflowId: string
  edges: AgentFlowEdge[]
  onNodeStatusChange: (nodeId: string, status: NodeStatus) => void
}

export function useWorkflowRun({ workflowId, edges, onNodeStatusChange }: UseWorkflowRunOptions) {
  const [runId, setRunId] = useState<string | null>(null)
  const [nodeRuntime, setNodeRuntime] = useState<Record<string, NodeRuntimeState>>({})
  const [activeEdgeIds, setActiveEdgeIds] = useState<Set<string>>(new Set())
  const [socketPendingReview, setSocketPendingReview] = useState<{
    nodeId: string
    input: string
  } | null>(null)

  const edgesRef = useRef(edges)
  edgesRef.current = edges

  const startRunMutation = useStartRun(workflowId)
  const runQuery = useRunQuery(runId)
  const resumeMutation = useResumeRun(runId)

  const activateEdgesTargeting = useCallback((nodeId: string) => {
    const targetEdgeIds = edgesRef.current.filter((e) => e.target === nodeId).map((e) => e.id)
    if (targetEdgeIds.length === 0) return

    setActiveEdgeIds((prev) => new Set([...prev, ...targetEdgeIds]))
    setTimeout(() => {
      setActiveEdgeIds((prev) => {
        const next = new Set(prev)
        targetEdgeIds.forEach((id) => next.delete(id))
        return next
      })
    }, EDGE_ACTIVE_DURATION_MS)
  }, [])

  const handleEvent = useCallback(
    (event: RunEventPayload) => {
      const { nodeId, eventType } = event
      setNodeRuntime((prev) => applyRunEvent(prev, event))

      if (eventType === 'node.started') {
        onNodeStatusChange(nodeId, 'running')
        activateEdgesTargeting(nodeId)
      } else if (eventType === 'node.completed') {
        onNodeStatusChange(nodeId, 'done')
      } else if (eventType === 'node.error') {
        onNodeStatusChange(nodeId, 'error')
      }
    },
    [onNodeStatusChange, activateEdgesTargeting],
  )

  const handleWaitingHuman = useCallback(
    (payload: { nodeId: string; input: string }) => {
      setSocketPendingReview({ nodeId: payload.nodeId, input: payload.input })
      setNodeRuntime((prev) => ({
        ...prev,
        [payload.nodeId]: {
          ...(prev[payload.nodeId] ?? { tokens: '', toolCalls: [] }),
          status: 'waiting_human',
        },
      }))
      onNodeStatusChange(payload.nodeId, 'waiting_human')
    },
    [onNodeStatusChange],
  )

  useRunSocket({ runId, onEvent: handleEvent, onWaitingHuman: handleWaitingHuman })

  const start = useCallback(
    (input?: string) => {
      setNodeRuntime({})
      setActiveEdgeIds(new Set())
      setSocketPendingReview(null)
      startRunMutation.mutate(input, {
        onSuccess: (run) => setRunId(run.id),
      })
    },
    [startRunMutation],
  )

  const run = runQuery.data
  const runStatus = run?.status ?? (startRunMutation.isPending ? 'queued' : null)
  const isActive =
    runStatus === 'queued' || runStatus === 'running' || runStatus === 'waiting_human'

  const pendingReview =
    socketPendingReview ??
    (run?.status === 'waiting_human' && run.pendingReviewNodeId
      ? { nodeId: run.pendingReviewNodeId, input: run.pendingReviewInput ?? '' }
      : null)

  const pendingReviewRef = useRef(pendingReview)
  pendingReviewRef.current = pendingReview

  const resume = useCallback(
    (decision: 'approve' | 'edit' | 'reject', editedContent?: string) => {
      const reviewedNodeId = pendingReviewRef.current?.nodeId
      resumeMutation.mutate(
        { decision, editedContent },
        {
          onSuccess: () => {
            setSocketPendingReview(null)
            if (reviewedNodeId) {
              setNodeRuntime((prev) => ({
                ...prev,
                [reviewedNodeId]: { ...prev[reviewedNodeId], status: 'done' },
              }))
              onNodeStatusChange(reviewedNodeId, 'done')
            }
          },
        },
      )
    },
    [resumeMutation, onNodeStatusChange],
  )

  return {
    runId,
    run,
    runStatus,
    isActive,
    isStarting: startRunMutation.isPending,
    isResuming: resumeMutation.isPending,
    nodeRuntime,
    activeEdgeIds,
    pendingReview,
    start,
    resume,
  }
}
