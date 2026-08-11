import { expect, test } from '@playwright/test'
import {
  installApiMock,
  interviewResponse,
  TEST_USER,
  testProject,
} from './support/fixtures'

const project = testProject()

function nextInterviewResponse() {
  return interviewResponse({
    current_step: 1,
    step_title: '사용자',
    question: '이 프로젝트를 가장 자주 사용할 사람은 누구인가요?',
    answer_count: 1,
    messages: [
      ...interviewResponse().messages,
      { role: 'user', text: '반복 업무를 처리하는 팀원입니다.', time: '2026-07-22T00:01:00Z' },
      { role: 'ai', text: '이 프로젝트를 가장 자주 사용할 사람은 누구인가요?', time: '2026-07-22T00:01:01Z' },
    ],
  })
}

test('TC-013: offline answer is saved and resent with the same answer id', async ({ page, context }) => {
  let successfulAnswers = 0
  let receivedAnswerId = ''
  let simulateOffline = true

  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname
    if (path === '/api/users/me') return { json: TEST_USER }
    if (path === '/api/projects') return { json: [project] }
    if (path === `/api/interview/session/${project.id}`) return { json: { session: null } }
    if (path === '/api/interview/start') return { json: interviewResponse() }
    return null
  })
  // Route mocks can still fulfill while Chromium is marked offline. Abort the
  // first answer explicitly so the application exercises its real draft path.
  await page.route('**/api/interview/answer', async (route) => {
    if (simulateOffline) {
      await route.abort('internetdisconnected')
      return
    }
    successfulAnswers += 1
    const body = route.request().postDataJSON() as { answer_id: string }
    receivedAnswerId = body.answer_id
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(nextInterviewResponse()),
    })
  })

  await page.goto(`/projects/${project.id}/interview`)
  await expect(page.getByText(interviewResponse().question!)).toBeVisible()

  await context.setOffline(true)
  await expect(page.getByText('오프라인 상태예요. 답변은 임시 저장되고, 연결되면 자동으로 전송됩니다.')).toBeVisible()

  const answer = '반복 업무를 처리하는 팀원입니다.'
  await page.getByPlaceholder('답변을 입력하세요...').fill(answer)
  await page.getByRole('button', { name: '전송' }).click()

  await expect.poll(async () => page.evaluate((projectId) => {
    const raw = localStorage.getItem(`prequel:interview-draft:${projectId}`)
    return raw ? JSON.parse(raw) as { answer: string; answerId: string } : null
  }, project.id)).not.toBeNull()

  const stored = await page.evaluate((projectId) => {
    const raw = localStorage.getItem(`prequel:interview-draft:${projectId}`)
    return raw ? JSON.parse(raw) as { answer: string; answerId: string } : null
  }, project.id)
  expect(stored?.answer).toBe(answer)
  expect(stored?.answerId).toBeTruthy()

  simulateOffline = false
  await context.setOffline(false)
  await expect(page.getByText(nextInterviewResponse().question!)).toBeVisible()
  await expect.poll(() => successfulAnswers).toBe(1)
  expect(receivedAnswerId).toBe(stored?.answerId)
  await expect.poll(async () => page.evaluate((projectId) => (
    localStorage.getItem(`prequel:interview-draft:${projectId}`)
  ), project.id)).toBeNull()
})

test('TC-014: retry repeats the failed answer operation after a 503', async ({ page }) => {
  let answerRequests = 0

  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname
    if (path === '/api/users/me') return { json: TEST_USER }
    if (path === '/api/projects') return { json: [project] }
    if (path === `/api/interview/session/${project.id}`) return { json: { session: null } }
    if (path === '/api/interview/start') return { json: interviewResponse() }
    if (path === '/api/interview/answer') {
      answerRequests += 1
      if (answerRequests === 1) {
        return {
          status: 503,
          json: { detail: 'AI 서버에 일시적인 문제가 있어요. 다시 시도해주세요.', retryable: true },
        }
      }
      return { json: nextInterviewResponse() }
    }
    return null
  })

  await page.goto(`/projects/${project.id}/interview`)
  await page.getByPlaceholder('답변을 입력하세요...').fill('반복 업무를 처리하는 팀원입니다.')
  await page.getByRole('button', { name: '전송' }).click()

  await expect(page.getByText('AI 서버에 일시적인 문제가 있어요. 다시 시도해주세요.')).toBeVisible()
  await page.getByRole('button', { name: '재시도' }).click()

  await expect(page.getByText(nextInterviewResponse().question!)).toBeVisible()
  await expect(page.getByText('AI 서버에 일시적인 문제가 있어요. 다시 시도해주세요.')).not.toBeVisible()
  expect(answerRequests).toBe(2)
})
