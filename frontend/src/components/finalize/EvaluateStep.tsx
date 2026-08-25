import { useEffect, useRef } from 'react'
import Explainer from '../design/Explainer'
import { StepLoading, StepRetry } from './FinalizeStates'
import type { FinalizeSession, FinalizeLevel, Evaluation } from '../design/types'

interface Props {
  session: FinalizeSession | null
  generating: boolean
  onGenerate: () => void
  onUpdate?: (evaluation: Evaluation) => void
}

const LEVEL: Record<FinalizeLevel, { emoji: string; cls: string; label: string }> = {
  green: { emoji: '🟢', cls: 'text-green bg-green-soft', label: '적합' },
  yellow: { emoji: '🟡', cls: 'text-amber bg-amber-soft', label: '조건부' },
  red: { emoji: '🔴', cls: 'text-red bg-red-soft', label: '재검토' },
}

export default function EvaluateStep({ session, generating, onGenerate, onUpdate }: Props) {
  const evaluation = session?.evaluation
  const autoGenRef = useRef(false)

  const explainer = (
    <Explainer
      title="정직한 평가"
      technical="Honest Evaluation"
      plain="이 프로젝트가 정말 괜찮은지 6가지 기준으로 솔직하게 점검해요. 좋은 점뿐 아니라 고쳐야 할 점도 알려드려요."
      example="차별화 · 실현 가능성 · 리스크 등을 🟢 적합 / 🟡 조건부 / 🔴 재검토로 평가"
    />
  )

  useEffect(() => {
    if (autoGenRef.current || evaluation || generating) return
    autoGenRef.current = true
    onGenerate()
  }, [evaluation, generating, onGenerate])

  if (!evaluation && !generating) {
    return (
      <div className="pb-7">
        {explainer}
        {autoGenRef.current
          ? <StepRetry message="평가를 생성하지 못했어요." onRetry={onGenerate} />
          : <StepLoading />}
      </div>
    )
  }
  if (generating) {
    return <div className="pb-7">{explainer}<StepLoading /></div>
  }

  const overall = LEVEL[evaluation!.overall_level] ?? LEVEL.yellow

  function removeDimension(idx: number) {
    onUpdate?.({ ...evaluation!, dimensions: evaluation!.dimensions.filter((_, i) => i !== idx) })
  }

  function dismissRecommendation() {
    onUpdate?.({ ...evaluation!, recommendation: '' })
  }

  return (
    <div className="pb-7">
      {explainer}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-bold text-text">종합 판정</span>
        <span className={`text-[11px] font-semibold px-2 py-[3px] rounded ${overall.cls}`}>
          {overall.emoji} {overall.label}
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {evaluation!.dimensions.length === 0 && (
          <div className="text-center py-6 bg-surface-alt rounded-xl">
            <p className="text-[12.5px] text-text-muted">모든 평가 항목을 제외했어요.</p>
          </div>
        )}
        {evaluation!.dimensions.map((d, i) => {
          const lv = LEVEL[d.level] ?? LEVEL.yellow
          return (
            <div
              key={i}
              className={`flex gap-3 p-[12px_14px] bg-surface border border-border rounded-[10px] items-start ${
                d.applicable ? '' : 'opacity-50'
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">{d.applicable ? lv.emoji : '➖'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text">{d.name}</span>
                  {d.applicable && (
                    <span className={`text-[10.5px] font-mono font-bold px-1.5 py-0.5 rounded ${lv.cls}`}>
                      {d.score}/10
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-[3px] leading-relaxed">
                  {d.applicable ? d.comment : '해당 없음'}
                </div>
              </div>
              {onUpdate && (
                <button
                  type="button"
                  onClick={() => removeDimension(i)}
                  className="text-[11px] text-text-subtle cursor-pointer bg-transparent border-none hover:text-red shrink-0"
                  aria-label="제외"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>

      {evaluation!.recommendation && (
        <div className="p-[14px_16px] bg-accent-soft rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[11px] font-mono font-bold text-accent-deep">AI 권고</div>
            {onUpdate && (
              <button
                type="button"
                onClick={dismissRecommendation}
                className="text-[11px] text-accent-deep cursor-pointer bg-transparent border-none hover:text-red shrink-0"
                aria-label="제외"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-[13px] text-accent-deep leading-relaxed">{evaluation!.recommendation}</div>
        </div>
      )}
    </div>
  )
}
