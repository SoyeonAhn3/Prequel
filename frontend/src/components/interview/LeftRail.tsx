import { Clock, Check } from 'lucide-react'
import AiMark from './AiMark'
import Badge from '../common/Badge'
import type { InterviewStep, ProgressInfo } from './types'

interface LeftRailProps {
  project: { name: string; type: string; language: string }
  steps: InterviewStep[]
  progress: ProgressInfo
}

export default function LeftRail({ project, steps, progress }: LeftRailProps) {
  const progressPercent = Math.round((progress.current / progress.total) * 100)

  return (
    <div className="w-[268px] border-r border-border bg-surface px-[18px] py-[22px] overflow-auto shrink-0">
      {/* AI persona */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-border">
        <AiMark size={36} />
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.2 }}>
            Prequel
          </div>
          <div className="text-[11.5px] text-text-muted mt-0.5 flex items-center gap-1.5">
            <span
              className="w-[5px] h-[5px] rounded-full bg-green"
              style={{ boxShadow: '0 0 0 3px var(--color-green-soft)' }}
            />
            인터뷰 진행 중
          </div>
        </div>
      </div>

      {/* Project meta */}
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

      {/* Progress card */}
      <div
        className="mt-[18px] p-3.5 bg-accent-soft rounded-xl"
        style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-mono text-accent-deep font-bold" style={{ letterSpacing: 0.5 }}>
            PHASE {progress.phase} of {progress.totalPhases}
          </span>
          <div className="flex-1" />
          <div className="flex gap-[3px]">
            {Array.from({ length: progress.totalPhases }).map((_, i) => (
              <span
                key={i}
                className="w-[18px] h-[3px] rounded-sm"
                style={{
                  background: i < progress.phase
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-accent font-mono leading-none" style={{ letterSpacing: -0.8 }}>
            {progress.current}
          </span>
          <span className="text-sm font-mono" style={{ color: 'color-mix(in srgb, var(--color-accent-deep) 60%, transparent)' }}>
            / {progress.total}
          </span>
          <div className="flex-1" />
          <span className="text-[11px] text-accent-deep font-semibold">{progress.phaseLabel}</span>
        </div>

        <div className="h-[5px] bg-surface rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-2.5 text-[11px] text-accent-deep flex items-center gap-1.5 opacity-85">
          <Clock size={11} />
          남은 시간 {progress.remainingTime}
        </div>
      </div>

      {/* Vertical stepper */}
      <div className="mt-[22px] relative">
        <div className="text-[10.5px] text-text-subtle font-mono mb-3" style={{ letterSpacing: 0.4 }}>
          STEPS
        </div>
        <div className="absolute left-[8.5px] top-8 bottom-2 w-px bg-border" />

        {steps.map((step, i) => {
          const isActive = step.status === 'active'
          const isDone = step.status === 'done'

          return (
            <div key={i} className="flex gap-2.5 py-1.5 items-start">
              <div
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 relative z-[1]"
                style={{
                  background: isDone
                    ? 'var(--color-green)'
                    : isActive
                      ? 'var(--color-accent)'
                      : 'var(--color-surface)',
                  color: isDone || isActive ? '#fff' : 'var(--color-text-subtle)',
                  border: !isDone && !isActive ? '1.5px solid var(--color-border-strong)' : 'none',
                  boxShadow: isActive ? '0 0 0 4px var(--color-accent-soft)' : 'none',
                }}
              >
                {isDone ? (
                  <Check size={10} strokeWidth={3.5} />
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                ) : (
                  <span className="text-[9.5px] font-bold font-mono">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 pt-px min-w-0">
                <div
                  className={`text-[13px] leading-tight ${
                    isActive ? 'font-semibold text-text' : isDone ? 'font-medium text-text' : 'font-medium text-text-subtle'
                  }`}
                >
                  {step.title}
                </div>
                {isActive && step.questionIndex != null && (
                  <div className="text-[11px] text-accent font-semibold mt-1 font-mono">
                    질문 {step.questionIndex}/{step.questionTotal}
                  </div>
                )}
                {isDone && step.summary && (
                  <div className="text-[11px] text-text-muted mt-0.5 italic truncate">
                    {step.summary}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
