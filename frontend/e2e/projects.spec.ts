import { expect, test } from '@playwright/test'
import { installApiMock, TEST_USER } from './support/fixtures'

test('TC-011: blank project name cannot be submitted', async ({ page }) => {
  let createRequests = 0
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname
    if (path === '/api/users/me') return { json: TEST_USER }
    if (path === '/api/projects' && request.method() === 'GET') return { json: [] }
    if (path === '/api/projects' && request.method() === 'POST') {
      createRequests += 1
      return { status: 500, json: { detail: '빈 이름 요청이 전송되면 안 됩니다.' } }
    }
    return null
  })

  await page.goto('/projects')
  await page.getByRole('button', { name: '새 프로젝트' }).click()
  await page.getByRole('button', { name: '다음' }).click()

  // label/htmlFor로 찾는다 — 연결이 끊기면 이 로케이터가 실패하므로
  // 접근성 연결 자체가 회귀 테스트 대상이 된다(placeholder로는 검증되지 않던 부분).
  const nameInput = page.getByLabel('프로젝트 이름')
  const submit = page.getByRole('button', { name: '프로젝트 생성' })
  await expect(submit).toBeDisabled()

  await nameInput.fill('   ')
  await expect(submit).toBeDisabled()
  await expect.poll(() => createRequests).toBe(0)

  await nameInput.fill('정상 프로젝트')
  await expect(submit).toBeEnabled()
})
