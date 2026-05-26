import type { DesignIconKind } from './types'

interface DesignIconProps {
  kind: DesignIconKind
  size?: number
  color?: string
}

export default function DesignIcon({ kind, size = 16, color = 'currentColor' }: DesignIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'features':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    case 'arch':
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="6" rx="1" />
          <rect x="4" y="15" width="6" height="6" rx="1" />
          <rect x="14" y="15" width="6" height="6" rx="1" />
          <path d="M12 9v3M7 12v3M17 12v3M7 12h10" />
        </svg>
      )
    case 'data':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
          <path d="M3 12a9 3 0 0 0 18 0" />
        </svg>
      )
    case 'ai':
      return (
        <svg {...props}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    case 'help':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      )
    case 'bulb':
      return (
        <svg {...props}>
          <path d="M9 21h6" />
          <path d="M12 17a5 5 0 0 0 5-5c0-3-2.5-5-5-5s-5 2-5 5a5 5 0 0 0 5 5z" />
          <path d="M12 17v4" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'check':
      return (
        <svg {...props} strokeWidth={2.5}>
          <path d="m5 12 5 5 9-11" />
        </svg>
      )
    default:
      return null
  }
}
