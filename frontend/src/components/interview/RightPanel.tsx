import { FileText, Eye, Lock } from 'lucide-react'
import Badge from '../common/Badge'
import type { CapturedInsight } from './types'

interface RightPanelProps {
  captured: CapturedInsight[]
  totalExpected?: number
  lastSavedLabel?: string
}

export default function RightPanel({ captured, totalExpected, lastSavedLabel }: RightPanelProps) {
  const completedCount = captured.filter((c) => !c.pending).length

  return (
    <div className="w-[284px] border-l border-border bg-surface px-[18px] py-[22px] overflow-auto shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <FileText size={15} className="text-accent" />
        <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.1 }}>
          수집된 정보
        </div>
        <div className="flex-1" />
        <Badge variant="accent">{completedCount}/{totalExpected ?? captured.length}</Badge>
      </div>
      <div className="text-[11.5px] text-text-muted leading-relaxed">
        답변에 따라 자동으로 킥오프 문서가 작성됩니다
      </div>

      {/* Cards */}
      <div className="mt-4 flex flex-col gap-2">
        {captured.map((item, i) => {
          if (item.pending) {
            return (
              <div
                key={i}
                className="p-[11px_13px] rounded-[9px]"
                style={{
                  border: '1px dashed color-mix(in srgb, var(--color-accent) 50%, transparent)',
                  background: 'color-mix(in srgb, var(--color-accent-soft) 40%, transparent)',
                }}
              >
                <div className="text-[10.5px] font-mono text-accent mb-1 font-bold" style={{ letterSpacing: 0.4 }}>
                  {item.label.toUpperCase()}
                </div>
                <div className="text-[12.5px] text-accent-deep leading-relaxed flex items-center gap-1">
                  <span className="inline-flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1 h-1 rounded-full bg-accent animate-pulse"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </span>
                  답변 중
                </div>
              </div>
            )
          }

          return (
            <div
              key={i}
              className={`p-[11px_13px] rounded-[9px] relative ${
                item.isNew
                  ? 'bg-green-soft'
                  : 'bg-surface-alt'
              }`}
              style={{
                border: item.isNew
                  ? '1px solid color-mix(in srgb, var(--color-green) 20%, transparent)'
                  : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="text-[10.5px] font-mono text-text-subtle flex-1" style={{ letterSpacing: 0.4 }}>
                  {item.label.toUpperCase()}
                </div>
                {item.isNew && (
                  <span
                    className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-green text-white"
                    style={{ letterSpacing: 0.3 }}
                  >
                    NEW
                  </span>
                )}
              </div>
              <div className="text-[12.5px] text-text font-medium leading-relaxed">{item.value}</div>
            </div>
          )
        })}
      </div>

      {/* Document preview button */}
      <button
        className="w-full mt-4 px-3 py-2.5 bg-surface text-accent font-semibold rounded-[9px] cursor-pointer flex items-center justify-center gap-2 text-[12.5px] hover:bg-accent-soft transition-colors"
        style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)' }}
      >
        <Eye size={13} />
        문서 미리보기
      </button>

      {/* Auto-save indicator */}
      <div
        className="mt-3.5 p-3 bg-accent-soft rounded-[10px] text-[11.5px] text-accent-deep leading-relaxed"
        style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 10%, transparent)' }}
      >
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Lock size={11} />
          자동 저장됨 · {lastSavedLabel ?? '방금 전'}
        </div>
        <div className="opacity-85">브라우저를 닫아도 안전합니다</div>
      </div>
    </div>
  )
}
