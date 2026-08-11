import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { loadEnv } from 'vite'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(frontendDir, '../..')
const env = loadEnv('development', repoRoot, '')
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY
const authStorageKey = supabaseUrl
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : ''

type ProjectStatus = 'in_progress' | 'designing' | 'evaluating' | 'completed'

interface BillingSnapshot {
  credits_used: number
  project_status: ProjectStatus
  interview_charged: boolean
  design_charged: boolean
  interview_sessions: number
  design_sessions: number
  finalize_sessions: number
  token_usage: number
}

function requireValue(value: string, label: string): string {
  if (!value) throw new Error(`${label} is required for real Supabase E2E`)
  return value
}

function assertNoError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`)
}

class RealSupabaseHarness {
  readonly admin: SupabaseClient
  readonly anon: SupabaseClient
  readonly email = `prequel-e2e-${randomUUID()}@example.com`
  readonly password = `Pq!${randomUUID()}aA9`
  readonly projectIds: string[] = []
  userId = ''
  session: Session | null = null

  constructor() {
    this.admin = createClient(
      requireValue(supabaseUrl, 'SUPABASE_URL'),
      requireValue(supabaseServiceKey, 'SUPABASE_SERVICE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    this.anon = createClient(
      requireValue(supabaseUrl, 'SUPABASE_URL'),
      requireValue(supabaseAnonKey, 'SUPABASE_ANON_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
  }

  async createUser(creditsUsed: number): Promise<void> {
    const auth = await this.admin.auth.admin.createUser({
      email: this.email,
      password: this.password,
      email_confirm: true,
      user_metadata: { full_name: 'Prequel Supabase E2E' },
    })
    assertNoError(auth.error, 'create disposable auth user')
    if (!auth.data.user) throw new Error('Supabase returned no disposable auth user')
    this.userId = auth.data.user.id

    const profile = await this.admin
      .from('users')
      .update({
        credits_used: creditsUsed,
        role: 'user',
        plan: 'free',
        agreed_terms_at: new Date().toISOString(),
      })
      .eq('id', this.userId)
      .select('id')
      .single()
    assertNoError(profile.error, 'prepare disposable public user')

    const login = await this.anon.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    })
    assertNoError(login.error, 'sign in disposable auth user')
    if (!login.data.session) throw new Error('Supabase returned no disposable session')
    this.session = login.data.session
  }

  async installBrowserAuth(page: Page): Promise<void> {
    if (!this.session) throw new Error('Disposable user must be signed in first')
    await page.addInitScript(
      ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
      { key: authStorageKey, session: this.session },
    )
  }

  async createProject(name: string, interviewCharged = false): Promise<string> {
    const projectId = randomUUID()
    const created = await this.admin.from('projects').insert({
      id: projectId,
      user_id: this.userId,
      name,
      description: 'Disposable real-Supabase billing E2E fixture',
      project_type: 'web_app',
      language: 'ko',
      status: 'in_progress',
      current_step: 0,
      total_steps: 11,
      interview_credit_charged_at: interviewCharged ? new Date().toISOString() : null,
    }).select('id').single()
    assertNoError(created.error, 'create disposable project')
    this.projectIds.push(projectId)
    return projectId
  }

  async completeInterview(projectId: string): Promise<void> {
    const completed = await this.admin.from('interview_sessions').insert({
      project_id: projectId,
      step: 'planning',
      status: 'completed',
      current_question: 11,
      messages: [
        { role: 'user', content: '실제 Supabase 단계별 과금 정책을 검증합니다.' },
        { role: 'assistant', content: '인터뷰 기반 문서 fixture가 준비되었습니다.' },
      ],
      _insights: [
        { label: '핵심 목표', value: '실제 Supabase 단계별 과금 검증', step: 0 },
        { label: '대상 사용자', value: 'Prequel 무료 플랜 사용자', step: 0 },
      ],
      token_used: 0,
      completed_at: new Date().toISOString(),
    }).select('id').single()
    assertNoError(completed.error, 'seed completed interview')
  }

  async completeDesign(projectId: string): Promise<void> {
    const completed = await this.admin.from('design_sessions').insert({
      project_id: projectId,
      current_step: 'ai-workflow',
      requirements: [{
        id: 'req-real-e2e',
        category: 'billing',
        text: '단계별 크레딧을 정확히 한 번 차감한다',
        priority: 'must',
        acceptance_criteria: '인터뷰 1회, 설계·평가 1회',
        status: 'accepted',
      }],
      architecture: {
        components: [{ name: 'Prequel API', technology: 'FastAPI', description: '과금 RPC 호출' }],
        tech_stack: { backend: 'FastAPI', database: 'Supabase' },
        mermaid_code: '',
        integration_notes: 'service_role 백엔드만 과금 RPC를 호출한다.',
      },
      data_model: {
        entities: [{ name: 'Project', description: '과금 도장 보관', fields: [] }],
        mermaid_code: '',
        relationships: [],
      },
      ai_workflow: {
        summary: '이 테스트에서는 외부 AI를 호출하지 않는다.',
        model: 'Claude',
        model_version: 'sonnet',
        task: '과금 외 단계는 fixture 사용',
        inputs: [],
        outputs: [],
        fallbacks: [],
        monitoring: [],
      },
      status: 'completed',
    }).select('id').single()
    assertNoError(completed.error, 'seed completed design')
  }

  async snapshot(projectId: string): Promise<BillingSnapshot> {
    const [user, project, interviews, designs, finalizes, tokens] = await Promise.all([
      this.admin.from('users').select('credits_used').eq('id', this.userId).single(),
      this.admin.from('projects')
        .select('status, interview_credit_charged_at, credit_charged_at')
        .eq('id', projectId)
        .single(),
      this.admin.from('interview_sessions').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.admin.from('design_sessions').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.admin.from('finalize_sessions').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.admin.from('token_usage').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
    ])
    assertNoError(user.error, 'read user snapshot')
    assertNoError(project.error, 'read project snapshot')
    assertNoError(interviews.error, 'count interview sessions')
    assertNoError(designs.error, 'count design sessions')
    assertNoError(finalizes.error, 'count finalize sessions')
    assertNoError(tokens.error, 'count token usage')

    return {
      credits_used: user.data.credits_used as number,
      project_status: project.data.status as ProjectStatus,
      interview_charged: Boolean(project.data.interview_credit_charged_at),
      design_charged: Boolean(project.data.credit_charged_at),
      interview_sessions: interviews.count ?? 0,
      design_sessions: designs.count ?? 0,
      finalize_sessions: finalizes.count ?? 0,
      token_usage: tokens.count ?? 0,
    }
  }

  async cleanup(): Promise<Record<string, number>> {
    const ids = [...this.projectIds]
    if (ids.length > 0) {
      await this.admin.from('activity_logs').delete().in('target_id', ids)
      await this.admin.from('token_usage').delete().in('project_id', ids)
      await this.admin.from('finalize_sessions').delete().in('project_id', ids)
      await this.admin.from('design_sessions').delete().in('project_id', ids)
      await this.admin.from('interview_sessions').delete().in('project_id', ids)
      await this.admin.from('projects').delete().in('id', ids)
    }
    if (this.userId) {
      await this.admin.from('activity_logs').delete().eq('actor_id', this.userId)
      await this.admin.from('payments').delete().eq('user_id', this.userId)
      await this.admin.from('users').delete().eq('id', this.userId)
      const deletedAuth = await this.admin.auth.admin.deleteUser(this.userId)
      assertNoError(deletedAuth.error, 'delete disposable auth user')
    }

    const counts: Record<string, number> = {}
    const projectTables = ['projects', 'interview_sessions', 'design_sessions', 'finalize_sessions', 'token_usage'] as const
    for (const table of projectTables) {
      if (ids.length === 0) {
        counts[table] = 0
        continue
      }
      const column = table === 'projects' ? 'id' : 'project_id'
      const result = await this.admin.from(table).select('*', { count: 'exact', head: true }).in(column, ids)
      assertNoError(result.error, `verify ${table} cleanup`)
      counts[table] = result.count ?? 0
    }
    if (this.userId) {
      const user = await this.admin.from('users').select('*', { count: 'exact', head: true }).eq('id', this.userId)
      assertNoError(user.error, 'verify public user cleanup')
      counts.users = user.count ?? 0
      const authUser = await this.admin.auth.admin.getUserById(this.userId)
      counts.auth_users = authUser.data.user ? 1 : 0
    } else {
      counts.users = 0
      counts.auth_users = 0
    }
    return counts
  }
}

async function attachJson(testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await testInfo.attach(name, {
    body: Buffer.from(JSON.stringify(value, null, 2)),
    contentType: 'application/json',
  })
}

async function withHarness(
  testInfo: TestInfo,
  page: Page,
  creditsUsed: number,
  run: (harness: RealSupabaseHarness) => Promise<void>,
): Promise<void> {
  const harness = new RealSupabaseHarness()
  try {
    await harness.createUser(creditsUsed)
    await run(harness)
  } finally {
    // Stop React StrictMode effects and in-flight API calls before deleting the
    // rows they may still be reading. This keeps teardown from creating false
    // 401/500 server noise while preserving exact zero-row verification.
    if (!page.isClosed()) await page.close()
    const cleanup = await harness.cleanup()
    await attachJson(testInfo, 'supabase-cleanup.json', cleanup)
    expect(Object.values(cleanup).every((count) => count === 0)).toBe(true)
  }
}

test.describe.configure({ mode: 'serial' })

test('TC-012: exhausted free credits reject a real interview start before AI work', async ({ page }, testInfo) => {
  await withHarness(testInfo, page, 2, async (harness) => {
    const projectId = await harness.createProject('TC-012 실제 한도 거부')
    const reentryProjectId = await harness.createProject('TC-012 기존 차감 재접속', true)
    await harness.completeInterview(reentryProjectId)
    await harness.installBrowserAuth(page)

    await page.goto('/projects')
    await expect(page.getByText('무료 횟수를 모두 사용했어요')).toBeVisible()
    await expect(page.getByRole('button', { name: '새 프로젝트' })).toBeDisabled()

    const before = await harness.snapshot(projectId)
    const startResponsePromise = page.waitForResponse((response) => (
      response.request().method() === 'POST'
      && new URL(response.url()).pathname === '/api/interview/start'
    ))
    await page.goto(`/projects/${projectId}/interview`)
    const startResponse = await startResponsePromise
    const errorBody = await startResponse.json() as { detail: string }

    expect(startResponse.status()).toBe(403)
    expect(errorBody.detail).toBe('사용 횟수(2회)를 모두 소진했습니다. 유료 플랜으로 업그레이드하세요.')
    await expect(page.getByText(errorBody.detail)).toBeVisible()

    const after = await harness.snapshot(projectId)
    expect(after).toEqual(before)
    expect(after).toMatchObject({
      credits_used: 2,
      interview_charged: false,
      interview_sessions: 0,
      token_usage: 0,
    })

    await page.goto(`/projects/${reentryProjectId}/interview`)
    await expect(page.getByRole('heading', { name: '인터뷰가 완료되었습니다' })).toBeVisible()
    const reentry = await harness.snapshot(reentryProjectId)
    expect(reentry).toMatchObject({
      credits_used: 2,
      project_status: 'in_progress',
      interview_charged: true,
      design_charged: false,
      interview_sessions: 1,
      token_usage: 0,
    })
    await attachJson(testInfo, 'TC-012-billing-snapshots.json', {
      before,
      after,
      charged_project_reentry: reentry,
      http_status: 403,
    })
  })
})

test('TC-007/017: completed interview can skip design with no charge and download Markdown', async ({ page }, testInfo) => {
  await withHarness(testInfo, page, 1, async (harness) => {
    const projectName = 'TC-017 실제 패스 문서'
    const projectId = await harness.createProject(projectName, true)
    await harness.completeInterview(projectId)
    await harness.installBrowserAuth(page)
    const exportTraffic: {
      requests: { method: string; resource_type: string; authenticated: boolean; navigation: boolean }[]
      responses: number[]
    } = { requests: [], responses: [] }
    page.on('request', (request) => {
      if (new URL(request.url()).pathname !== `/api/projects/${projectId}/export/markdown`) return
      exportTraffic.requests.push({
        method: request.method(),
        resource_type: request.resourceType(),
        authenticated: Boolean(request.headers().authorization),
        navigation: request.isNavigationRequest(),
      })
    })
    page.on('response', (response) => {
      if (new URL(response.url()).pathname === `/api/projects/${projectId}/export/markdown`) {
        exportTraffic.responses.push(response.status())
      }
    })

    await page.goto(`/projects/${projectId}/interview`)
    await expect(page.getByRole('heading', { name: '인터뷰가 완료되었습니다' })).toBeVisible()
    await expect(page.getByText('설계·평가 세트 · 크레딧 1회')).toBeVisible()
    await expect(page.getByText('추가 크레딧 없음')).toBeVisible()

    const before = await harness.snapshot(projectId)
    await page.getByRole('button', { name: '나중에 결정하기' }).click()
    await expect(page).toHaveURL(/\/projects$/)
    expect(await harness.snapshot(projectId)).toEqual(before)
    await page.getByText(projectName, { exact: true }).click()
    await expect(page.getByRole('heading', { name: '인터뷰가 완료되었습니다' })).toBeVisible()

    const decisionResponsePromise = page.waitForResponse((response) => (
      response.request().method() === 'POST'
      && new URL(response.url()).pathname === `/api/projects/${projectId}/design-decision`
    ))
    await page.getByRole('button', { name: /건너뛰기/ }).click()
    const decisionResponse = await decisionResponsePromise
    expect(decisionResponse.status()).toBe(200)
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/document$`))
    await expect(page.getByText('실제 Supabase 단계별 과금 검증')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Markdown' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`${projectName}_kickoff.md`)
    const stream = await download.createReadStream()
    let markdown = ''
    for await (const chunk of stream) markdown += chunk.toString()
    expect(markdown).toContain(`# ${projectName}`)
    expect(markdown).toContain('실제 Supabase 단계별 과금 검증')

    const afterSkip = await harness.snapshot(projectId)
    expect(afterSkip).toMatchObject({
      credits_used: 1,
      project_status: 'completed',
      interview_charged: true,
      design_charged: false,
      interview_sessions: 1,
      token_usage: 0,
    })

    const duplicateResponse = await page.evaluate(async ({ id, accessToken }) => {
      const response = await fetch(`/api/projects/${id}/design-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ decision: 'skip' }),
      })
      return response.status
    }, { id: projectId, accessToken: harness.session!.access_token })
    expect(duplicateResponse).toBe(200)

    await page.goto('/projects')
    await page.getByText(projectName, { exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/document$`))

    const afterReentry = await harness.snapshot(projectId)
    expect(afterReentry).toEqual(afterSkip)
    await attachJson(testInfo, 'TC-007-017-billing-snapshots.json', {
      before,
      after_skip: afterSkip,
      after_duplicate_and_reentry: afterReentry,
      decision_http_status: decisionResponse.status(),
      markdown_filename: download.suggestedFilename(),
      export_traffic: exportTraffic,
    })
  })
})

