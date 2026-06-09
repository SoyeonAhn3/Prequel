import DesignIcon from '../design/DesignIcon'
import type { DesignIconKind, FinalizeSession, FinalizeLevel } from '../design/types'

interface FinalizeCompleteProps {
  session?: FinalizeSession | null
  onNext?: () => void
}

const LEVEL_LABEL: Record<FinalizeLevel, string> = {
  green: '🟢 적합',
  yellow: '🟡 조건부',
  red: '🔴 재검토',
}

function buildSummary(s: FinalizeSession | null | undefined): { n: string; t: string; icon: DesignIconKind; stats: string }[] {
  const ev = s?.evaluation
  const done = s?.done_criteria?.criteria.length ?? 0
  const gaps = s?.gaps?.gaps.length ?? 0
  const items = s?.checklist?.items.length ?? 0

  return [
    {
      n: '01', t: '정직한 평가', icon: 'eye',
      stats: ev ? `종합 ${LEVEL_LABEL[ev.overall_level] ?? ev.overall_level}` : '미평가',
    },
    {
      n: '02', t: '완료 조건', icon: 'check',
      stats: done > 0 ? `조건 ${done}개` : '미정의',
    },
    {
      n: '03', t: '빈틈 점검', icon: 'help',
      stats: gaps > 0 ? `${gaps}개 발견` : '빈틈 없음',
    },
    {
      n: '04', t: '착수 준비', icon: 'features',
      stats: items > 0 ? `준비 항목 ${items}개` : '미정의',
    },
  ]
}

export default function FinalizeComplete({ session, onNext }: FinalizeCompleteProps) {
  const SUMMARY = buildSummary(session)

  return (
    <div className="h-full flex items-center justify-center bg-bg p-10 overflow-auto">
      <div className="w-full max-w-[760px]">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center gap-1.5 mb-4">
            {['🎉', '✨', '🎯', '🚀'].map((e, i) => (
              <span key={i} className="text-[28px] inline-block animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
                {e}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-accent font-bold font-mono mb-1.5" style={{ letterSpacing: 0.5 }}>
            PHASE 3 COMPLETE
          </div>
          <h1 className="text-[30px] font-bold text-text m-0" style={{ letterSpacing: -0.5 }}>
            평가 · 마무리 완료!
          </h1>
          <p className="text-sm text-text-muted leading-relaxed mt-2.5">
            평가부터 착수 준비까지 모두 정리되어, 개발을 바로 시작할 수 있는 최종 문서가 준비됐어요.
          </p>
        </div>

        {/* Progress card */}
        <div
          className="px-6 py-5 bg-accent-soft rounded-[14px] mb-[18px] flex items-center gap-6"
          style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
        >
          <div className="text-center pr-6" style={{ borderRight: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)' }}>
            <div className="text-[32px] font-bold text-accent font-mono leading-none" style={{ letterSpacing: -0.8 }}>
              100%
            </div>
            <div className="text-[11px] text-accent-deep mt-1">4 / 4 단계</div>
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-accent-deep mb-1">최종 킥오프 문서 v3 생성 완료</div>
            <div className="text-xs text-accent opacity-85 leading-relaxed">평가 · 완료 조건 · 빈틈 점검 · 착수 체크리스트가 문서에 모두 반영됨</div>
          </div>
        </div>

        {/* Step summary list */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-[22px]">
          {SUMMARY.map((s, i) => (
            <div key={s.n} className={`flex items-center gap-3 px-[18px] py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-green-soft text-green flex items-center justify-center shrink-0">
                <DesignIcon kind={s.icon} size={15} />
              </div>
              <span className="text-[10.5px] font-mono text-text-subtle font-bold">{s.n}</span>
              <span className="text-[13.5px] font-semibold text-text flex-1">{s.t}</span>
              <span className="text-[11.5px] text-text-muted font-mono">{s.stats}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] bg-green-soft rounded-[5px]" style={{ color: '#2f5a44' }}>
                <DesignIcon kind="check" size={10} />완료
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="px-[22px] py-[18px] rounded-[14px] text-white flex gap-4 items-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
            boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-accent) 38%, transparent)',
          }}
        >
          <div className="flex-1">
            <div className="text-[10.5px] font-mono opacity-70 font-bold mb-1" style={{ letterSpacing: 0.5 }}>
              DONE · 킥오프 완료
            </div>
            <div className="text-base font-bold mb-1">완성된 킥오프 문서가 준비됐어요</div>
            <div className="text-xs opacity-85 leading-relaxed">
              이제 개발을 시작하면 됩니다. 문서는 프로젝트 화면에서 언제든 다시 볼 수 있어요.
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-3 text-sm font-bold bg-white border-none rounded-[9px] cursor-pointer inline-flex items-center gap-[7px] shrink-0"
            style={{ fontFamily: 'inherit', color: 'var(--color-accent-deep)' }}
          >
            문서 보러 가기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
