import { Handle, Position, type NodeProps } from '@xyflow/react'
import { LogIn } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function InputNode({ data, selected }: NodeProps<AgentFlowNode>) {
  return (
    <BaseNode
      icon={<LogIn className="h-3.5 w-3.5" />}
      tint="var(--node-input)"
      typeLabel="Input"
      label={data.label}
      status={data.status}
      selected={selected}
    >
      <Handle type="source" position={Position.Right} className="af-handle" />
    </BaseNode>
  )
}
