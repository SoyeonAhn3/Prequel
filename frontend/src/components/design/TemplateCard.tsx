import DesignIcon from './DesignIcon'

interface TemplateCardProps {
  title: string
  desc: string
  badge?: string
  selected?: boolean
  onClick?: () => void
}

export default function TemplateCard({ title, desc, badge, selected = false, onClick }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-[14px_16px] rounded-[10px] cursor-pointer text-left relative transition-all border-none ${
        selected ? 'bg-accent-soft' : 'bg-surface'
      }`}
      style={{
        border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
      }}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
          <DesignIcon kind="check" size={11} />
        </div>
      )}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`text-[13.5px] font-bold ${selected ? 'text-accent-deep' : 'text-text'}`}>
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-alt text-accent rounded font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div
        className={`text-[11.5px] leading-relaxed ${selected ? 'text-accent opacity-90 pr-6' : 'text-text-muted'}`}
      >
        {desc}
      </div>
    </button>
  )
}
