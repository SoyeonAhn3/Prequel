interface DesignStepHeaderProps {
  stepNum: string
  stepName: string
  title: string
  subtitle?: string
  currentQ?: number
  totalQ?: number
}

export default function DesignStepHeader({ stepNum, stepName, title, subtitle, currentQ, totalQ }: DesignStepHeaderProps) {
  return (
    <div className="px-6 pt-[22px] pb-[18px] bg-surface border-b border-border">
      <div className="flex items-center gap-2 text-[11px] text-text-subtle font-mono mb-1.5" style={{ letterSpacing: 0.4 }}>
        <span>설계 · STEP {stepNum}</span>
        <span>›</span>
        <span className="text-accent font-bold">{stepName}</span>
        <span className="flex-1" />
        {currentQ !== undefined && totalQ !== undefined && (
          <span className="text-text-muted font-semibold">질문 {currentQ} / {totalQ}</span>
        )}
      </div>
      <h2 className="text-[22px] font-bold text-text m-0" style={{ letterSpacing: -0.3 }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13.5px] text-text-muted leading-relaxed mt-2 mb-0 max-w-[720px]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
