import Btn from '../common/Btn'

interface DesignStepFooterProps {
  canBack?: boolean
  primaryLabel?: string
  onBack?: () => void
  onSkip?: () => void
  onNext?: () => void
  loading?: boolean
  lastSavedLabel?: string
}

export default function DesignStepFooter({
  canBack = true,
  primaryLabel = '다음 단계',
  onBack,
  onSkip,
  onNext,
  loading = false,
  lastSavedLabel = '자동 저장됨',
}: DesignStepFooterProps) {
  const arrowIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )

  return (
    <div className="px-6 py-3.5 bg-surface border-t border-border flex items-center gap-2.5">
      {canBack && (
        <Btn kind="ghost" size="md" onClick={onBack}>← 이전</Btn>
      )}
      <span className="flex-1" />
      <span className="text-[11.5px] text-text-subtle font-mono flex items-center gap-1.5">
        <span className="w-[5px] h-[5px] rounded-full bg-green" />
        {lastSavedLabel}
      </span>
      <Btn kind="secondary" size="md" onClick={onSkip}>건너뛰기</Btn>
      <Btn kind="primary" size="md" icon={arrowIcon} onClick={onNext} disabled={loading} className="flex-row-reverse">
        {primaryLabel}
      </Btn>
    </div>
  )
}
