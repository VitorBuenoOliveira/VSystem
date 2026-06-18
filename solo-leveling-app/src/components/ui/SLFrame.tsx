interface SLFrameProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  style?: React.CSSProperties
}

const Corner = ({ pos, color }: { pos: 'tl'|'tr'|'bl'|'br'; color: string }) => {
  const transforms: Record<string, string> = {
    tl: 'none',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1,-1)',
  }
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: -1,    left: -1 },
    tr: { top: -1,    right: -1 },
    bl: { bottom: -1, left: -1 },
    br: { bottom: -1, right: -1 },
  }
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', transform: transforms[pos], ...positions[pos], zIndex: 2, display: 'block' }}
    >
      <path d="M1 17V5C1 2.8 2.8 1 5 1H17" stroke={color} strokeWidth="2" strokeLinecap="square"/>
    </svg>
  )
}

export default function SLFrame({ children, className = '', glowColor = '#3a8fff', style }: SLFrameProps) {
  const dimColor = glowColor + '8c' // ~55% opacity hex

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: 'rgba(2,8,28,0.95)',
        border: `1px solid ${dimColor}`,
        ...style,
      }}
    >
      {/* Corners */}
      <Corner pos="tl" color={glowColor} />
      <Corner pos="tr" color={glowColor} />
      <Corner pos="bl" color={glowColor} />
      <Corner pos="br" color={glowColor} />

      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: -1, left: 18, right: 18, height: 1,
        background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
        boxShadow: `0 0 8px ${glowColor}`,
        zIndex: 1,
      }}/>

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: -1, left: 18, right: 18, height: 1,
        background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
        boxShadow: `0 0 8px ${glowColor}`,
        zIndex: 1,
      }}/>

      {/* Left glow line */}
      <div style={{
        position: 'absolute', left: -1, top: 18, bottom: 18, width: 1,
        background: `linear-gradient(180deg, transparent, ${glowColor}, transparent)`,
        boxShadow: `0 0 6px ${glowColor}`,
        zIndex: 1,
      }}/>

      {/* Right glow line */}
      <div style={{
        position: 'absolute', right: -1, top: 18, bottom: 18, width: 1,
        background: `linear-gradient(180deg, transparent, ${glowColor}, transparent)`,
        boxShadow: `0 0 6px ${glowColor}`,
        zIndex: 1,
      }}/>

      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,20,60,0.06) 3px, rgba(0,20,60,0.06) 4px)',
      }}/>

      {/* Scan line animation */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none', zIndex: 2,
        background: 'linear-gradient(90deg, transparent, rgba(80,160,255,0.15), transparent)',
        animation: 'scanMove 4s linear infinite',
      }}/>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </div>
  )
}
