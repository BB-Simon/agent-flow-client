import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from '@/features/canvas/nodes'
import { edgeTypes } from '@/features/canvas/edges'
import type { AgentFlowEdge, AgentFlowNode } from '@/features/canvas/types'

// A fixed, non-interactive scene built from the same node/edge components the
// product canvas uses — this is what a run actually looks like, not a mockup.
const DEMO_NODES: AgentFlowNode[] = [
  {
    id: 'input',
    type: 'InputNode',
    position: { x: 0, y: 140 },
    data: { label: 'User message', status: 'done' },
  },
  {
    id: 'triage',
    type: 'AgentNode',
    position: { x: 240, y: 140 },
    data: { label: 'Triage agent', status: 'running', model: 'gpt-4o-mini' },
  },
  {
    id: 'router',
    type: 'RouterNode',
    position: { x: 480, y: 140 },
    data: { label: 'Route by intent', status: 'idle', branches: [{ when: 'refund', targetNodeId: 'escalate' }] },
  },
  {
    id: 'support',
    type: 'AgentNode',
    position: { x: 720, y: 40 },
    data: { label: 'Support agent', status: 'done', model: 'gpt-4o-mini' },
  },
  {
    id: 'escalate',
    type: 'HumanReviewNode',
    position: { x: 720, y: 240 },
    data: { label: 'Escalation review', status: 'waiting_human' },
  },
  {
    id: 'output',
    type: 'OutputNode',
    position: { x: 960, y: 140 },
    data: { label: 'Response', status: 'idle' },
  },
]

const DEMO_EDGES: AgentFlowEdge[] = [
  { id: 'e1', source: 'input', target: 'triage', type: 'animated', data: { active: false } },
  { id: 'e2', source: 'triage', target: 'router', type: 'animated', data: { active: true } },
  { id: 'e3', source: 'router', target: 'support', type: 'animated', data: { active: false } },
  { id: 'e4', source: 'router', target: 'escalate', type: 'animated', data: { active: false } },
  { id: 'e5', source: 'support', target: 'output', type: 'animated', data: { active: false } },
  { id: 'e6', source: 'escalate', target: 'output', type: 'animated', data: { active: false } },
]

export function CanvasDemo() {
  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-border bg-panel sm:h-96">
      <ReactFlow
        nodes={DEMO_NODES}
        edges={DEMO_EDGES}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
