import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Bot } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function AgentNode({ data, selected }: NodeProps<AgentFlowNode>) {
  return (
    <BaseNode
      icon={<Bot className="h-3.5 w-3.5" />}
      tint="var(--node-agent)"
      typeLabel="Agent"
      label={data.label}
      status={data.status}
      selected={selected}
      subtitle={data.model || 'No model configured'}
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
      <Handle type="source" position={Position.Right} className="af-handle" />
    </BaseNode>
  )
}
