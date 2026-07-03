import { apiFetch } from './api'

export interface AdminStats {
  users_total: number
  users_new_7d: number
  projects_active: number
  projects_completed: number
  tokens_total: number
}

export interface AdminUser {
  id: string
  email: string
  display_name: string | null
  role: string
  credits_used: number
  plan: string
  suspended_at: string | null
  deleted_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  actor_id: string | null
  actor_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  detail: Record<string, unknown>
  created_at: string
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats')
}

export async function listAdminUsers(offset = 0, limit = 100): Promise<{ users: AdminUser[]; total: number }> {
  return apiFetch(`/admin/users?offset=${offset}&limit=${limit}`)
}

export async function suspendUser(id: string) {
  return apiFetch(`/admin/users/${id}/suspend`, { method: 'POST' })
}
export async function unsuspendUser(id: string) {
  return apiFetch(`/admin/users/${id}/unsuspend`, { method: 'POST' })
}
export async function deleteUser(id: string) {
  return apiFetch(`/admin/users/${id}/delete`, { method: 'POST' })
}
export async function restoreUser(id: string) {
  return apiFetch(`/admin/users/${id}/restore`, { method: 'POST' })
}

export async function listActivityLogs(limit = 50): Promise<ActivityLog[]> {
  const res = await apiFetch<{ logs: ActivityLog[] }>(`/admin/logs?limit=${limit}`)
  return res.logs
}

export interface TokenUsageDay {
  date: string
  input: number
  output: number
  cache_read: number
  cache_creation: number
  total: number
}

export interface TokenUsageStats {
  days: number
  series: TokenUsageDay[]
  totals: { input: number; output: number; cache_read: number; cache_creation: number; total: number }
  cache_read_pct: number
}

export async function getTokenUsage(days = 14): Promise<TokenUsageStats> {
  return apiFetch<TokenUsageStats>(`/admin/token-usage?days=${days}`)
}
