import { useEffect, useRef } from 'react'
import Explainer from '../design/Explainer'
import DesignIcon from '../design/DesignIcon'
import { StepLoading, StepRetry } from './FinalizeStates'
import type { FinalizeSession, DoneCriterion, DoneCriteria } from '../design/types'

interface Props {
  session: FinalizeSession | null
  generating: boolean
  onGenerate: () => void
  onUpdate?: (done: DoneCriteria) => void
}

export default function DoneStep({ session, generating, onGenerate, onUpdate }: Props) {
  const done = session?.done_criteria
  const autoGenRef = useRef(false)

  const explainer = (
    <Explainer
      title="완료 조건 (Definition of Done)"
      technical="Definition of Done"
      plain="'어디까지 하면 끝났다고 할 수 있는지'를 측정 가능한 조건으로 정리해요. 나중에 이 목록으로 완성 여부를 체크합니다."
      example="예: '핵심 유저 플로우(가입→로그인→주요 기능)가 정상 동작한다'"
    />
  )

  useEffect(() => {
    if (autoGenRef.current || done || generating) return
    autoGenRef.current = true
    onGenerate()
  }, [done, generating, onGenerate])

  if (!done && !generating) {
    return (
      <div className="pb-7">
        {explainer}
        {autoGenRef.current
          ? <StepRetry message="완료 조건을 생성하지 못했어요." onRetry={onGenerate} />
          : <StepLoading />}
      </div>
    )
  }
  if (generating) {
    return <div className="pb-7">{explainer}<StepLoading /></div>
  }

  const criteria = done!.criteria ?? []
  const byCategory = criteria.reduce<Record<string, { c: DoneCriterion; idx: number }[]>>((acc, c, idx) => {
    (acc[c.category] ??= []).push({ c, idx })
    return acc
  }, {})

  function remove(idx: number) {
    onUpdate?.({ criteria: criteria.filter((_, i) => i !== idx) })
  }

  return (
    <div className="pb-7">
      {explainer}

      <div className="text-[13px] font-bold text-text mb-1.5">완료 조건 {criteria.length}개</div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        각 항목이 모두 충족되면 이 프로젝트는 완성된 거예요. 불필요한 항목은 ✕로 삭제할 수 있어요.
      </p>

      <div className="flex flex-col gap-4">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <div className="text-[11.5px] font-bold text-text-muted mb-1.5">{category}</div>
            <div className="flex flex-col gap-1.5">
              {items.map(({ c, idx }) => (
                <div key={idx} className="flex gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg items-start">
                  <span className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-border-strong shrink-0 mt-0.5 flex items-center justify-center">
                    <DesignIcon kind="check" size={11} color="var(--color-text-subtle)" />
                  </span>
                  <span className="text-[13px] text-text flex-1 leading-relaxed">{c.text}</span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-[11px] text-text-subtle cursor-pointer bg-transparent border-none hover:text-red shrink-0 mt-0.5"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