test('TC-018 billing: design charges once; refresh and evaluation entry do not charge again', async ({ page }, testInfo) => {
  await withHarness(testInfo, page, 1, async (harness) => {
    const projectId = await harness.createProject('TC-018 실제 설계 과금', true)
    await harness.completeInterview(projectId)
    await harness.installBrowserAuth(page)

    await page.goto(`/projects/${projectId}/interview`)
    const before = await harness.snapshot(projectId)
    const decisionResponsePromise = page.waitForResponse((response) => (
      response.request().method() === 'POST'
      && new URL(response.url()).pathname === `/api/projects/${projectId}/design-decision`
    ))
    await page.getByRole('button', { name: /설계 진행/ }).click()
    const decisionResponse = await decisionResponsePromise
    expect(decisionResponse.status()).toBe(200)
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/design$`))
    await expect(page.getByText('이제 설계 단계를 시작할게요')).toBeVisible()

    const afterDesignEntry = await harness.snapshot(projectId)
    expect(afterDesignEntry).toMatchObject({
      credits_used: 2,
      project_status: 'designing',
      interview_charged: true,
      design_charged: true,
      token_usage: 0,
    })

    await page.reload()
    await expect(page.getByText('이제 설계 단계를 시작할게요')).toBeVisible()
    const afterRefresh = await harness.snapshot(projectId)
    expect(afterRefresh).toEqual(afterDesignEntry)

    const duplicateDecision = await page.evaluate(async ({ id, accessToken }) => {
      const response = await fetch(`/api/projects/${id}/design-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ decision: 'design' }),
      })
      return response.status
    }, { id: projectId, accessToken: harness.session!.access_token })
    expect(duplicateDecision).toBe(200)
    expect(await harness.snapshot(projectId)).toEqual(afterDesignEntry)

    await harness.completeDesign(projectId)
    await page.reload()
    await expect(page.getByRole('heading', { name: '설계 단계 완료!' })).toBeVisible()

    // FinalizePage auto-generates its first AI step when no session exists.
    // TC-018 here covers Supabase billing only, so prevent that unrelated paid
    // external call while leaving the real enter-evaluation API untouched.
    await page.route('**/api/finalize/evaluate', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Blocked by billing-only E2E scope' }),
      })
    })

    const evaluationResponsePromise = page.waitForResponse((response) => (
      response.request().method() === 'POST'
      && new URL(response.url()).pathname === `/api/projects/${projectId}/enter-evaluation`
    ))
    await page.getByRole('button', { name: '평가 시작하기' }).click()
    const evaluationResponse = await evaluationResponsePromise
    expect(evaluationResponse.status()).toBe(200)
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/finalize$`))

    const afterEvaluationEntry = await harness.snapshot(projectId)
    expect(afterEvaluationEntry).toMatchObject({
      credits_used: 2,
      project_status: 'evaluating',
      interview_charged: true,
      design_charged: true,
      interview_sessions: 1,
      design_sessions: 1,
      finalize_sessions: 0,
      token_usage: 0,
    })
    await attachJson(testInfo, 'TC-018-billing-snapshots.json', {
      before,
      after_design_entry: afterDesignEntry,
      after_refresh: afterRefresh,
      after_evaluation_entry: afterEvaluationEntry,
      design_decision_http_status: decisionResponse.status(),
      duplicate_decision_http_status: duplicateDecision,
      evaluation_http_status: evaluationResponse.status(),
      scope: 'Actual billing transitions only; AI design/finalize generation intentionally not invoked.',
    })
  })
})
