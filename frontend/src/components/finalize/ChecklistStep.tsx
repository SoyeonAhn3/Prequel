import { useEffect, useRef, useState } from 'react'
import Explainer from '../design/Explainer'
import DesignIcon from '../design/DesignIcon'
import { StepLoading, StepRetry } from './FinalizeStates'
import type { FinalizeSession, ChecklistItem } from '../design/types'

interface Props {
  session: FinalizeSession | null
  generating: boolean
  onGenerate: () => void
}

export default function ChecklistStep({ session, generating, onGenerate }: Props) {
  const checklistData = session?.checklist
  const autoGenRef = useRef(false)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const explainer = (
    <Explainer
      title="착수 체크리스트"
      technical="Kickoff Checklist"
      plain="개발을 시작하기 전에 준비해야 할 것들을 정리했어요. 하나씩 체크하면서 준비하면 돼요."
      example="예: 'Python 3.12 설치', 'OpenAI API 키 발급', 'DB 생성'"
    />
  )

  useEffect(() => {
    if (autoGenRef.current || checklistData || generating) return
    autoGenRef.current = true
    onGenerate()
  }, [checklistData, generating, onGenerate])

  if (!checklistData && !generating) {
    return (
      <div className="pb-7">
        {explainer}
        {autoGenRef.current
          ? <StepRetry message="체크리스트를 생성하지 못했어요." onRetry={onGenerate} />
          : <StepLoading />}
      </div>
    )
  }
  if (generating) {
    return <div className="pb-7">{explainer}<StepLoading /></div>
  }

  const items = checklistData!.items ?? []
  const byArea = items.reduce<Record<string, { item: ChecklistItem; idx: number }[]>>((acc, item, idx) => {
    (acc[item.area] ??= []).push({ item, idx })
    return acc
  }, {})
  const doneCount = items.filter((_, i) => checked[i]).length

  return (
    <div className="pb-7">
      {explainer}

      <div className="flex items-center gap-2 mb-3.5">
        <span className="text-[13px] font-bold text-text">준비 항목 {items.length}개</span>
        <span className="text-[11px] text-text-muted font-mono">{doneCount}/{items.length} 완료</span>
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(byArea).map(([area, group]) => (
          <div key={area}>
            <div className="text-[11.5px] font-bold text-text-muted mb-1.5">{area}</div>
            <div className="flex flex-col gap-1.5">
              {group.map(({ item, idx }) => {
                const isChecked = !!checked[idx]
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChecked((p) => ({ ...p, [idx]: !p[idx] }))}
                    className="flex gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg items-start text-left cursor-pointer w-full"
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-[5px] shrink-0 mt-0.5 flex items-center justify-center border-[1.5px] ${
                        isChecked ? 'bg-green border-green' : 'border-border-strong'
                      }`}
                    >
                      {isChecked && <DesignIcon kind="check" size={11} color="#fff" />}
                    </span>
                    <span className={`text-[13px] flex-1 leading-relaxed ${isChecked ? 'text-text-subtle line-through' : 'text-text'}`}>
                      {item.task}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
