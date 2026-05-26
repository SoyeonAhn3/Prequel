import { useState } from 'react'
import AiQuestion from './AiQuestion'
import AiSuggestionList from './AiSuggestionList'
import DesignIcon from './DesignIcon'
import Btn from '../common/Btn'
import type { DesignSession, Requirement } from './types'

interface RequirementsStepProps {
  session: DesignSession | null
  generating: boolean
  onGenerate: () => void
}

const PRIORITY_STYLE: Record<string, { label: string; cls: string }> = {
  must: { label: 'Must', cls: 'text-red bg-red-soft' },
  should: { label: 'Should', cls: 'text-accent bg-accent-soft' },
  could: { label: 'Could', cls: 'text-text-muted bg-surface-alt' },
}

export default function RequirementsStep({ session, generating, onGenerate }: RequirementsStepProps) {
  const requirements = session?.requirements
  const [inputValue, setInputValue] = useState('')
  const [localItems, setLocalItems] = useState<string[]>([])

  function addItem(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setLocalItems((prev) => [...prev, trimmed])
    setInputValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem(inputValue)
    }
  }

  if (!requirements && !generating) {
    return (
      <div className="pb-7">
        <AiQuestion hint="크게 3~5가지 정도면 충분해요. '이건 할 수 있어야 해' 정도의 큰 덩어리로 적으세요.">
          사용자가 이 도구를 사용하면서 <strong className="text-accent">꼭 할 수 있어야 하는 일</strong>이 무엇인가요?
        </AiQuestion>

        {/* Empty state or local items */}
        {localItems.length === 0 ? (
          <div className="px-6 py-8 bg-surface border border-dashed border-border-strong rounded-xl text-center mb-[18px]">
            <div className="w-11 h-11 rounded-[10px] bg-surface-alt text-text-subtle flex items-center justify-center mx-auto mb-3">
              <DesignIcon kind="features" size={22} />
            </div>
            <div className="text-[13.5px] font-semibold text-text mb-1">아직 추가된 기능이 없어요</div>
            <div className="text-xs text-text-muted leading-relaxed">직접 입력하거나, 아래 AI 추천에서 골라보세요</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-[18px]">
            {localItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0 text-accent bg-accent-soft">Must</span>
                <span className="text-[13px] text-text flex-1">{item}</span>
                <button
                  type="button"
                  onClick={() => setLocalItems((prev) => prev.filter((_, j) => j !== i))}
                  className="text-[11px] text-text-subtle cursor-pointer bg-transparent border-none hover:text-red"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <AiSuggestionList
          items={[
            '매주 정해진 요일에 Slack DM으로 추천 책을 받는다',
            '받은 추천 책에 "관심 있어요 / 별로예요" 피드백을 남긴다',
            '관리자가 부서별 인기 도서 큐레이션 규칙을 편집한다',
            '본인이 이미 읽은 책을 표시해 다시 추천되지 않도록 한다',
            '추천 히스토리를 월별로 모아볼 수 있다',
            '부서별 인기 도서 Top 10 리스트를 확인할 수 있다',
            '추천 알림 빈도(주 1회/2회)를 사용자가 직접 설정한다',
          ]}
          onAdd={(item) => addItem(item)}
        />

        {/* Input area */}
        <div className="bg-surface border-[1.5px] border-border-strong rounded-xl p-[12px_14px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="직접 입력하기 — 예: 사용자가 추천 기록을 모두 볼 수 있다"
            className="w-full text-[11.5px] text-text bg-transparent border-none outline-none placeholder:text-text-subtle"
            style={{ fontFamily: 'inherit' }}
          />
          <div className="flex items-center gap-2 mt-1.5 pt-2 border-t border-border">
            <span className="text-[11px] text-text-subtle font-mono">Enter로 추가</span>
            <div className="flex-1" />
            <Btn kind="primary" size="sm" onClick={() => addItem(inputValue)}>+ 추가</Btn>
          </div>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="pb-7">
        <AiQuestion>AI가 인터뷰 내용을 분석해서 기능 목록을 만들고 있습니다...</AiQuestion>
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">약 15초 소요됩니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-7">
      <AiQuestion>
        인터뷰 내용을 바탕으로 <strong className="text-accent">{requirements!.length}개의 기능</strong>을 정리했어요. 확인하고 수정해주세요.
      </AiQuestion>

      <div className="flex flex-col gap-2.5 mb-4">
        {requirements!.map((req) => (
          <RequirementCard key={req.id} requirement={req} />
        ))}
      </div>

      {/* Input area */}
      <div className="bg-surface border-[1.5px] border-border-strong rounded-xl p-[12px_14px]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="추가 기능 입력 — 예: 사용자가 추천 기록을 모두 볼 수 있다"
          className="w-full text-[11.5px] text-text bg-transparent border-none outline-none placeholder:text-text-subtle"
          style={{ fontFamily: 'inherit' }}
        />
        <div className="flex items-center gap-2 mt-1.5 pt-2 border-t border-border">
          <span className="text-[11px] text-text-subtle font-mono">Enter로 추가</span>
          <div className="flex-1" />
          <Btn kind="primary" size="sm" onClick={() => addItem(inputValue)}>+ 추가</Btn>
        </div>
      </div>
    </div>
  )
}

function RequirementCard({ requirement }: { requirement: Requirement }) {
  const p = PRIORITY_STYLE[requirement.priority] ?? PRIORITY_STYLE.could

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg">
      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0 ${p.cls}`}>
        {p.label}
      </span>
      <span className="text-[13px] text-text flex-1">{requirement.text}</span>
      {requirement.category && (
        <span className="text-[10.5px] font-mono text-text-subtle px-[7px] py-0.5 bg-surface-alt rounded">
          {requirement.category}
        </span>
      )}
    </div>
  )
}
