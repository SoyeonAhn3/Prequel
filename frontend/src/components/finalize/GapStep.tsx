import { useEffect, useRef } from 'react'
import Explainer from '../design/Explainer'
import { StepLoading, StepRetry } from './FinalizeStates'
import type { FinalizeSession, GapItem } from '../design/types'

interface Props {
  session: FinalizeSession | null
  generating: boolean
  onGenerate: () => void
}

const SEVERITY: Record<GapItem['severity'], { cls: string; label: string }> = {
  high: { cls: 'text-red bg-red-soft', label: '높음' },
  medium: { cls: 'text-amber bg-amber-soft', label: '중간' },
  low: { cls: 'text-text-muted bg-surface-alt', label: '낮음' },
}

const TYPE_EMOJI: Record<string, string> = {
  모순: '⚠️',
  누락: '🕳️',
  확인필요: '❓',
}

export default function GapStep({ session, generating, onGenerate }: Props) {
  const gapsData = session?.gaps
  const autoGenRef = useRef(false)

  const explainer = (
    <Explainer
      title="빈틈 점검"
      technical="Gap Analysis"
      plain="개발을 시작하기 전에 계획에서 빠졌거나 서로 안 맞는 부분을 AI가 찾아줘요. 미리 잡으면 나중에 고생을 덜어요."
      example="예: '이미지 파일을 받는데 OCR 도구가 안 정해졌어요'"
    />
  )

  useEffect(() => {
    if (autoGenRef.current || gapsData || generating) return
    autoGenRef.current = true
    onGenerate()
  }, [gapsData, generating, onGenerate])

  if (!gapsData && !generating) {
    return (
      <div className="pb-7">
        {explainer}
        {autoGenRef.current
          ? <StepRetry message="빈틈 점검을 생성하지 못했어요." onRetry={onGenerate} />
          : <StepLoading />}
      </div>
    )
  }
  if (generating) {
    return <div className="pb-7">{explainer}<StepLoading /></div>
  }

  const gaps = gapsData!.gaps ?? []

  if (gaps.length === 0) {
    return (
      <div className="pb-7">
        {explainer}
        <div className="text-center py-10 bg-green-soft rounded-xl">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-[13px] font-semibold text-green">명확한 빈틈이나 모순이 발견되지 않았어요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-7">
      {explainer}

      <div className="text-[13px] font-bold text-text mb-1.5">발견된 항목 {gaps.length}개</div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        착수 전에 확인하거나 해결하면 좋은 부분이에요.
      </p>

      <div className="flex flex-col gap-2">
        {gaps.map((g, i) => {
          const sev = SEVERITY[g.severity] ?? SEVERITY.medium
          return (
            <div key={i} className="p-[12px_14px] bg-surface border border-border rounded-[10px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{TYPE_EMOJI[g.type] ?? '•'}</span>
                <span className="text-[13px] font-semibold text-text">{g.category}</span>
                <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${sev.cls}`}>{sev.label}</span>
                <span className="text-[10.5px] text-text-subtle font-mono ml-auto">{g.type}</span>
              </div>
              <div className="text-[12.5px] text-text leading-relaxed mb-1.5">{g.issue}</div>
              {g.suggestion && (
                <div className="text-xs text-accent leading-relaxed">→ {g.suggestion}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
