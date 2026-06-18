interface XPBarProps {
  pct: number
  className?: string
}

export default function XPBar({ pct, className = '' }: XPBarProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        height: 8,
        background: 'rgba(20,40,100,0.8)',
        border: '1px solid rgba(60,100,200,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Fill */}
      <div style={{
        position: 'absolute', inset: '0 auto 0 0',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #1a4aaa, #4a8aff, #a0c8ff)',
        boxShadow: '0 0 8px rgba(74,138,255,0.6)',
        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}/>

      {/* Shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
        width: '25%',
        animation: 'shimmer 2s linear infinite',
      }}/>
    </div>
  )
}
