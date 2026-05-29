import { useEffect, useRef, useState } from 'react'
import AiQuestion from './AiQuestion'
import DesignIcon from './DesignIcon'
import Btn from '../common/Btn'
import { apiFetch } from '../../lib/api'
import type { DesignSession, Requirement } from './types'

interface RequirementsStepProps {
  session: DesignSession | null
  generating: boolean
  onGenerate: () => void
  onUpdateSession: (s: DesignSession) => void
}

const PRIORITY_STYLE: Record<string, { label: string; cls: string }> = {
  must: { label: 'Must', cls: 'text-red bg-red-soft' },
  should: { label: 'Should', cls: 'text-accent bg-accent-soft' },
  could: { label: 'Could', cls: 'text-text-muted bg-surface-alt' },
}

export default function RequirementsStep({ session, generating, onGenerate, onUpdateSession }: RequirementsStepProps) {
  const requirements = session?.requirements ?? []
  const [inputValue, setInputValue] = useState('')
  const [saving, setSaving] = useState(false)
  const autoTriedRef = useRef(false)

  // AI-first: generate a draft once on entry when the session has no requirements yet.
  // `session.requirements === []` (truthy) counts as "already generated" so we don't loop on empty results.
  useEffect(() => {
    if (autoTriedRef.current || generating) return
    if (session?.requirements) return
    autoTriedRef.current = true
    onGenerate()
  }, [session, generating, onGenerate])

  async function persist(list: Requirement[]) {
    if (!session) return
    setSaving(true)
    try {
      await apiFetch(`/design/requirements/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ requirements: list }),
      })
      onUpdateSession({ ...session, requirements: list })
    } finally {
      setSaving(false)
    }
  }

  function addItem(text: string) {
    const trimmed = text.trim()
    if (!trimmed || !session) return
    const newReq: Requirement = {
      id: `REQ-${Date.now()}`,
      category: '핵심 기능',
      text: trimmed,
      priority: 'must',
      acceptance_criteria: '',
      status: 'accepted',
    }
    setInputValue('')
    void persist([...requirements, newReq])
  }

  function removeItem(id: string) {
    void persist(requirements.filter((r) => r.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem(inputValue)
    }
  }

  const inputArea = (
    <div className="bg-surface border-[1.5px] border-border-strong rounded-xl p-[12px_14px]">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="직접 입력하기 — 예: 사용자가 추천 기록을 모두 볼 수 있다"
        disabled={!session || saving}
        className="w-full text-[11.5px] text-text bg-transparent border-none outline-none placeholder:text-text-subtle disabled:opacity-50"
        style={{ fontFamily: 'inherit' }}
      />
      <div className="flex items-center gap-2 mt-1.5 pt-2 border-t border-border">
        <span className="text-[11px] text-text-subtle font-mono">Enter로 추가</span>
        <div className="flex-1" />
        <Btn kind="primary" size="sm" onClick={() => addItem(inputValue)} disabled={!session || saving}>+ 추가</Btn>
      </div>
    </div>
  )

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

  if (requirements.length === 0) {
    return (
      <div className="pb-7">
        <AiQuestion hint="크게 3~5가지 정도면 충분해요. '이건 할 수 있어야 해' 정도의 큰 덩어리로 적으세요.">
          사용자가 이 도구를 사용하면서 <strong className="text-accent">꼭 할 수 있어야 하는 일</strong>이 무엇인가요?
        </AiQuestion>

        <div className="px-6 py-8 bg-surface border border-dashed border-border-strong rounded-xl text-center mb-[18px]">
          <div className="w-11 h-11 rounded-[10px] bg-surface-alt text-text-subtle flex items-center justify-center mx-auto mb-3">
            <DesignIcon kind="features" size={22} />
          </div>
          <div className="text-[13.5px] font-semibold text-text mb-1">아직 추가된 기능이 없어요</div>
          <div className="text-xs text-text-muted leading-relaxed mb-3.5">AI 추천을 받거나 직접 입력해보세요</div>
          <Btn kind="primary" size="sm" onClick={onGenerate}>AI로 기능 초안 만들기</Btn>
        </div>

        {inputArea}
      </div>
    )
  }

  return (
    <div className="pb-7">
      <AiQuestion>
        인터뷰 내용을 바탕으로 <strong className="text-accent">{requirements.length}개의 기능</strong>을 정리했어요. 확인하고 수정해주세요.
      </AiQuestion>

      <div className="flex flex-col gap-2.5 mb-4">
        {requirements.map((req) => (
          <RequirementCard key={req.id} requirement={req} onRemove={() => removeItem(req.id)} />
        ))}
      </div>

      {inputArea}
    </div>
  )
}

function RequirementCard({ requirement, onRemove }: { requirement: Requirement; onRemove: () => void }) {
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
      <button
        type="button"
        onClick={onRemove}
        className="text-[11px] text-text-subtle cursor-pointer bg-transparent border-none hover:text-red"
      >
        ✕
      </button>
    </div>
  )
}
