import Frame from '../common/Frame'
import DesignIcon from './DesignIcon'
import type { DesignIconKind } from './types'

interface StepTransitionProps {
  fromN: string
  fromT: string
  fromIcon: DesignIconKind
  toN: string
  toT: string
  toIcon: DesignIconKind
  summary: string[]
  nextPreview: string
  onBack?: () => void
  onNext?: () => void
}

export default function StepTransition({
  fromN, fromT, fromIcon, toN, toT, toIcon, summary, nextPreview, onBack, onNext,
}: StepTransitionProps) {
  return (
    <Frame>
      <div className="h-full flex items-center justify-center bg-bg p-10 overflow-auto">
        <div className="w-full max-w-[680px]">
          {/* Completion badge */}
          <div className="text-center mb-7">
            <div
              className="w-14 h-14 rounded-[14px] text-white flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--color-green) 0%, #2f5a44 100%)',
                boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-green) 50%, transparent)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11" /></svg>
            </div>
            <div className="text-[11px] text-green font-bold font-mono mb-1.5" style={{ letterSpacing: 0.5 }}>
              STEP {fromN} COMPLETE
            </div>
            <h2 className="text-[26px] font-bold text-text m-0" style={{ letterSpacing: -0.4 }}>
              {fromT} 완료!
            </h2>
            <p className="text-[13.5px] text-text-muted mt-2.5 leading-relaxed">
              잘하고 계세요. 이번 단계에서 정리한 내용을 확인해보세요.
            </p>
          </div>

          {/* Summary card */}
          <div className="bg-surface border border-border rounded-xl px-5 py-[18px] mb-[18px]">
            <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-green-soft text-green flex items-center justify-center">
                <DesignIcon kind={fromIcon} size={15} />
              </div>
              <span className="text-[13.5px] font-bold text-text">{fromT}에서 정리한 것</span>
              <div className="flex-1" />
              <button className="text-[11.5px] text-accent font-semibold bg-transparent border-none cursor-pointer" onClick={onBack}>
                편집
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {summary.map((s, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="w-[5px] h-[5px] rounded-full bg-accent shrink-0 mt-2" />
                  <div className="flex-1 text-[12.5px] text-text leading-relaxed">{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next step preview */}
          <div
            className="px-5 py-4 bg-accent-soft rounded-xl flex gap-3.5 items-center mb-[22px]"
            style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
          >
            <div
              className="w-9 h-9 rounded-[9px] bg-surface text-accent flex items-center justify-center shrink-0"
              style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
            >
              <DesignIcon kind={toIcon} size={17} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10.5px] font-mono text-accent font-bold">다음 · STEP {toN}</span>
              </div>
              <div className="text-sm font-bold text-accent-deep mt-0.5">{toT}</div>
              <div className="text-xs text-accent mt-[3px] opacity-85 leading-relaxed">{nextPreview}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-[18px] py-3 text-[13.5px] font-medium bg-surface text-text border border-border-strong rounded-[10px] cursor-pointer"
            >
              이전 단계 다시 보기
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onNext}
              className="px-[22px] py-3 text-[14.5px] font-bold bg-accent text-white border-none rounded-[10px] cursor-pointer inline-flex items-center gap-2"
              style={{
                boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--color-accent) 38%, transparent)',
              }}
            >
              {toT} 시작하기
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Frame>
  )
}
