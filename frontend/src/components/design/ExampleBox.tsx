interface ExampleBoxProps {
  label?: string
  children: React.ReactNode
}

export default function ExampleBox({ label = '좋은 예시', children }: ExampleBoxProps) {
  return (
    <div
      className="px-3 py-2.5 bg-green-soft rounded-lg text-xs leading-relaxed"
      style={{ border: '1px solid color-mix(in srgb, var(--color-green) 15%, transparent)', color: 'var(--color-green)' }}
    >
      <span className="font-bold mr-1.5">{label}</span>
      {children}
    </div>
  )
}
