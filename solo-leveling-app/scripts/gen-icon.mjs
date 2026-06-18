import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

// Ícone do app: fundo escuro do System + engrenagens + óculos steampunk.
// Paleta: bg #04060f, azul neon #3a8fff, latão/dourado #f0c040.
const SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#0a1430"/>
      <stop offset="100%" stop-color="#04060f"/>
    </radialGradient>
    <radialGradient id="lens" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#5aa6ff"/>
      <stop offset="55%" stop-color="#3a8fff"/>
      <stop offset="100%" stop-color="#0a2a66"/>
    </radialGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8d878"/>
      <stop offset="100%" stop-color="#b8902f"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="8" y="8" width="496" height="496" rx="90" fill="none" stroke="#3a8fff" stroke-opacity="0.5" stroke-width="3"/>

  <!-- Engrenagens de fundo -->
  ${gear(120, 130, 70, 11, 'rgba(58,143,255,0.16)')}
  ${gear(400, 380, 56, 9,  'rgba(240,192,64,0.16)')}
  ${gear(410, 120, 40, 8,  'rgba(58,143,255,0.12)')}

  <!-- Óculos steampunk -->
  <g transform="translate(256,270)">
    <!-- alças -->
    <path d="M-150 -10 Q-165 -50 -120 -58 L-70 -66" fill="none" stroke="#9a7a28" stroke-width="22" stroke-linecap="round"/>
    <path d="M150 -10 Q165 -50 120 -58 L70 -66" fill="none" stroke="#9a7a28" stroke-width="22" stroke-linecap="round"/>
    <!-- ponte -->
    <rect x="-22" y="-14" width="44" height="30" rx="7" fill="url(#brass)"/>
    ${lens(-78)}
    ${lens(78)}
  </g>

  <!-- legenda -->
  <text x="256" y="468" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" letter-spacing="6" fill="#f0c040" fill-opacity="0.9">VSYSTEM</text>
</svg>`

function gear(cx, cy, r, teeth, color) {
  const toothW = r * 0.16
  const rRoot = r * 0.8
  let t = ''
  for (let i = 0; i < teeth; i++) {
    const a = (360 / teeth) * i
    t += `<rect x="${cx - toothW/2}" y="${cy - r}" width="${toothW}" height="${r - rRoot + r*0.1}" rx="2" fill="${color}" transform="rotate(${a} ${cx} ${cy})"/>`
  }
  return `${t}
    <circle cx="${cx}" cy="${cy}" r="${rRoot}" fill="none" stroke="${color}" stroke-width="${r*0.11}"/>
    <circle cx="${cx}" cy="${cy}" r="${r*0.2}" fill="none" stroke="${color}" stroke-width="${r*0.09}"/>`
}

function lens(cx) {
  const r = 70
  let rivets = ''
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12
    rivets += `<circle cx="${cx + (r-5)*Math.cos(a)}" cy="${(r-5)*Math.sin(a)}" r="3.2" fill="#ffe8a0"/>`
  }
  return `
    <circle cx="${cx}" cy="0" r="${r}" fill="none" stroke="url(#brass)" stroke-width="12"/>
    <circle cx="${cx}" cy="0" r="${r-10}" fill="none" stroke="#8a6c22" stroke-width="5"/>
    <circle cx="${cx}" cy="0" r="${r-15}" fill="url(#lens)"/>
    <ellipse cx="${cx-20}" cy="-22" rx="18" ry="26" fill="rgba(255,255,255,0.25)" transform="rotate(-25 ${cx-20} -22)"/>
    ${rivets}`
}

writeFileSync(new URL('../public/icons/icon.svg', import.meta.url), SVG)

await sharp(Buffer.from(SVG)).resize(512, 512).png().toFile(new URL('../public/icons/icon-512.png', import.meta.url).pathname.replace(/^\//, process.platform === 'win32' ? '' : '/'))
await sharp(Buffer.from(SVG)).resize(192, 192).png().toFile(new URL('../public/icons/icon-192.png', import.meta.url).pathname.replace(/^\//, process.platform === 'win32' ? '' : '/'))

console.log('Ícones gerados: icon-192.png, icon-512.png, icon.svg')
