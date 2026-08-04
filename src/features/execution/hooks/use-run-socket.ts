import { useEffect } from 'react'

import { getSocket } from '@/lib/socket/socket-client'
import type { RunEventPayload } from '@/features/execution/types'

interface UseRunSocketOptions {
  runId: string | null
  onEvent: (event: RunEventPayload) => void
  onWaitingHuman: (payload: { nodeId: string; input: string }) => void
}

/** Joins the `run:{runId}` room for the lifetime of a non-null runId and
 * tears down the subscription (but not the shared socket) on change/unmount. */
export function useRunSocket({ runId, onEvent, onWaitingHuman }: UseRunSocketOptions) {
  useEffect(() => {
    if (!runId) return

    const socket = getSocket()
    const handleEvent = (payload: RunEventPayload) => onEvent(payload)
    const handleWaitingHuman = (payload: { runId: string; nodeId: string; input: string }) =>
      onWaitingHuman(payload)

    socket.on('run.event', handleEvent)
    socket.on('run.waiting_human', handleWaitingHuman)
    socket.emit('subscribe', { runId })

    return () => {
      socket.emit('unsubscribe', { runId })
      socket.off('run.event', handleEvent)
      socket.off('run.waiting_human', handleWaitingHuman)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])
}
