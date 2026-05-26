import DesignIcon from './DesignIcon'

interface ExplainerProps {
  title: string
  plain: string
  technical?: string
  example?: string
}

export default function Explainer({ title, plain, technical, example }: ExplainerProps) {
  return (
    <div className="bg-accent-soft rounded-xl px-4 py-3.5 mb-[18px]" style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 12%, transparent)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-md bg-surface flex items-center justify-center text-accent"
          style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
        >
          <DesignIcon kind="help" size={13} />
        </div>
        <span className="text-xs font-bold text-accent-deep" style={{ letterSpacing: -0.1 }}>
          이게 뭐예요?
        </span>
        <span className="flex-1" />
        {technical && (
          <span className="text-[10.5px] font-mono text-accent opacity-70 px-[7px] py-0.5 bg-surface rounded">
            {technical}
          </span>
        )}
      </div>
      <div className="text-[13px] text-accent-deep font-semibold mb-1">{title}</div>
      <p className="text-[12.5px] text-accent opacity-90 leading-relaxed m-0">{plain}</p>
      {example && (
        <div
          className="mt-2.5 pt-2.5 text-[11.5px] text-accent opacity-85 leading-relaxed"
          style={{ borderTop: '1px dashed color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
        >
          <strong className="font-bold">예시</strong> · {example}
        </div>
      )}
    </div>
  )
}
