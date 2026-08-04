import { Handle, Position, type NodeProps } from '@xyflow/react'
import { LogOut } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function OutputNode({ data, selected }: NodeProps<AgentFlowNode>) {
  return (
    <BaseNode
      icon={<LogOut className="h-3.5 w-3.5" />}
      tint="var(--node-output)"
      typeLabel="Output"
      label={data.label}
      status={data.status}
      selected={selected}
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
    </BaseNode>
  )
}
