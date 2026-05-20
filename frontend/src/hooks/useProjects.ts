import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  project_type: string | null
  language: string
  status: string
  current_step: number
  total_steps: number
  kickoff_doc: string | null
  mermaid_code: string | null
  created_at: string
  updated_at: string
}

interface CreateProjectInput {
  name: string
  description?: string
  language: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch<Project[]>('/projects')
      setProjects(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  async function createProject(input: CreateProjectInput): Promise<Project> {
    const project = await apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setProjects((prev) => [project, ...prev])
    return project
  }

  async function deleteProject(id: string): Promise<void> {
    await apiFetch(`/projects/${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return { projects, loading, error, createProject, deleteProject, refetch: fetchProjects }
}
