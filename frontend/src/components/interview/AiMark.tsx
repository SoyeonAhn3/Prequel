export default function AiMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
        color: '#fff',
        fontSize: size * 0.5,
        letterSpacing: -0.5,
        boxShadow: 'var(--color-accent) 0px 1px 0px 0px inset rgba(255,255,255,.15)',
      }}
    >
      P
    </div>
  )
}
