import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import Tag from '../components/common/Tag'
import {
  getAdminStats,
  listAdminUsers,
  listActivityLogs,
  getTokenUsage,
  suspendUser,
  unsuspendUser,
  deleteUser,
  restoreUser,
} from '../lib/admin'
import type { AdminStats, AdminUser, ActivityLog, TokenUsageStats } from '../lib/admin'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const ACTION_LABELS: Record<string, string> = {
  'user.suspend': '사용자 정지',
  'user.unsuspend': '정지 해제',
  'user.delete': '사용자 삭제',
  'user.restore': '사용자 복원',
  'announcement.create': '공지 작성',
  'announcement.update': '공지 수정',
  'announcement.delete': '공지 삭제',
}

function planTone(plan: string): 'accent' | 'amber' | 'neutral' {
  if (plan === 'pro') return 'accent'
  if (plan === 'basic') return 'amber'
  return 'neutral'
}

const USAGE_SEGMENTS = [
  { key: 'input', label: 'input', cls: 'bg-accent' },
  { key: 'output', label: 'output', cls: 'bg-green' },
  { key: 'cache_creation', label: 'cache_creation', cls: 'bg-amber' },
  { key: 'cache_read', label: 'cache_read', cls: 'bg-text-muted' },
] as const

function mmdd(iso: string) {
  const [, m, d] = iso.split('-')
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`
}

function TokenUsageChart({ data }: { data: TokenUsageStats }) {
  const max = Math.max(1, ...data.series.map((d) => d.total))
  const step = Math.max(1, Math.ceil(data.series.length / 7))
  const lowCache = data.cache_read_pct < 30

  return (
    <>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-text-muted">
        {USAGE_SEGMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${s.cls}`} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Stacked bars */}
      <div className="flex items-end gap-1 h-44">
        {data.series.map((d) => (
          <div
            key={d.date}
            className="flex-1 min-w-0 flex flex-col-reverse rounded-sm overflow-hidden"
            style={{ height: `${(d.total / max) * 100}%` }}
            title={`${mmdd(d.date)} · 총 ${formatNum(d.total)} (in ${formatNum(d.input)} / out ${formatNum(d.output)} / 캐시생성 ${formatNum(d.cache_creation)} / 캐시읽기 ${formatNum(d.cache_read)})`}
          >
            {USAGE_SEGMENTS.map((s) => (
              <div
                key={s.key}
                className={s.cls}
                style={{ height: d.total ? `${(d[s.key] / d.total) * 100}%` : '0%' }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mt-1.5">
        {data.series.map((d, i) => (
          <div key={d.date} className="flex-1 min-w-0 text-center text-[10px] text-text-subtle font-mono">
            {i % step === 0 ? mmdd(d.date) : ''}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 text-xs text-text-muted">
        총 <span className="font-semibold text-text">{formatNum(data.totals.total)}</span> 토큰 · 캐시읽기{' '}
        <span className={lowCache ? 'text-amber font-semibold' : 'text-text'}>{data.cache_read_pct}%</span>
        {lowCache && <span className="text-amber"> ⚠ 낮음 (BL-003)</span>}
      </div>
    </>
  )
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuthContext()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [usage, setUsage] = useState<TokenUsageStats | null>(null)
  const [usageDays, setUsageDays] = useState(14)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [s, u, l] = await Promise.all([
        getAdminStats(),
        listAdminUsers(0, 100),
        listActivityLogs(50),
      ])
      setStats(s)
      setUsers(u.users)
      setLogs(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : '대시보드를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') load()
  }, [user?.role])

  // 토큰 사용량 차트는 별도 로드 — 기간 토글 시 차트만 다시 가져온다.
  useEffect(() => {
    if (user?.role === 'admin') {
      getTokenUsage(usageDays).then(setUsage).catch(() => setUsage(null))
    }
  }, [user?.role, usageDays])

  // 라우트 가드: 관리자가 아니면 내 프로젝트로.
  if (!authLoading && user && user.role !== 'admin') {
    return <Navigate to="/projects" replace />
  }

  async function act(id: string, fn: (id: string) => Promise<unknown>) {
    setBusyId(id)
    try {
      await fn(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '작업에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  const q = search.trim().toLowerCase()
  const filteredUsers = q
    ? users.filter((u) => u.email.toLowerCase().includes(q) || (u.display_name ?? '').toLowerCase().includes(q))
    : users
  const recentSignups = [...users].slice(0, 5)

  const kpis = stats
    ? [
        { label: '총 사용자', value: String(stats.users_total), sub: `+${stats.users_new_7d} 최근 7일` },
        { label: '활성 프로젝트', value: String(stats.projects_active), sub: `완료 ${stats.projects_completed}` },
        { label: '완료 프로젝트', value: String(stats.projects_completed), sub: '누적' },
        { label: '총 토큰 (캐시 포함)', value: formatNum(stats.tokens_total), sub: '집계 시작 이후' },
      ]
    : []

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] text-text-subtle font-mono tracking-[0.12em] mb-1.5">OPERATIONS</p>
        <h2 className="text-[26px] font-bold tracking-tight">관리자 대시보드</h2>
      </div>

      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">대시보드를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-red">{error}</p>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className="bg-surface border border-border rounded-xl p-4">
                <div className="text-xs text-text-muted">{k.label}</div>
                <div className="text-[26px] font-bold tracking-tight mt-1.5">{k.value}</div>
                <div className="text-[11.5px] text-text-subtle font-mono mt-1">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Token usage chart */}
          <div className="bg-surface border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13.5px] font-semibold">토큰 사용량</span>
              <div className="flex gap-1">
                {[14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setUsageDays(d)}
                    className={`px-2.5 py-1 rounded-md text-xs cursor-pointer ${
                      usageDays === d ? 'bg-bg text-text font-medium' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {d}일
                  </button>
                ))}
              </div>
            </div>
            {usage ? (
              usage.totals.total === 0 ? (
                <p className="text-xs text-text-muted py-10 text-center">집계된 토큰 사용량이 없습니다.</p>
              ) : (
                <TokenUsageChart data={usage} />
              )
            ) : (
              <p className="text-xs text-text-muted py-10 text-center">불러오는 중...</p>
            )}
          </div>

          {/* User management table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
              <span className="text-[13.5px] font-semibold">사용자 관리</span>
              <Tag>{users.length}명</Tag>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg w-[220px]">
                <Search size={14} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="이름·이메일 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-text placeholder:text-text-muted outline-none w-full"
                />
              </div>
            </div>
            {/* Table header */}
            <div className="grid grid-cols-[1.3fr_1.6fr_0.7fr_0.7fr_0.9fr_0.8fr_1fr] px-5 py-2.5 text-[11px] text-text-subtle font-semibold bg-surface-alt uppercase tracking-wide">
              <div>이름</div><div>이메일</div><div>플랜</div><div>사용</div><div>가입일</div><div>상태</div><div>작업</div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-text-muted">사용자가 없습니다.</div>
            ) : (
              filteredUsers.map((u) => {
                const deleted = !!u.deleted_at
                const suspended = !!u.suspended_at
                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1.3fr_1.6fr_0.7fr_0.7fr_0.9fr_0.8fr_1fr] px-5 py-3 text-[13px] items-center border-t border-border"
                  >
                    <div className="font-medium text-text truncate">
                      {u.display_name || '—'}
                      {u.role === 'admin' && <span className="ml-1.5 text-[10px] text-accent font-semibold">ADMIN</span>}
                    </div>
                    <div className="font-mono text-[11.5px] text-text-muted truncate">{u.email}</div>
                    <div><Tag tone={planTone(u.plan)}>{u.plan.toUpperCase()}</Tag></div>
                    <div className="font-mono text-xs text-text-muted">
                      {u.plan === 'free' ? `${u.free_used}/2` : '—'}
                    </div>
                    <div className="font-mono text-xs text-text-subtle">{formatDate(u.created_at)}</div>
                    <div>
                      {deleted ? (
                        <Tag tone="red">삭제됨</Tag>
                      ) : suspended ? (
                        <Tag tone="amber">정지</Tag>
                      ) : (
                        <Tag tone="green">정상</Tag>
                      )}
                    </div>
                    <div className="flex gap-2.5 text-xs">
                      {deleted ? (
                        <button onClick={() => act(u.id, restoreUser)} disabled={busyId === u.id} className="text-accent hover:underline cursor-pointer disabled:opacity-50">복원</button>
                      ) : (
                        <>
                          {suspended ? (
                            <button onClick={() => act(u.id, unsuspendUser)} disabled={busyId === u.id} className="text-accent hover:underline cursor-pointer disabled:opacity-50">해제</button>
                          ) : (
                            <button onClick={() => act(u.id, suspendUser)} disabled={busyId === u.id} className="text-amber hover:underline cursor-pointer disabled:opacity-50">정지</button>
                          )}
                          <button
                            onClick={() => { if (window.confirm(`${u.email} 계정을 삭제할까요?`)) act(u.id, deleteUser) }}
                            disabled={busyId === u.id}
                            className="text-red hover:underline cursor-pointer disabled:opacity-50"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Recent signups + activity log */}
          <div className="grid grid-cols-[1fr_1.6fr] gap-5">
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="text-[13.5px] font-semibold mb-3.5">최근 가입</div>
              {recentSignups.length === 0 ? (
                <p className="text-xs text-text-muted">없음</p>
              ) : (
                recentSignups.map((u, i) => (
                  <div key={u.id} className={`flex items-center gap-2.5 py-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-surface-alt text-text flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {(u.display_name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{u.display_name || u.email}</div>
                      <div className="text-[11px] text-text-subtle font-mono truncate">{u.email}</div>
                    </div>
                    <Tag tone={planTone(u.plan)}>{u.plan.toUpperCase()}</Tag>
                  </div>
                ))
              )}
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="text-[13.5px] font-semibold mb-3.5">활동 로그</div>
              {logs.length === 0 ? (
                <p className="text-xs text-text-muted">아직 기록된 활동이 없습니다.</p>
              ) : (
                <div className="flex flex-col">
                  {logs.map((log, i) => (
                    <div key={log.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                      <span className="text-[11px] text-text-subtle font-mono shrink-0 w-[110px]">{formatDateTime(log.created_at)}</span>
                      <span className="text-[12.5px] text-text font-medium shrink-0 w-[90px]">{ACTION_LABELS[log.action] ?? log.action}</span>
                      <span className="text-[12px] text-text-muted truncate flex-1">
                        {(log.detail?.email as string) || (log.detail?.title as string) || log.target_id || ''}
                      </span>
                      <span className="text-[11px] text-text-subtle truncate shrink-0 max-w-[120px]">{log.actor_email ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
