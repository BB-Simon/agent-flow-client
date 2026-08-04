import { apiClient } from '@/lib/api/client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  metadata: unknown
  readAt: string | null
  createdAt: string
}

export interface NotificationsPage {
  notifications: Notification[]
  total: number
  unreadCount: number
  limit: number
  offset: number
}

export async function listNotifications(params: { limit?: number; unreadOnly?: boolean } = {}) {
  const { data } = await apiClient.get<NotificationsPage>('/notifications', { params })
  return data
}

export async function markNotificationRead(id: string) {
  await apiClient.post(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead() {
  await apiClient.post('/notifications/read-all')
}
