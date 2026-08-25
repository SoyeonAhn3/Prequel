import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import DocSectionBody from '../components/viewer/DocSections'
import { SAMPLE_KICKOFF_DOC } from '../content/sampleKickoffDoc'

// 랜딩 페이지 "샘플 결과 보기" 진입점. 실제로 완료된 프로젝트의
// document-model 응답을 정적으로 스냅샷해서(../content/sampleKickoffDoc)
// DocumentPreviewPage와 동일한 DocSectionBody로 그린다 — 로그인한 사용자가
// 실제 완료 화면에서 보는 것과 같은 결과물이라, 목업이 아니라 실제 예시다.

const STATUS_META = {
  complete: { label: '완료', dot: 'var(--color-green)', badgeBg: 'var(--color-green-soft)', badgeFg: 'var(--color-green)' },
  empty: { label: '미작성', dot: 'var(--color-text-subtle)', badgeBg: 'var(--color-surface-alt)', badgeFg: 'var(--color-text-subtle)' },
} as const

export default function SampleDocumentPage() {
  const { project, sections, completeness } = SAMPLE_KICKOFF_DOC

  function scrollTo(id: string) {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="h-screen flex bg-bg">
      {/* LEFT — TOC + completeness */}
      <aside className="w-[308px] border-r border-border bg-surface px-[18px] py-6 overflow-auto shrink-0">
        <div className="text-[11px] font-mono text-text-subtle mb-1.5" style={{ letterSpacing: 0.4 }}>
          SAMPLE PROJECT
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

        <Link
          to="/"
          className="mt-4 w-full px-3 py-2.5 bg-surface text-text rounded-lg cursor-pointer flex items-center justify-center gap-2 text-[12.5px] font-medium hover:bg-surface-alt transition-colors no-underline"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={13} /> 홈으로
        </Link>
      </aside>

      {/* MAIN — document */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Action bar */}
        <div className="px-8 py-3.5 border-b border-border bg-surface flex items-center gap-2.5">
          <div>
            <div className="text-[10.5px] font-mono text-text-subtle" style={{ letterSpacing: 0.4 }}>
              DOCUMENT PREVIEW
            </div>
            <div className="text-[14px] font-bold text-text mt-0.5">킥오프 문서 예시</div>
          </div>
          <div className="flex-1" />
          <span className="text-[11.5px] text-accent-deep font-mono flex items-center gap-1.5 px-2.5 py-1 bg-accent-soft rounded-full">
            <Sparkles size={12} /> 실제 완성된 문서 예시입니다
          </span>
        </div>

        {/* Document body */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1210px] mx-auto px-12 pt-10 pb-16">
            {/* Header */}
            <div className="mb-9">
              <div className="flex items-center gap-2 text-[11.5px] text-text-subtle font-mono mb-3" style={{ letterSpacing: 0.4 }}>
                <span>KICKOFF DOCUMENT</span>
                <span>·</span>
                <span>SAMPLE</span>
              </div>
              <div className="flex items-start gap-3">
                <h1 className="flex-1 text-[32px] font-bold text-text leading-tight m-0" style={{ letterSpacing: -0.7 }}>
                  {project.name}
                </h1>
                <Link
                  to="/login"
                  className="shrink-0 mt-1.5 px-4 py-2.5 text-[14px] font-semibold text-white bg-accent rounded-lg cursor-pointer flex items-center gap-2 hover:bg-accent-deep transition-colors no-underline"
                >
                  나도 만들어보기
                </Link>
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
                    <DocSectionBody section={s} />
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
