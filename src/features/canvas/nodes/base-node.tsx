import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { NodeStatus } from '@/features/canvas/types'

interface BaseNodeProps {
  icon: ReactNode
  tint: string
  typeLabel: string
  label: string
  status?: NodeStatus
  selected?: boolean
  subtitle?: string
  children?: ReactNode
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  waiting_human: 'Waiting on human review',
  done: 'Done',
  error: 'Error',
}

export function BaseNode({
  icon,
  tint,
  typeLabel,
  label,
  status = 'idle',
  selected,
  subtitle,
  children,
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'group relative w-56 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-shadow',
        status === 'error'
          ? 'border-destructive/60'
          : status === 'waiting_human'
            ? 'border-warning/60'
            : selected
              ? 'border-accent/60'
              : 'border-border',
        status === 'running' && 'af-glow-running',
        status === 'waiting_human' && 'af-glow-waiting',
        status === 'error' && 'shadow-[0_0_16px_-2px_rgba(239,68,68,0.4)]',
      )}
      title={STATUS_LABEL[status]}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${tint} 18%, transparent)`, color: tint }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {typeLabel}
          </div>
          <div className="truncate text-sm font-medium text-foreground">{label}</div>
        </div>
        <StatusIndicator status={status} />
      </div>

      {subtitle ? (
        <div className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground">
          {subtitle}
        </div>
      ) : null}

      {children}
    </div>
  )
}

function StatusIndicator({ status }: { status: NodeStatus }) {
  if (status === 'done') {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
  }
  if (status === 'error') {
    return <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
  }
  if (status === 'waiting_human') {
    return <Clock className="h-4 w-4 shrink-0 text-warning" />
  }
  if (status === 'running') {
    return <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
  }
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
}
