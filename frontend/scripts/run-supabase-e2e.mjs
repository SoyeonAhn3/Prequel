import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const playwrightCli = path.resolve(scriptDir, '../node_modules/@playwright/test/cli.js')
const result = spawnSync(
  process.execPath,
  [playwrightCli, 'test', '--project=real-supabase', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, RUN_SUPABASE_E2E: '1' },
  },
)

if (result.error) throw result.error
process.exit(result.status ?? 1)
