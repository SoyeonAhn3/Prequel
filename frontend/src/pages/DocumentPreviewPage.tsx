import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react'
import { apiFetch, apiDownload } from '../lib/api'
import Markdown from '../components/common/Markdown'

// 7a (structured): the preview renders a server-assembled document model. Each
// section's status comes straight from whether its backing step data exists —
// no markdown parsing, no guessing which sections are present.

type SectionStatus = 'complete' | 'empty'

interface DocSection {
  id: string
  title: string
  status: SectionStatus
  content: string
}

interface DocModel {
  project: {
    id: string
    name: string
    project_type: string | null
    description: string | null
    language: string
    status: string
  }
  sections: DocSection[]
  completeness: { complete: number; total: number; percent: number }
}

const STATUS_META: Record<SectionStatus, { label: string; dot: string; badgeBg: string; badgeFg: string }> = {
  complete: { label: '완료', dot: 'var(--color-green)', badgeBg: 'var(--color-green-soft)', badgeFg: 'var(--color-green)' },
  empty: { label: '미작성', dot: 'var(--color-text-subtle)', badgeBg: 'var(--color-surface-alt)', badgeFg: 'var(--color-text-subtle)' },
}

export default function DocumentPreviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [model, setModel] = useState<DocModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await apiFetch<DocModel>(`/projects/${projectId}/document-model`)
        if (active) setModel(data)
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '문서를 불러오지 못했습니다')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [projectId])

  async function handleDownload() {
    if (!model) return
    setDownloading(true)
    setError(null)
    try {
      await apiDownload(`/projects/${model.project.id}/export/markdown`, `${model.project.name}_kickoff.md`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '다운로드에 실패했습니다 (문서가 아직 생성되지 않았을 수 있어요)')
    } finally {
      setDownloading(false)
    }
  }

  function scrollTo(id: string) {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-text-muted">
        <Loader2 className="animate-spin mr-2" size={18} /> 불러오는 중…
      </div>
    )
  }

  if (!model) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 text-text-muted">
        <div className="text-sm">{error ?? '프로젝트를 찾을 수 없습니다'}</div>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-[13px] font-semibold text-accent border border-accent/30 rounded-lg cursor-pointer hover:bg-accent-soft transition-colors"
        >
          내 프로젝트로
        </button>
      </div>
    )
  }

  const { project, sections, completeness } = model

  // No section has content yet → interview hasn't produced anything to preview.
  if (completeness.complete === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-alt text-text-subtle flex items-center justify-center">
          <FileText size={22} />
        </div>
        <div>
          <div className="text-[15px] font-bold text-text mb-1.5">아직 문서가 준비되지 않았어요</div>
          <div className="text-[13px] text-text-muted leading-relaxed max-w-sm">
            인터뷰를 진행하면 수집된 내용이 여기에 채워집니다.
          </div>
        </div>
        <button
          onClick={() => navigate(`/projects/${project.id}/interview`)}
          className="mt-1 px-4 py-2 text-[13px] font-semibold text-accent border border-accent/30 rounded-lg cursor-pointer hover:bg-accent-soft transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> 인터뷰로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-bg">
      {/* LEFT — TOC + completeness */}
      <aside className="w-[280px] border-r border-border bg-surface px-[18px] py-6 overflow-auto shrink-0">
        <div className="text-[11px] font-mono text-text-subtle mb-1.5" style={{ letterSpacing: 0.4 }}>
          PROJECT
        </div>
        <div className="text-[15px] font-bold text-text" style={{ letterSpacing: -0.2 }}>
          {project.name}
        </div>
        <div className="flex gap-1.5 mt-2">
          {project.project_type && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-soft text-accent-deep">
              {project.project_type}
            </span>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-alt text-text-subtle uppercase">
            {project.language}
          </span>
        </div>

        {/* Completeness card */}
        <div className="mt-5 p-3.5 bg-accent-soft rounded-xl" style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)' }}>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold font-mono text-accent leading-none" style={{ letterSpacing: -0.6 }}>
              {completeness.percent}
            </span>
            <span className="text-[13px] text-accent-deep opacity-70">%</span>
            <div className="flex-1" />
            <span className="text-[11px] text-accent-deep font-semibold">문서 완성도</span>
          </div>
          <div className="h-[5px] bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${completeness.percent}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-accent-deep opacity-80">
            {completeness.complete} / {completeness.total} 섹션 완료
          </div>
        </div>

        {/* Contents */}
        <div className="mt-6">
          <div className="text-[10.5px] font-mono text-text-subtle mb-2.5" style={{ letterSpacing: 0.4 }}>
            CONTENTS
          </div>
          {sections.map((s, i) => {
            const st = STATUS_META[s.status]
            return (
              <div
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="flex gap-2.5 px-2 py-2 rounded-lg mb-0.5 cursor-pointer hover:bg-surface-alt transition-colors items-start"
              >
                <span className="text-[10px] font-mono text-text-subtle font-bold pt-0.5 w-[18px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12.5px] leading-snug ${s.status === 'empty' ? 'text-text-muted font-medium' : 'text-text font-medium'}`}>
                    {s.title}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: st.dot }} />
                    <span className="text-[10.5px] font-medium" style={{ color: st.badgeFg }}>{st.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => navigate('/projects')}
          className="mt-4 w-full px-3 py-2.5 bg-surface text-text rounded-lg cursor-pointer flex items-center justify-center gap-2 text-[12.5px] font-medium hover:bg-surface-alt transition-colors"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={13} /> 내 프로젝트로
        </button>
      </aside>

      {/* MAIN — document */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Action bar */}
        <div className="px-8 py-3.5 border-b border-border bg-surface flex items-center gap-2.5">
          <div>
            <div className="text-[10.5px] font-mono text-text-subtle" style={{ letterSpacing: 0.4 }}>
              DOCUMENT PREVIEW
            </div>
            <div className="text-[14px] font-bold text-text mt-0.5">킥오프 문서 미리보기</div>
          </div>
          <div className="flex-1" />
          <span className="text-[11.5px] text-text-subtle font-mono flex items-center gap-1.5">
            <span className="w-[5px] h-[5px] rounded-full bg-green" /> 실시간 업데이트
          </span>
        </div>

        {error && (
          <div className="px-8 py-2 bg-red/10 text-red text-xs border-b border-red/20">{error}</div>
        )}

        {/* Document body */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[840px] mx-auto px-12 pt-10 pb-16">
            {/* Header */}
            <div className="mb-9">
              <div className="flex items-center gap-2 text-[11.5px] text-text-subtle font-mono mb-3" style={{ letterSpacing: 0.4 }}>
                <span>KICKOFF DOCUMENT</span>
                <span>·</span>
                <span>DRAFT</span>
              </div>
              <div className="flex items-start gap-3">
                <h1 className="flex-1 text-[32px] font-bold text-text leading-tight m-0" style={{ letterSpacing: -0.7 }}>
                  {project.name}
                </h1>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="shrink-0 mt-1.5 px-4 py-2.5 text-[14px] font-semibold text-text bg-surface rounded-lg cursor-pointer flex items-center gap-2 hover:bg-surface-alt transition-colors disabled:opacity-60"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Markdown
                </button>
              </div>
              {project.description && (
                <p className="text-[15px] text-text-muted leading-relaxed mt-3 mb-0">{project.description}</p>
              )}
              <div className="flex gap-1.5 mt-4">
                {project.project_type && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent-soft text-accent-deep">
                    {project.project_type}
                  </span>
                )}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-green-soft text-green">
                  {project.status}
                </span>
              </div>
            </div>

            {/* Sections */}
            {sections.map((s, i) => {
              const st = STATUS_META[s.status]
              return (
                <section key={s.id} id={`sec-${s.id}`} className="mb-9 scroll-mt-6">
                  <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-border">
                    <span className="text-[12px] font-mono text-text-subtle font-bold" style={{ letterSpacing: 0.4 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className={`text-[19px] font-bold m-0 ${s.status === 'empty' ? 'text-text-muted' : 'text-text'}`} style={{ letterSpacing: -0.3 }}>
                      {s.title}
                    </h2>
                    <div className="flex-1" />
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded"
                      style={{ color: st.badgeFg, background: st.badgeBg }}
                    >
                      <span className="w-[5px] h-[5px] rounded-full" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </div>

                  {s.status === 'complete' ? (
                    <Markdown>{s.content}</Markdown>
                  ) : (
                    <div className="px-6 py-7 text-center bg-surface rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                      <div className="text-[13px] font-semibold text-text mb-1">아직 작성되지 않았어요</div>
                      <div className="text-[12px] text-text-muted leading-relaxed">
                        해당 단계를 진행하면 이 섹션이 채워집니다
                      </div>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
