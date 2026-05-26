import DesignIcon from './DesignIcon'

interface AiSuggestionListProps {
  items: string[]
  onAdd?: (item: string, index: number) => void
}

export default function AiSuggestionList({ items, onAdd }: AiSuggestionListProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-3.5">
      <div
        className="text-[11px] font-mono text-accent font-bold mb-2.5 flex items-center gap-1.5"
        style={{ letterSpacing: 0.4 }}
      >
        <DesignIcon kind="bulb" size={12} color="var(--color-accent)" />
        AI 추천 — 클릭으로 추가
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((text, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAdd?.(text, i)}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-surface-alt border border-border rounded-lg cursor-pointer text-left"
            style={{ fontFamily: 'inherit' }}
          >
            <span
              className="w-5 h-5 rounded-full bg-surface text-accent flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ border: '1.5px dashed color-mix(in srgb, var(--color-accent) 31%, transparent)' }}
            >
              +
            </span>
            <span className="text-[13px] text-text flex-1">{text}</span>
            <span className="text-[11px] text-text-subtle">추가</span>
          </button>
        ))}
      </div>
    </div>
  )
}
