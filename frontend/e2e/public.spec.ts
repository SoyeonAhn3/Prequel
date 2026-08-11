import { expect, test } from '@playwright/test'

test.describe('public entry points', () => {
  test('TC-001: landing CTA opens the login page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('BETA · 무료 2회 제공')).toBeVisible()
    await expect(page.getByRole('heading', { name: '모든 좋은 프로젝트엔 프리퀄이 있다.' })).toBeVisible()
    await expect(page.getByRole('button', { name: '샘플 결과 보기' })).toBeDisabled()

    await page.getByRole('link', { name: '무료로 시작하기' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'GitHub로 계속하기' })).toBeVisible()
  })

  test('legal pages are publicly accessible', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: '이용약관' }).first()).toBeVisible()

    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: '개인정보처리방침' }).first()).toBeVisible()
  })
})
