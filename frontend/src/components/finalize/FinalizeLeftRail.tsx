import AiMark from '../interview/AiMark'
import Badge from '../common/Badge'
import DesignIcon from '../design/DesignIcon'
import { FINALIZE_STEPS, type FinalizeStepId, type DesignStepStatus } from '../design/types'

interface FinalizeLeftRailProps {
  project: { name: string; type: string; language: string }
  activeStep: FinalizeStepId
  stepStatuses: Record<FinalizeStepId, DesignStepStatus>
  onStepClick?: (stepId: FinalizeStepId) => void
  disabled?: boolean
}

export default function FinalizeLeftRail({ project, activeStep, stepStatuses, onStepClick, disabled = false }: FinalizeLeftRailProps) {
  const activeIdx = FINALIZE_STEPS.findIndex((s) => s.id === activeStep)
  const doneCount = FINALIZE_STEPS.filter((s) => stepStatuses[s.id] === 'done').length
  const progressText = `${doneCount}/${FINALIZE_STEPS.length}`

  return (
    <div className="w-[264px] border-r border-border bg-surface px-[18px] py-[22px] overflow-auto shrink-0">
      <div className="flex items-center gap-2.5 pb-4 border-b border-border">
        <AiMark size={36} />
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.2 }}>
            마무리 단계
          </div>
          <div className="text-[11.5px] text-text-muted mt-0.5 flex items-center gap-1.5">
            <span className="w-[5px] h-[5px] rounded-full bg-green" style={{ boxShadow: '0 0 0 3px var(--color-green-soft)' }} />
            Phase 3 of 3
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10.5px] text-text-subtle font-mono mb-1.5" style={{ letterSpacing: 0.4 }}>
          PROJECT
        </div>
        <div className="text-[14.5px] font-semibold text-text" style={{ letterSpacing: -0.2 }}>
          {project.name}
        </div>
        <div className="flex gap-1.5 mt-2">
          {project.type && <Badge variant="accent">{project.type}</Badge>}
          <Badge variant="muted">{project.language}</Badge>
        </div>
      </div>

      <div className="mt-[18px] p-3.5 bg-accent-soft rounded-xl" style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-accent-deep font-bold" style={{ letterSpacing: 0.5 }}>
            전체 진행률
          </span>
          <span className="text-[11px] text-accent-deep font-mono font-semibold">{progressText}</span>
        </div>
        <div className="h-[5px] bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(doneCount / FINALIZE_STEPS.length) * 100}%` }} />
        </div>
        <div className="mt-2 text-[11px] text-accent-deep opacity-85">
          평가 · 마무리 4단계
        </div>
      </div>

      <div className="mt-[22px]">
        <div className="text-[10.5px] text-text-subtle font-mono mb-2.5" style={{ letterSpacing: 0.4 }}>
          FINALIZE STEPS
        </div>
        <div className="flex flex-col gap-1">
          {FINALIZE_STEPS.map((step, i) => {
            const isActive = step.id === activeStep
            const status = stepStatuses[step.id]
            const isDone = status === 'done'
            const isClickable = (isDone || isActive || i <= activeIdx) && !disabled

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={`flex gap-2.5 p-[10px_11px] rounded-[9px] items-start text-left border-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                } ${isActive ? 'bg-accent-soft' : 'bg-transparent'}`}
                style={{
                  border: isActive ? '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)' : '1px solid transparent',
                  opacity: isClickable ? 1 : 0.5,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? 'var(--color-accent)' : isDone ? 'var(--color-green-soft)' : 'var(--color-surface-alt)',
                    color: isActive ? '#fff' : isDone ? 'var(--color-green)' : 'var(--color-text-muted)',
                  }}
                >
                  {isDone ? <DesignIcon kind="check" size={14} /> : <DesignIcon kind={step.icon} size={15} />}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] font-mono text-text-subtle font-bold">{step.num}</span>
                    <span className={`text-[13px] ${isActive ? 'font-bold text-accent-deep' : 'font-semibold text-text'}`}>
                      {step.title}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isActive ? 'text-accent opacity-85' : 'text-text-subtle'}`}>
                    {step.subtitle}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
