export default function AiMarkD({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
        letterSpacing: -0.5,
        fontSize: size * 0.5,
        boxShadow: 'color-mix(in srgb, var(--color-accent) 25%, transparent) 0 1px 0, inset 0 1px 0 rgba(255,255,255,.15)',
      }}
    >
      P
    </div>
  )
}
