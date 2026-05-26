import type { ReactNode } from 'react'

type TagTone = 'neutral' | 'accent' | 'amber' | 'green' | 'red'

interface TagProps {
  tone?: TagTone
  children: ReactNode
}

const TONE_CLS: Record<TagTone, string> = {
  neutral: 'bg-surface-alt text-text-muted border-border',
  accent: 'bg-accent-soft text-accent-deep border-transparent',
  amber: 'bg-amber-soft text-amber border-transparent',
  green: 'bg-green-soft text-green border-transparent',
  red: 'bg-red-soft text-red border-transparent',
}

export default function Tag({ tone = 'neutral', children }: TagProps) {
  return (
    <span className={`inline-flex items-center gap-[5px] text-[11.5px] font-medium px-2 py-[3px] rounded-[5px] border ${TONE_CLS[tone]}`}>
      {children}
    </span>
  )
}
