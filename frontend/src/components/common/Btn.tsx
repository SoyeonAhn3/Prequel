import type { ReactNode, ButtonHTMLAttributes } from 'react'

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  kind?: BtnKind
  size?: BtnSize
  icon?: ReactNode
  children: ReactNode
}

const SIZE_CLS: Record<BtnSize, string> = {
  sm: 'text-[12.5px] px-[11px] py-[7px] h-[30px]',
  md: 'text-[13.5px] px-[14px] py-[9px] h-[36px]',
  lg: 'text-[15px] px-5 py-3 h-[46px]',
}

const KIND_CLS: Record<BtnKind, string> = {
  primary: 'bg-accent text-white border-accent',
  secondary: 'bg-surface text-text border-border-strong',
  ghost: 'bg-transparent text-text border-transparent',
  soft: 'bg-accent-soft text-accent border-transparent font-semibold',
  danger: 'bg-surface text-red border-border-strong',
}

export default function Btn({ kind = 'primary', size = 'md', icon, children, className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-[7px] font-medium cursor-pointer rounded-lg border transition-all leading-none whitespace-nowrap disabled:opacity-50 ${SIZE_CLS[size]} ${KIND_CLS[kind]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
