import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface UsageMeterProps {
  label: string
  used: number
  limit: number | null
  unit: string
}

const WARNING_RATIO = 0.7
const CRITICAL_RATIO = 0.9

export function UsageMeter({ label, used, limit, unit }: UsageMeterProps) {
  const unlimited = limit === null
  const ratio = unlimited ? 0 : limit === 0 ? 1 : used / limit
  const percent = Math.min(100, Math.round(ratio * 100))
  const isCritical = !unlimited && ratio >= CRITICAL_RATIO
  const isWarning = !unlimited && !isCritical && ratio >= WARNING_RATIO

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span
          className={cn(
            'flex items-center gap-1 font-mono text-xs',
            isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground',
          )}
        >
          {isCritical || isWarning ? <AlertTriangle className="h-3 w-3" /> : null}
          {used.toLocaleString()} {unlimited ? `${unit} used` : `/ ${limit.toLocaleString()} ${unit}`}
        </span>
      </div>
      {unlimited ? (
        <div className="h-1.5 rounded-full bg-muted" />
      ) : (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              isCritical ? 'bg-destructive' : isWarning ? 'bg-warning' : 'bg-primary',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
