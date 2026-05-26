import DesignIcon from './DesignIcon'
import type { DesignIconKind } from './types'

interface DesignCompleteProps {
  onNext?: () => void
}

const SUMMARY: { n: string; t: string; icon: DesignIconKind; stats: string }[] = [
  { n: '01', t: '기능 정의', icon: 'features', stats: '기능 3개 · 품질기준 4개' },
  { n: '02', t: '시스템 구조', icon: 'arch', stats: '부품 6개 · 간단 조합' },
  { n: '03', t: '데이터 구조', icon: 'data', stats: '그룹 3개 · 항목 15개' },
  { n: '04', t: 'AI 흐름', icon: 'ai', stats: '입력 3 · 출력 4 · 폴백 3' },
]

export default function DesignComplete({ onNext }: DesignCompleteProps) {
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
            PHASE 2 COMPLETE
          </div>
          <h1 className="text-[30px] font-bold text-text m-0" style={{ letterSpacing: -0.5 }}>
            설계 단계 완료!
          </h1>
          <p className="text-sm text-text-muted leading-relaxed mt-2.5">
            개발자에게 바로 전달할 수 있는 설계 문서가 준비되었어요.
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
            <div className="text-[13.5px] font-bold text-accent-deep mb-1">설계 문서 v1.0 생성 완료</div>
            <div className="text-xs text-accent opacity-85 leading-relaxed">약 18분 소요 · 33개 정의 항목 · 자동 다이어그램 3개</div>
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

        {/* Download buttons */}
        <div className="flex gap-2 mb-5">
          {['Markdown 다운로드', 'PDF 다운로드', '🔗 공유 링크'].map((label, i) => (
            <button
              key={i}
              type="button"
              className="flex-1 py-3 text-[13px] font-semibold bg-surface text-text border border-border-strong rounded-[9px] cursor-pointer inline-flex items-center justify-center gap-[7px]"
              style={{ fontFamily: 'inherit' }}
            >
              {i < 2 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>

        {/* Next phase CTA */}
        <div
          className="px-[22px] py-[18px] rounded-[14px] text-white flex gap-4 items-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
            boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-accent) 38%, transparent)',
          }}
        >
          <div className="flex-1">
            <div className="text-[10.5px] font-mono opacity-70 font-bold mb-1" style={{ letterSpacing: 0.5 }}>
              NEXT · PHASE 3
            </div>
            <div className="text-base font-bold mb-1">구현 단계로 넘어갈까요?</div>
            <div className="text-xs opacity-85 leading-relaxed">
              개발 착수 체크리스트와 .env 변수, 폴더 구조까지 함께 만들어드려요.
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-3 text-sm font-bold bg-white border-none rounded-[9px] cursor-pointer inline-flex items-center gap-[7px] shrink-0"
            style={{ fontFamily: 'inherit', color: 'var(--color-accent-deep)' }}
          >
            시작하기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
