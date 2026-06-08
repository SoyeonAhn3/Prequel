import DesignIcon from './DesignIcon'
import type { DesignIconKind } from './types'

interface DesignWelcomeProps {
  onStart: () => void
  onSkipToEval: () => void
  onSaveExit: () => void
}

const STEPS: { n: string; icon: DesignIconKind; t: string; q: string; time: string }[] = [
  { n: '01', icon: 'features', t: '기능 정의', q: '이 도구로 뭘 할 수 있어야 해?', time: '~5분' },
  { n: '02', icon: 'arch', t: '시스템 구조', q: '어떤 부품으로 만들지?', time: '~5분' },
  { n: '03', icon: 'data', t: '데이터 구조', q: '어떤 정보를 저장할지?', time: '~5분' },
  { n: '04', icon: 'ai', t: 'AI 흐름', q: 'AI에게 뭘 시킬지?', time: '~5분' },
]

export default function DesignWelcome({ onStart, onSkipToEval, onSaveExit }: DesignWelcomeProps) {
  return (
    <div className="h-full flex items-center justify-center bg-bg p-10 overflow-auto">
      <div className="w-full max-w-[760px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-[7px] px-3 py-[5px] bg-accent-soft rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[11px] text-accent-deep font-bold font-mono" style={{ letterSpacing: 0.5 }}>
              PHASE 2 of 3 · 시작
            </span>
          </div>
          <h1 className="text-[32px] font-bold text-text m-0 leading-tight" style={{ letterSpacing: -0.6 }}>
            이제 <span className="text-accent">설계 단계</span>를 시작할게요
          </h1>
          <p className="text-[14.5px] text-text-muted leading-relaxed mt-3.5 max-w-[540px] mx-auto">
            아이디어를 실제로 만들 수 있는 형태로 다듬어볼게요. <strong className="text-text">네 가지 질문</strong>에 답하시면 됩니다. 어렵게 생각하지 마세요 — AI가 먼저 추천해드릴게요.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {STEPS.map(s => (
            <div key={s.n} className="p-[18px_20px] bg-surface border border-border rounded-xl flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <DesignIcon kind={s.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 mb-[3px]">
                  <span className="text-[10.5px] font-mono text-text-subtle font-bold">{s.n}</span>
                  <span className="text-[14.5px] font-bold text-text" style={{ letterSpacing: -0.2 }}>{s.t}</span>
                </div>
                <div className="text-[12.5px] text-text-muted leading-relaxed mb-1.5">{s.q}</div>
                <span className="text-[11px] text-text-subtle font-mono px-[7px] py-0.5 bg-surface-alt rounded">{s.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Outcome box */}
        <div
          className="p-[18px_20px] rounded-xl mb-7 flex gap-3.5 items-start"
          style={{
            background: 'color-mix(in srgb, var(--color-green-soft) 60%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-green) 18%, transparent)',
          }}
        >
          <div
            className="w-9 h-9 rounded-[9px] bg-surface text-green flex items-center justify-center shrink-0"
            style={{ border: '1px solid color-mix(in srgb, var(--color-green) 18%, transparent)' }}
          >
            <DesignIcon kind="check" size={18} />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold mb-1" style={{ color: '#2f5a44' }}>완료하면 얻는 것</div>
            <p className="text-[12.5px] opacity-90 leading-relaxed m-0" style={{ color: '#2f5a44' }}>
              개발자에게 바로 전달할 수 있는 <strong>설계 문서 + 다이어그램 + AI 워크플로우 정의</strong>. 코딩 시작 전에 빠뜨린 부분이 없는지 확인할 수 있어요.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 items-center">
          <button
            type="button"
            onClick={onStart}
            className="px-7 py-3.5 text-[15px] font-bold bg-accent text-white border-none rounded-[10px] cursor-pointer inline-flex items-center gap-2"
            style={{
              fontFamily: 'inherit',
              boxShadow: '0 4px 16px -4px color-mix(in srgb, var(--color-accent) 50%, transparent)',
            }}
          >
            네, 설계를 시작할게요
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
          <button
            type="button"
            onClick={onSkipToEval}
            className="px-6 py-3 text-[13.5px] font-semibold bg-surface text-text border border-border-strong rounded-[10px] cursor-pointer inline-flex items-center gap-2"
            style={{ fontFamily: 'inherit' }}
          >
            설계 건너뛰고 평가로
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
          <button
            type="button"
            onClick={onSaveExit}
            className="px-4 py-2 text-[12.5px] font-medium bg-transparent text-text-muted border-none cursor-pointer"
            style={{ fontFamily: 'inherit' }}
          >
            저장 후 나가기
          </button>
        </div>
      </div>
    </div>
  )
}
