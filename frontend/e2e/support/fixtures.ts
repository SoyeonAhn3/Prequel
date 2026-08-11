import type { Page, Request, Route } from '@playwright/test'

export interface TestProject {
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

export interface TestInterviewResponse {
  session_id: string
  status: string
  current_step: number
  total_steps: number
  step_title: string
  question: string | null
  topics: string[]
  importance: string | null
  example_answers: { label: string; text: string }[]
  insights: { label: string; value: string; is_new: boolean; pending: boolean }[]
  steps: {
    title: string
    status: string
    summary: string | null
    question_index: number | null
    question_total: number | null
  }[]
  messages: { role: string; text: string; time: string | null }[]
  phase: number
  total_phases: number
  phase_label: string
  answer_count: number
}

export interface MockResponse {
  status?: number
  json?: unknown
  body?: string
  contentType?: string
  headers?: Record<string, string>
}

export const TEST_USER = {
  id: 'e2e-user',
  email: 'e2e@example.com',
  display_name: 'E2E User',
  avatar_url: null,
  role: 'user',
  credits_used: 0,
  plan: 'free',
  plan_expires_at: null,
  agreed_terms_at: '2026-07-22T00:00:00Z',
  created_at: '2026-07-22T00:00:00Z',
  updated_at: '2026-07-22T00:00:00Z',
}

export function testProject(overrides: Partial<TestProject> = {}): TestProject {
  return {
    id: 'e2e-project',
    user_id: TEST_USER.id,
    name: 'E2E 프로젝트',
    description: '브라우저 자동화 테스트',
    project_type: 'web_app',
    language: 'ko',
    status: 'in_progress',
    current_step: 0,
    total_steps: 11,
    kickoff_doc: null,
    mermaid_code: null,
    created_at: '2026-07-22T00:00:00Z',
    updated_at: '2026-07-22T00:00:00Z',
    ...overrides,
  }
}

export function interviewResponse(
  overrides: Partial<TestInterviewResponse> = {},
): TestInterviewResponse {
  return {
    session_id: 'e2e-session',
    status: 'active',
    current_step: 0,
    total_steps: 11,
    step_title: '프로젝트 목표',
    question: '이 프로젝트에서 가장 먼저 해결하려는 문제는 무엇인가요?',
    topics: ['목표', '문제'],
    importance: '핵심 목표를 정하기 위해 필요합니다.',
    example_answers: [],
    insights: [],
    steps: [
      {
        title: '프로젝트 목표',
        status: 'active',
        summary: null,
        question_index: 1,
        question_total: 11,
      },
    ],
    messages: [
      {
        role: 'ai',
        text: '이 프로젝트에서 가장 먼저 해결하려는 문제는 무엇인가요?',
        time: '2026-07-22T00:00:00Z',
      },
    ],
    phase: 1,
    total_phases: 3,
    phase_label: '기획 인터뷰',
    answer_count: 0,
    ...overrides,
  }
}

export async function installApiMock(
  page: Page,
  resolver: (request: Request) => MockResponse | null | Promise<MockResponse | null>,
): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    const response = await resolver(route.request())
    if (!response) {
      await route.fulfill({
        status: 501,
        contentType: 'application/json',
        body: JSON.stringify({ detail: `Unhandled E2E API: ${route.request().method()} ${new URL(route.request().url()).pathname}` }),
      })
      return
    }

    await route.fulfill({
      status: response.status ?? 200,
      contentType: response.contentType ?? 'application/json',
      headers: response.headers,
      body: response.body ?? JSON.stringify(response.json ?? null),
    })
  })
}
