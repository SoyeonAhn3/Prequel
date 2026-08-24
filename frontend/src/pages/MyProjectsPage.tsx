import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { useProjects } from '../hooks/useProjects'
import type { Project } from '../hooks/useProjects'
import NewProjectModal from '../components/projects/NewProjectModal'
import { Plus, AlertTriangle, Search, MoreVertical } from 'lucide-react'
import DeleteConfirmModal from '../components/projects/DeleteConfirmModal'
import EditProjectModal from '../components/projects/EditProjectModal'
import Badge from '../components/common/Badge'

type FilterTab = 'all' | 'in_progress' | 'completed'

const STATUS_MAP: Record<string, { label: string; variant: 'accent' | 'green' | 'amber' }> = {
  in_progress: { label: '진행 중', variant: 'accent' },
  designing: { label: '설계 중', variant: 'accent' },
  evaluating: { label: '평가 중', variant: 'amber' },
  completed: { label: '완료', variant: 'green' },
  paused: { label: '일시정지', variant: 'amber' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Resume into the correct phase based on project status.
function resumeRoute(project: Project): string {
  if (project.status === 'designing') return `/projects/${project.id}/design`
  if (project.status === 'evaluating') return `/projects/${project.id}/finalize`
  if (project.status === 'completed') return `/projects/${project.id}/document`
  return `/projects/${project.id}/interview`
}

export default function MyProjectsPage() {
  const navigate = useNavigate()
  const { user, refetchProfile } = useAuthContext()
  const { projects, loading, error, createProject, deleteProject, updateProject } = useProjects()

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    void refetchProfile()
  }, [refetchProfile])

  const filtered = projects.filter((p) => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const completedCount = projects.filter((p) => p.status === 'completed').length
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length
  const creditsUsed = user?.credits_used ?? 0
  const devBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
  const remaining = devBypass ? 999 : Math.max(0, 2 - creditsUsed)

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: projects.length },
    { key: 'in_progress', label: '진행 중', count: inProgressCount },
    { key: 'completed', label: '완료', count: completedCount },
  ]

  async function handleCreate(input: { name: string; description?: string; language: string }) {
    await createProject(input)
    await refetchProfile()
    setShowNewModal(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteProject(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function handleUpdate(data: { name: string; description: string }) {
    if (!editTarget) return
    await updateProject(editTarget.id, data)
    setEditTarget(null)
  }

  const isQuotaExceeded = !devBypass && user?.plan === 'free' && creditsUsed >= 2

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-1.5">
        <div>
          <p className="text-xs text-text-subtle font-mono mb-1.5">
            안녕하세요, {user?.display_name ?? user?.email}님
          </p>
          <h2 className="text-[26px] font-bold tracking-tight">내 프로젝트</h2>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={isQuotaExceeded}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} strokeWidth={2.5} />
          새 프로젝트
        </button>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-3.5 mt-6">
        {/* Quota */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">누적 사용</span>
            <Badge variant="accent" className="font-semibold">FREE</Badge>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[26px] font-bold tracking-tight">{creditsUsed}</span>
            <span className="text-sm text-text-subtle">/ 2 회</span>
          </div>
          <div className="h-1 bg-surface-alt rounded mt-2.5">
            <div className="h-full bg-accent rounded transition-all" style={{ width: `${Math.min(creditsUsed / 2, 1) * 100}%` }} />
          </div>
        </div>

        {/* Completed */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-4">
          <span className="text-xs text-text-muted">완료한 킥오프</span>
          <div className="text-[26px] font-bold tracking-tight mt-2">{completedCount}</div>
          <div className="text-xs text-text-subtle mt-1">전체 {projects.length}개 프로젝트</div>
        </div>

        {/* In Progress */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-4">
          <span className="text-xs text-text-muted">진행 중</span>
          <div className="text-[26px] font-bold tracking-tight mt-2">{inProgressCount}</div>
          <div className="text-xs text-text-subtle mt-1">이어하기 가능</div>
        </div>

        {/* Remaining Warning */}
        {!devBypass && user?.plan === 'free' && (
          <div className="flex-[1.4] bg-[#f5f7fb] border border-amber-soft rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-soft text-amber flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-text">
                {remaining > 0 ? `${remaining}회 남았어요` : '무료 횟수를 모두 사용했어요'}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                무료 2회는 계정당 고정이에요
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter + Search */}
      <div className="flex items-center gap-2 mt-8 mb-3.5">
        <div className="flex gap-1 p-0.5 bg-surface-alt rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMenuOpenId(null) }}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-surface text-text shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
              <span className="text-[10.5px] text-text-subtle font-mono">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg w-[220px]">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="프로젝트 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-text placeholder:text-text-muted outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">프로젝트를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-red">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">
            {projects.length === 0
              ? '아직 프로젝트가 없습니다. 새 프로젝트를 생성해보세요!'
              : '검색 결과가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-visible">
          {/* Table Header */}
          <div className="grid grid-cols-[1.8fr_0.9fr_0.9fr_0.7fr_0.7fr_40px] px-5 py-2.5 text-[11.5px] text-text-subtle font-semibold bg-surface-alt border-b border-border uppercase tracking-wide rounded-t-xl">
            <div>프로젝트</div>
            <div>유형</div>
            <div>상태</div>
            <div>언어</div>
            <div>업데이트</div>
            <div />
          </div>
          {/* Table Rows */}
          {filtered.map((project, i) => {
            const status = STATUS_MAP[project.status] ?? STATUS_MAP.in_progress
            const progress = project.total_steps > 0
              ? Math.round((project.current_step / project.total_steps) * 100)
              : 0
            const isLastRow = i === filtered.length - 1

            return (
              <div
                key={project.id}
                className={`grid grid-cols-[1.8fr_0.9fr_0.9fr_0.7fr_0.7fr_40px] px-5 py-3.5 text-[13.5px] items-center ${
                  i < filtered.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {/* Name + Progress */}
                <div>
                  <div
                    className="font-semibold text-text hover:text-accent cursor-pointer transition-colors"
                    onClick={() => navigate(resumeRoute(project))}
                  >
                    {project.name}
                  </div>
                  {project.status === 'in_progress' && progress > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-20 h-[3px] bg-surface-alt rounded">
                        <div
                          className="h-full bg-accent rounded transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-text-subtle font-mono">{progress}%</span>
                    </div>
                  )}
                </div>
                {/* Type */}
                <div className="text-text-muted text-xs">{project.project_type ?? '-'}</div>
                {/* Status Tag */}
                <div>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
                {/* Language */}
                <div className="text-text-muted text-xs font-mono uppercase">{project.language}</div>
                {/* Date */}
                <div className="text-text-subtle text-xs font-mono">{formatDate(project.updated_at)}</div>
                {/* Menu */}
                <div ref={menuOpenId === project.id ? menuRef : undefined} className="relative flex justify-end">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                    className="text-text-subtle hover:text-text cursor-pointer p-1"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === project.id && (
                    <div className={`absolute right-0 z-10 w-32 bg-surface border border-border rounded-lg shadow-lg py-1 ${isLastRow ? 'bottom-8' : 'top-8'}`}>
                      {(project.status === 'in_progress' || project.status === 'paused') && (
                        <button
                          onClick={() => {
                            setMenuOpenId(null)
                            navigate(`/projects/${project.id}/interview`)
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-accent hover:bg-bg transition-colors cursor-pointer"
                        >
                          이어하기
                        </button>
                      )}
                      {project.status === 'designing' && (
                        <button
                          onClick={() => {
                            setMenuOpenId(null)
                            navigate(`/projects/${project.id}/design`)
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-accent hover:bg-bg transition-colors cursor-pointer"
                        >
                          설계 이어하기
                        </button>
                      )}
                      {project.status === 'evaluating' && (
                        <button
                          onClick={() => {
                            setMenuOpenId(null)
                            navigate(`/projects/${project.id}/finalize`)
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-accent hover:bg-bg transition-colors cursor-pointer"
                        >
                          평가 이어하기
                        </button>
                      )}
                      {project.status === 'completed' && (
                        <button
                          onClick={() => {
                            setMenuOpenId(null)
                            navigate(`/projects/${project.id}/document`)
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-accent hover:bg-bg transition-colors cursor-pointer"
                        >
                          결과 보기
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpenId(null)
                          setEditTarget(project)
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-bg transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null)
                          setDeleteTarget(project)
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-red hover:bg-bg transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showNewModal && (
        <NewProjectModal
          isQuotaExceeded={isQuotaExceeded}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          projectName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      {editTarget && (
        <EditProjectModal
          initialName={editTarget.name}
          initialDescription={editTarget.description ?? ''}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  )
}
