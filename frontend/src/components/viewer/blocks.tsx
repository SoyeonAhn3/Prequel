import type { ReactNode } from 'react'

// Dashboard-summary building blocks for the kickoff document preview.
// Gray-minimal tone, Pretendard text, monospace numbers.

export type Tone = 'must' | 'should' | 'could' | 'green' | 'yellow' | 'red' | 'neutral'

const TONE: Record<Tone, { fg: string; bg: string; bar: string; dot: string }> = {
  must: { fg: 'text-red', bg: 'bg-red-soft', bar: 'var(--color-red)', dot: 'var(--color-red)' },
  should: { fg: 'text-accent-deep', bg: 'bg-accent-soft', bar: 'var(--color-accent)', dot: 'var(--color-accent)' },
  could: { fg: 'text-text-subtle', bg: 'bg-surface-alt', bar: 'var(--color-text-subtle)', dot: 'var(--color-text-subtle)' },
  green: { fg: 'text-green', bg: 'bg-green-soft', bar: 'var(--color-green)', dot: 'var(--color-green)' },
  yellow: { fg: 'text-amber', bg: 'bg-amber-soft', bar: 'var(--color-amber)', dot: 'var(--color-amber)' },
  red: { fg: 'text-red', bg: 'bg-red-soft', bar: 'var(--color-red)', dot: 'var(--color-red)' },
  neutral: { fg: 'text-text-muted', bg: 'bg-surface-alt', bar: 'var(--color-text-subtle)', dot: 'var(--color-text-subtle)' },
}

export function priorityTone(priority: string): Tone {
  const p = priority.toUpperCase()
  return p === 'MUST' ? 'must' : p === 'SHOULD' ? 'should' : p === 'COULD' ? 'could' : 'neutral'
}
export function severityTone(sev: string): Tone {
  const s = sev.toLowerCase()
  return s === 'high' ? 'red' : s === 'medium' ? 'yellow' : s === 'low' ? 'green' : 'neutral'
}
export function levelTone(level: string): Tone {
  const l = level.toLowerCase()
  return l === 'green' ? 'green' : l === 'yellow' ? 'yellow' : l === 'red' ? 'red' : 'neutral'
}

// ─── Chip ─────────────────────────────────────────────────
export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  const t = TONE[tone]
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-mono font-semibold whitespace-nowrap ${t.fg} ${t.bg}`}
      style={{ letterSpacing: 0.2 }}
    >
      {children}
    </span>
  )
}

// ─── A. Stat strip ────────────────────────────────────────
export interface Stat {
  value: ReactNode
  label: string
  tone?: Tone
}
export function StatStrip({ items, valueSize = 'text-[22px]' }: { items: Stat[]; valueSize?: string }) {
  return (
    <div className="flex items-stretch rounded-xl border border-border bg-surface overflow-hidden mb-5">
      {items.map((it, i) => (
        <div key={i} className={`flex-1 min-w-0 px-4 py-3 ${i > 0 ? 'border-l border-border' : ''}`}>
          {typeof it.value === 'string' || typeof it.value === 'number' ? (
            <div
              className={`${valueSize} font-bold font-mono leading-none truncate ${it.tone ? TONE[it.tone].fg : 'text-text'}`}
              style={{ letterSpacing: -0.5 }}
            >
              {it.value}
            </div>
          ) : (
            <div className="leading-none">{it.value}</div>
          )}
          <div className="text-[11px] text-text-subtle mt-1.5 truncate">{it.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── B. Data table ────────────────────────────────────────
export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface mb-2">
      <table className="w-full border-collapse text-[12.5px]">
        <thead className="bg-surface-alt">
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 font-semibold text-text-muted text-[11px] border-b border-border whitespace-nowrap"
                style={{ letterSpacing: 0.2 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="align-top last:[&>td]:border-b-0">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border-b border-border text-text leading-relaxed"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── C. Meter row ─────────────────────────────────────────
export function MeterRow({
  label,
  score,
  max = 10,
  tone = 'neutral',
  sub,
}: {
  label: string
  score: number | null
  max?: number
  tone?: Tone
  sub?: ReactNode
}) {
  const pct = score != null ? Math.max(0, Math.min(100, (score / max) * 100)) : 0
  const t = TONE[tone]
  return (
    <div className="py-2.5 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
        <span className="text-[13px] font-medium text-text w-[120px] shrink-0 truncate">{label}</span>
        <div className="flex-1 h-[7px] rounded-full bg-surface-alt overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.bar }} />
        </div>
        <span className={`font-mono text-[13px] font-bold w-[44px] text-right shrink-0 ${t.fg}`}>
          {score != null ? `${score}/${max}` : '—'}
        </span>
      </div>
      {sub && <div className="text-[12px] text-text-muted leading-relaxed mt-1.5 pl-5">{sub}</div>}
    </div>
  )
}

// ─── D. Layer band ────────────────────────────────────────
export function LayerBand({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="text-[12px] font-semibold text-text-muted" style={{ letterSpacing: 0.2 }}>
          {title}
        </span>
        <span className="font-mono text-[11px] text-text-subtle">{count}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">{children}</div>
    </div>
  )
}

export function NodeCard({ title, subtitle, desc }: { title: string; subtitle?: string; desc?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="text-[13px] font-semibold text-text leading-snug">{title}</div>
      {subtitle && <div className="text-[11px] font-mono text-accent-deep mt-0.5 leading-snug">{subtitle}</div>}
      {desc && <div className="text-[11.5px] text-text-muted leading-relaxed mt-1.5">{desc}</div>}
    </div>
  )
}

// ─── E. Callout box ───────────────────────────────────────
export function Callout({ label, tone = 'neutral', children }: { label?: string; tone?: Tone; children: ReactNode }) {
  const t = TONE[tone]
  return (
    <div className={`rounded-xl px-4 py-3 mb-3 ${tone === 'neutral' ? 'bg-surface-alt' : t.bg}`}>
      {label && (
        <div
          className={`text-[10.5px] font-mono font-semibold mb-1.5 ${tone === 'neutral' ? 'text-text-subtle' : t.fg}`}
          style={{ letterSpacing: 0.4 }}
        >
          {label}
        </div>
      )}
      <div className="text-[13px] text-text leading-relaxed">{children}</div>
    </div>
  )
}
