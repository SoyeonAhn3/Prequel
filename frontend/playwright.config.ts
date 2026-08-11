import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.resolve(frontendDir, '../backend')
const pythonExecutable = process.env.E2E_PYTHON || path.join(
  backendDir,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
)
const reuseExistingServer = process.env.E2E_REUSE_SERVERS === 'true'
const runRealSupabase = process.env.RUN_SUPABASE_E2E === '1'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5177',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'public-chromium',
      testMatch: /public\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5177',
      },
    },
    {
      name: 'app-chromium',
      testIgnore: [/public\.spec\.ts/, /\.real\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5178',
      },
    },
    ...(runRealSupabase ? [{
      name: 'real-supabase',
      testMatch: /\.real\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5177',
      },
    }] : []),
  ],
  webServer: [
    {
      command: `"${pythonExecutable}" -m uvicorn app.main:app --app-dir "${backendDir}" --host 127.0.0.1 --port 8001`,
      url: 'http://127.0.0.1:8001/health',
      timeout: 120_000,
      reuseExistingServer,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        DEV_BYPASS_AUTH: 'false',
        CORS_ORIGINS: 'http://127.0.0.1:5177',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5177',
      timeout: 120_000,
      reuseExistingServer,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        VITE_PORT: '5177',
        VITE_API_PROXY_TARGET: 'http://127.0.0.1:8001',
        VITE_DEV_BYPASS_AUTH: 'false',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5178',
      timeout: 120_000,
      reuseExistingServer,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        VITE_PORT: '5178',
        VITE_API_PROXY_TARGET: 'http://127.0.0.1:8001',
        VITE_DEV_BYPASS_AUTH: 'true',
      },
    },
  ],
})
