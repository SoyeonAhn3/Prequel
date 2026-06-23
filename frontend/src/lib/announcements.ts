import { apiFetch } from './api'

export type AnnouncementType = 'notice' | 'patch'

export interface Announcement {
  id: string
  type: AnnouncementType
  title: string
  content: string
  version: string | null
  pinned: boolean
  created_at: string
}

export interface AnnouncementInput {
  type: AnnouncementType
  title: string
  content: string
  version?: string | null
  pinned: boolean
}

export async function listAnnouncements(type?: AnnouncementType): Promise<Announcement[]> {
  const qs = type ? `?type=${type}` : ''
  const res = await apiFetch<{ announcements: Announcement[] }>(`/announcements${qs}`)
  return res.announcements
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  return apiFetch<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteAnnouncement(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/announcements/${id}`, { method: 'DELETE' })
}
