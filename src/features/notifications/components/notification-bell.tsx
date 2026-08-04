import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  UserCheck,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/features/notifications/hooks/use-notifications'
import type { Notification } from '@/features/notifications/api/notifications-api'

const TYPE_ICON: Record<string, { icon: typeof Bell; className: string }> = {
  'run.completed': { icon: CheckCircle2, className: 'text-success' },
  'run.failed': { icon: AlertCircle, className: 'text-destructive' },
  'human_review.needed': { icon: UserCheck, className: 'text-warning' },
  'payment.failed': { icon: CreditCard, className: 'text-destructive' },
}

function relativeTime(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(deltaMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useNotificationsQuery()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const unreadCount = data?.unreadCount ?? 0

  function handleNotificationClick(notification: Notification) {
    if (!notification.readAt) markRead.mutate(notification.id)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-medium leading-none text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">Notifications</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!data || data.notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.notifications.map((notification) => {
                  const meta = TYPE_ICON[notification.type] ?? { icon: Bell, className: 'text-muted-foreground' }
                  const Icon = meta.icon
                  const unread = !notification.readAt

                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          unread && 'bg-accent/5',
                        )}
                      >
                        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.className)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{notification.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {relativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {unread ? (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
