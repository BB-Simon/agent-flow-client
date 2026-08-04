import { io, type Socket } from 'socket.io-client'

import { API_BASE_URL } from '@/lib/api/client'

let socket: Socket | null = null

/** One shared connection for the whole app; created lazily on first use. */
export function getSocket(): Socket {
  socket ??= io(API_BASE_URL, {
    withCredentials: true,
    autoConnect: true,
  })
  return socket
}
