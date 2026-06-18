import sharp from 'sharp'

const svgIcon = (size) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#04060f"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.42}" fill="none" stroke="#3a8fff" stroke-width="${size*0.028}"
    filter="url(#glow)"/>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size*0.02}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <text x="${size/2}" y="${size*0.56}" font-size="${size*0.46}" text-anchor="middle" dominant-baseline="middle">&#x1F451;</text>
  <text x="${size/2}" y="${size*0.8}" font-size="${size*0.09}" text-anchor="middle" fill="#3a8fff"
    font-family="Arial,sans-serif" font-weight="bold" letter-spacing="${size*0.012}">MONARCA</text>
</svg>`)

await sharp(svgIcon(192)).png().toFile('public/icons/icon-192.png')
await sharp(svgIcon(512)).png().toFile('public/icons/icon-512.png')
console.log('Icons generated successfully!')
