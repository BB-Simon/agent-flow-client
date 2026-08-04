import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Wrench } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function ToolNode({ data, selected }: NodeProps<AgentFlowNode>) {
  const subtitle =
    data.kind === 'built-in'
      ? (data.builtInTool ?? 'No tool selected')
      : data.kind === 'custom'
        ? (data.customToolId ? 'Custom tool' : 'No custom tool selected')
        : 'Not configured'

  return (
    <BaseNode
      icon={<Wrench className="h-3.5 w-3.5" />}
      tint="var(--node-tool)"
      typeLabel="Tool"
      label={data.label}
      status={data.status}
      selected={selected}
      subtitle={subtitle}
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
    </BaseNode>
  )
}
