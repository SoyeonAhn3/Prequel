import type { ReactNode } from 'react'
import AiMarkD from './AiMarkD'
import DesignIcon from './DesignIcon'

interface AiQuestionProps {
  children: ReactNode
  hint?: string
}

export default function AiQuestion({ children, hint }: AiQuestionProps) {
  return (
    <div className="flex gap-3.5 items-start mb-[18px]">
      <AiMarkD size={36} />
      <div
        className="flex-1 bg-surface rounded-[14px] px-[22px] py-[18px]"
        style={{
          border: '1.5px solid var(--color-accent)',
          boxShadow: '0 1px 0 rgba(0,0,0,.02), 0 8px 24px -14px color-mix(in srgb, var(--color-accent) 25%, transparent)',
        }}
      >
        <div
          className="text-[10.5px] text-accent font-bold font-mono mb-2 flex items-center gap-1.5"
          style={{ letterSpacing: 0.4 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            style={{ boxShadow: '0 0 0 4px var(--color-accent-soft)' }}
          />
          AI가 묻는 질문
        </div>
        <div className="text-[15.5px] font-semibold leading-relaxed text-text" style={{ letterSpacing: -0.1 }}>
          {children}
        </div>
        {hint && (
          <div className="mt-3 px-3 py-[9px] bg-accent-soft rounded-lg text-xs text-accent-deep leading-relaxed flex gap-2">
            <DesignIcon kind="bulb" size={12} color="var(--color-accent)" />
            {hint}
          </div>
        )}
      </div>
    </div>
  )
}
