import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'

import type { AgentFlowEdge } from '@/features/canvas/types'

export function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<AgentFlowEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  const active = Boolean((data as { active?: boolean } | undefined)?.active)

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        className={active ? 'af-edge-active' : undefined}
      />
      {active ? (
        <circle r={4} className="af-edge-dot">
          <animateMotion dur="1.1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      ) : null}
    </>
  )
}
