import { apiClient } from '@/lib/api/client'

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface TeamMember {
  id: string
  email: string
  role: Role
  emailVerified: boolean
  createdAt: string
}

export async function listMembers() {
  const { data } = await apiClient.get<TeamMember[]>('/team/members')
  return data
}

export async function inviteMember(payload: { email: string; role?: Role }) {
  const { data } = await apiClient.post<{ success: boolean }>('/team/invites', payload)
  return data
}

export async function changeMemberRole(userId: string, role: Role) {
  const { data } = await apiClient.patch<TeamMember>(`/team/members/${userId}/role`, { role })
  return data
}

export async function removeMember(userId: string) {
  await apiClient.delete(`/team/members/${userId}`)
}
