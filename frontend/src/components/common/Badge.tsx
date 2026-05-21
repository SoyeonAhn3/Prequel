const VARIANTS: Record<string, string> = {
  accent: 'bg-accent-soft text-accent-deep',
  muted: 'bg-surface-alt text-text-muted',
  green: 'bg-green-soft text-green',
  amber: 'bg-amber-soft text-amber',
}

interface BadgeProps {
  variant?: keyof typeof VARIANTS
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'accent', children, className = '' }: BadgeProps) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
