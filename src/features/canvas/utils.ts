import type { AgentFlowNode, AgentFlowNodeType, WorkflowGraph } from '@/features/canvas/types'
import { NODE_TYPE_META } from '@/features/canvas/nodes'

export function createNode(type: AgentFlowNodeType, position: { x: number; y: number }): AgentFlowNode {
  return {
    id: crypto.randomUUID(),
    type,
    position,
    data: {
      label: NODE_TYPE_META[type].label,
      status: 'idle',
      ...(type === 'ToolNode' ? { kind: 'built-in' } : {}),
      ...(type === 'AgentNode' ? { temperature: 0.7 } : {}),
    },
  }
}

export function createStarterGraph(): WorkflowGraph {
  const input = createNode('InputNode', { x: 60, y: 160 })
  const output = createNode('OutputNode', { x: 420, y: 160 })
  return {
    nodes: [input, output],
    edges: [
      {
        id: crypto.randomUUID(),
        source: input.id,
        target: output.id,
      },
    ],
  }
}
