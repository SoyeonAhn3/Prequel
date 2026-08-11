import { expect, test } from '@playwright/test'
import { installApiMock, TEST_USER, testProject } from './support/fixtures'

const routes = [
  { status: 'designing', suffix: 'design' },
  { status: 'evaluating', suffix: 'finalize' },
  { status: 'completed', suffix: 'document' },
]

for (const { status, suffix } of routes) {
  test(`interview URL redirects ${status} projects to /${suffix}`, async ({ page }) => {
    const project = testProject({ status })
    let sessionRequests = 0

    await installApiMock(page, (request) => {
      const path = new URL(request.url()).pathname
      if (path === '/api/users/me') return { json: TEST_USER }
      if (path === '/api/projects') return { json: [project] }
      if (path === `/api/interview/session/${project.id}`) {
        sessionRequests += 1
        return { json: { session: null } }
      }
      return null
    })

    await page.goto(`/projects/${project.id}/interview`)
    await expect(page).toHaveURL(new RegExp(`/projects/${project.id}/${suffix}$`))
    expect(sessionRequests).toBe(0)
  })
}
