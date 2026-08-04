import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowLeft, Check, History, Loader2, Play, Square } from 'lucide-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCustomToolsQuery,
  useUpdateWorkflow,
  useWorkflowQuery,
} from '@/features/canvas/hooks/use-workflows'
import { nodeTypes } from '@/features/canvas/nodes'
import { edgeTypes } from '@/features/canvas/edges'
import { NodePalette } from '@/features/canvas/components/node-palette'
import { NodeConfigDrawer } from '@/features/canvas/components/node-config-drawer'
import { createNode } from '@/features/canvas/utils'
import { useWorkflowRun } from '@/features/execution/hooks/use-workflow-run'
import { RunPanel } from '@/features/execution/components/run-panel'
import { HumanReviewModal } from '@/features/execution/components/human-review-modal'
import type {
  AgentFlowEdge,
  AgentFlowNode,
  AgentFlowNodeData,
  AgentFlowNodeType,
  NodeStatus,
} from '@/features/canvas/types'

const AUTOSAVE_DELAY_MS = 2000

function stripRuntimeFields(nodes: AgentFlowNode[]): AgentFlowNode[] {
  return nodes.map((node) => {
    const { status: _status, ...rest } = node.data
    return { ...node, data: rest as AgentFlowNodeData }
  })
}

function extractGraphErrors(error: unknown): string[] {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors
    if (Array.isArray(errors)) return errors
    const message = error.response?.data?.message
    if (typeof message === 'string') return [message]
  }
  return ['Something went wrong while saving.']
}

function WorkflowEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: workflow, isLoading } = useWorkflowQuery(id)
  const { data: customTools = [] } = useCustomToolsQuery()
  const updateWorkflow = useUpdateWorkflow(id!)

  const [nodes, setNodes, onNodesChange] = useNodesState<AgentFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<AgentFlowEdge>([])
  const [name, setName] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [runInput, setRunInput] = useState('')
  const [showRunPanel, setShowRunPanel] = useState(false)
  const hydrated = useRef(false)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (workflow && !hydrated.current) {
      setName(workflow.name)
      setNodes(workflow.graphJson.nodes ?? [])
      setEdges(workflow.graphJson.edges ?? [])
      hydrated.current = true
    }
  }, [workflow, setNodes, setEdges])

  const save = useCallback(
    (payload: { name?: string; graphJson?: { nodes: AgentFlowNode[]; edges: AgentFlowEdge[] } }, opts?: { silent?: boolean }) => {
      setSaveState('saving')
      updateWorkflow.mutate(payload, {
        onSuccess: () => {
          setDirty(false)
          setSaveState('saved')
          if (!opts?.silent) toast.success('Workflow saved')
        },
        onError: (error) => {
          setSaveState('error')
          const errors = extractGraphErrors(error)
          if (!opts?.silent) {
            toast.error('Could not save workflow', { description: errors.join(' ') })
          }
        },
      })
    },
    [updateWorkflow],
  )

  // Debounced autosave whenever the graph is dirty.
  useEffect(() => {
    if (!dirty || !hydrated.current) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      save({ graphJson: { nodes: stripRuntimeFields(nodes), edges } }, { silent: true })
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, dirty])

  const markDirty = useCallback(() => setDirty(true), [])

  const handleNodesChange = useCallback<typeof onNodesChange>(
    (changes) => {
      onNodesChange(changes)
      markDirty()
    },
    [onNodesChange, markDirty],
  )

  const handleEdgesChange = useCallback<typeof onEdgesChange>(
    (changes) => {
      onEdgesChange(changes)
      markDirty()
    },
    [onEdgesChange, markDirty],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'animated',
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border)' },
          },
          eds,
        ),
      )
      markDirty()
    },
    [setEdges, markDirty],
  )

  const handleAddNode = useCallback(
    (type: AgentFlowNodeType) => {
      const position = {
        x: 120 + ((nodes.length * 40) % 400),
        y: 120 + ((nodes.length * 60) % 300),
      }
      const node = createNode(type, position)
      setNodes((nds) => [...nds, node])
      markDirty()
    },
    [nodes.length, setNodes, markDirty],
  )

  const handleNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    setSelectedNodeId(node.id)
  }, [])

  const handlePaneClick = useCallback(() => setSelectedNodeId(null), [])

  const handleNodeDataChange = useCallback(
    (nodeId: string, patch: Partial<AgentFlowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)),
      )
      markDirty()
    },
    [setNodes, markDirty],
  )

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      setSelectedNodeId(null)
      markDirty()
    },
    [setNodes, setEdges, markDirty],
  )

  // Transient run status — never marks the graph dirty and is stripped before save.
  const handleNodeStatusChange = useCallback(
    (nodeId: string, status: NodeStatus) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status } } : n)),
      )
    },
    [setNodes],
  )

  const {
    run,
    runStatus,
    isActive,
    isStarting,
    isResuming,
    nodeRuntime,
    activeEdgeIds,
    pendingReview,
    start,
    resume,
  } = useWorkflowRun({ workflowId: id!, edges, onNodeStatusChange: handleNodeStatusChange })

  const renderEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: edge.type ?? 'animated',
        data: { ...edge.data, active: activeEdgeIds.has(edge.id) },
      })),
    [edges, activeEdgeIds],
  )

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )

  const reviewNode = pendingReview
    ? (nodes.find((n) => n.id === pendingReview.nodeId) ?? null)
    : null

  function handleManualSave() {
    save({ name, graphJson: { nodes: stripRuntimeFields(nodes), edges } })
  }

  async function handleRun() {
    if (dirty) {
      try {
        await updateWorkflow.mutateAsync({
          name,
          graphJson: { nodes: stripRuntimeFields(nodes), edges },
        })
        setDirty(false)
        setSaveState('saved')
      } catch (error) {
        toast.error('Could not save before running', {
          description: extractGraphErrors(error).join(' '),
        })
        return
      }
    }

    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })))
    setShowRunPanel(true)
    start(runInput.trim() || undefined)
  }

  if (isLoading || !workflow) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            markDirty()
          }}
          className="h-8 w-64 border-transparent bg-transparent px-2 text-sm font-medium hover:border-border focus-visible:border-input"
        />
        <div className="flex-1" />

        <Input
          value={runInput}
          onChange={(e) => setRunInput(e.target.value)}
          placeholder="Run input (optional)"
          disabled={isActive}
          className="h-8 w-56"
        />
        <SaveIndicator state={saveState} dirty={dirty} />
        <Button size="sm" variant="outline" onClick={() => navigate(`/workflows/${id}/runs`)}>
          <History className="h-3.5 w-3.5" />
          History
        </Button>
        <Button size="sm" variant="outline" onClick={handleManualSave} disabled={updateWorkflow.isPending}>
          Save
        </Button>
        <Button size="sm" onClick={handleRun} disabled={isActive || isStarting}>
          {isActive ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isActive ? 'Running…' : 'Run'}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <NodePalette onAdd={handleAddNode} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <ReactFlow
              nodes={nodes}
              edges={renderEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>

          {showRunPanel ? (
            <RunPanel
              run={run}
              runStatus={runStatus}
              nodeRuntime={nodeRuntime}
              nodes={nodes}
              onClose={() => setShowRunPanel(false)}
            />
          ) : null}
        </div>

        {selectedNode ? (
          <NodeConfigDrawer
            node={selectedNode}
            allNodes={nodes}
            customTools={customTools}
            onChange={handleNodeDataChange}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        ) : null}
      </div>

      {pendingReview ? (
        <HumanReviewModal
          nodeLabel={reviewNode?.data.label ?? pendingReview.nodeId}
          input={pendingReview.input}
          isResuming={isResuming}
          onResume={resume}
        />
      ) : null}
    </div>
  )
}

function SaveIndicator({ state, dirty }: { state: 'idle' | 'saving' | 'saved' | 'error'; dirty: boolean }) {
  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    )
  }
  if (state === 'error') {
    return <span className="text-xs text-destructive">Save failed</span>
  }
  if (!dirty && state === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-success" />
        Saved
      </span>
    )
  }
  if (dirty) {
    return <span className="text-xs text-muted-foreground">Unsaved changes</span>
  }
  return null
}

export function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  )
}
