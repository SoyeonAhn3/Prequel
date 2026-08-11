import { expect, test } from '@playwright/test'
import { installApiMock, TEST_USER, testProject } from './support/fixtures'

test('TC-016: empty document shows a safe state and export returns 404', async ({ page }) => {
  const project = testProject()
  const emptyModel = {
    project,
    sections: [
      { id: 'profile', title: '프로젝트 프로필', kind: 'profile', status: 'empty', content: '', data: null },
      { id: 'features', title: '핵심 기능', kind: 'features', status: 'empty', content: '', data: null },
    ],
    completeness: { complete: 0, total: 2, percent: 0 },
  }

  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname
    if (path === '/api/users/me') return { json: TEST_USER }
    if (path === `/api/projects/${project.id}/document-model`) return { json: emptyModel }
    if (path === `/api/projects/${project.id}/export/markdown`) {
      return { status: 404, json: { detail: '아직 다운로드할 내용이 없습니다' } }
    }
    return null
  })

  await page.goto(`/projects/${project.id}/document`)

  await expect(page.getByText('아직 문서가 준비되지 않았어요')).toBeVisible()
  await expect(page.getByRole('button', { name: '인터뷰로 돌아가기' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown' })).toHaveCount(0)

  const exportResult = await page.evaluate(async (projectId) => {
    const response = await fetch(`/api/projects/${projectId}/export/markdown`)
    return { status: response.status, body: await response.json() as { detail: string } }
  }, project.id)
  expect(exportResult).toEqual({
    status: 404,
    body: { detail: '아직 다운로드할 내용이 없습니다' },
  })
})
