// Óculos steampunk — emblema de identidade (Engenharia da Computação).
// Latão = tons de dourado do System; lentes = azul neon com brilho.

interface Props {
  width?: number
  glow?: boolean
  style?: React.CSSProperties
}

export default function SteampunkGoggles({ width = 120, glow = true, style }: Props) {
  const brass     = '#f0c040'
  const brassDim  = '#a8842c'
  const lensA     = '#3a8fff'
  const lensB     = '#0a2a66'

  // viewBox 200x120: duas lentes + ponte + alça
  const Lens = ({ cx }: { cx: number }) => {
    const r = 42
    return (
      <g>
        {/* aro externo (latão) */}
        <circle cx={cx} cy={62} r={r}      fill="none" stroke={brass}    strokeWidth={7} />
        <circle cx={cx} cy={62} r={r - 6}  fill="none" stroke={brassDim} strokeWidth={3} />
        {/* lente */}
        <circle cx={cx} cy={62} r={r - 9}  fill={`url(#lensGrad-${cx})`} />
        {/* reflexo */}
        <ellipse cx={cx - 12} cy={50} rx={11} ry={16} fill="rgba(255,255,255,0.22)" transform={`rotate(-25 ${cx - 12} 50)`} />
        {/* rebites em volta do aro */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 12
          const rr = r - 3
          return <circle key={i} cx={cx + rr * Math.cos(a)} cy={62 + rr * Math.sin(a)} r={1.8} fill="#ffe08a" />
        })}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={width * 0.6}
      style={{ display: 'block', filter: glow ? 'drop-shadow(0 0 10px rgba(58,143,255,0.4))' : 'none', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lensGrad-58" cx="40%" cy="35%" r="75%">
          <stop offset="0%"  stopColor={lensA} />
          <stop offset="100%" stopColor={lensB} />
        </radialGradient>
        <radialGradient id="lensGrad-142" cx="40%" cy="35%" r="75%">
          <stop offset="0%"  stopColor={lensA} />
          <stop offset="100%" stopColor={lensB} />
        </radialGradient>
      </defs>

      {/* alça/strap atrás */}
      <path d="M16 56 Q12 40 30 36 L62 30" fill="none" stroke={brassDim} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
      <path d="M184 56 Q188 40 170 36 L138 30" fill="none" stroke={brassDim} strokeWidth={9} strokeLinecap="round" opacity={0.85} />

      {/* ponte central entre as lentes */}
      <rect x={92} y={56} width={16} height={12} rx={3} fill={brass} />
      <circle cx={100} cy={62} r={3.5} fill="#ffe08a" />

      {/* detalhe lateral (mini-luneta no aro esquerdo) */}
      <rect x={28} y={48} width={10} height={7} rx={2} fill={brass} transform="rotate(-30 33 51)" />

      <Lens cx={58} />
      <Lens cx={142} />
    </svg>
  )
}
