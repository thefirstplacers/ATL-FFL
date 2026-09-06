// ATL FFL app icon: football-shaped "FF" badge in the site's orange/black brand.
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
<defs>
  <radialGradient id="bg" cx="50%" cy="30%" r="85%">
    <stop offset="0%" stop-color="#232323"/><stop offset="100%" stop-color="#0d0d0d"/>
  </radialGradient>
  <linearGradient id="orange" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffa270"/><stop offset="0.5" stop-color="#ff7a3d"/><stop offset="1" stop-color="#d94f14"/>
  </linearGradient>
</defs>
<rect width="512" height="512" fill="url(#bg)"/>
<!-- football: rotated ellipse -->
<g transform="rotate(-32 256 256)">
  <ellipse cx="256" cy="256" rx="196" ry="126" fill="url(#orange)" stroke="#0d0d0d" stroke-width="14"/>
  <ellipse cx="256" cy="256" rx="196" ry="126" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>
  <!-- laces -->
  <line x1="196" y1="256" x2="316" y2="256" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  ${[210, 238, 266, 294].map((x) => `<line x1="${x}" y1="238" x2="${x}" y2="274" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>`).join('')}
</g>
<!-- FF monogram below the laces line -->
<text x="256" y="436" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="96"
      fill="url(#orange)" stroke="#0d0d0d" stroke-width="8" paint-order="stroke">ATL FFL</text>
</svg>`;

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('src/app/icon.png');
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('src/app/apple-icon.png');
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icon-512.png');
console.log('ATL icons written');
