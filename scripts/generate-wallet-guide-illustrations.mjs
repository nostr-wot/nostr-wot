import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Original, language-independent diagrams using the existing guide palette.
const defs = `<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#1e1b4b"/><stop offset=".55" stop-color="#312e81"/><stop offset="1" stop-color="#4c1d95"/></linearGradient><radialGradient id="halo"><stop stop-color="#8b5cf6" stop-opacity=".32"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
const backdrop = `<rect width="1200" height="630" fill="url(#bg)"/><ellipse cx="600" cy="315" rx="560" ry="300" fill="url(#halo)"/><g fill="none" stroke="#c4b5fd" stroke-opacity=".12">${[140,220,300].map(r=>`<circle cx="600" cy="315" r="${r}" stroke-dasharray="4 12"/>`).join('')}</g>`;
const bolt = (x,y,s=1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M8 -45 -30 8 -3 8 -12 47 32 -11 5 -11Z" fill="#facc15"/>`;
const link = (x,y,color='#4ade80') => `<g transform="translate(${x} ${y}) rotate(-35)" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"><rect x="-49" y="-18" width="60" height="36" rx="18"/><rect x="-11" y="-18" width="60" height="36" rx="18"/></g>`;
const browser = (x,y) => `<g transform="translate(${x} ${y})"><rect x="-145" y="-110" width="290" height="220" rx="22" fill="#171533" stroke="#a78bfa" stroke-width="3"/><path d="M-145 -62H145" stroke="#a78bfa" stroke-opacity=".5" stroke-width="2"/><g fill="#a78bfa"><circle cx="-116" cy="-86" r="5"/><circle cx="-98" cy="-86" r="5"/><circle cx="-80" cy="-86" r="5"/></g><path d="M-42 47V-5a42 42 0 0 1 84 0v52" fill="none" stroke="#c4b5fd" stroke-width="10"/><rect x="-55" y="24" width="110" height="60" rx="15" fill="#a78bfa"/><circle cy="48" r="8" fill="#171533"/></g>`;
const path = (d,color='#4ade80') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-opacity=".4" stroke-width="12" filter="url(#glow)"/>`;
const wallet = `<g transform="translate(295 315)"><rect x="-125" y="-84" width="250" height="168" rx="28" fill="#171533" stroke="#facc15" stroke-width="3"/><path d="M-110 -77v-23q0-20 22-20H89q20 0 20 20v16" fill="none" stroke="#facc15" stroke-width="3"/><rect x="58" y="-27" width="86" height="58" rx="15" fill="#312e81" stroke="#facc15" stroke-width="3"/><circle cx="89" cy="2" r="8" fill="#facc15"/>${bolt(-28,0,.85)}</g>`;
const alby = wallet + path('M445 315H748') + `<circle cx="600" cy="315" r="63" fill="#201d47" stroke="#4ade80" stroke-width="2"/>` + link(600,315) + browser(910,315) + `<g fill="#201d47" stroke="#c4b5fd" stroke-width="2"><circle cx="600" cy="145" r="34"/><circle cx="600" cy="485" r="34"/></g><g stroke="#c4b5fd" stroke-width="3" fill="none"><path d="M600 179V240M600 390V451" stroke-dasharray="5 9"/><path d="m585 146 10 10 21-24" stroke="#4ade80" stroke-width="5"/><circle cx="600" cy="485" r="19"/><path d="M600 471v14l11 7"/></g>`;
const server = `<g transform="translate(260 315)">${[-72,0,72].map(y=>`<rect x="-105" y="${y-28}" width="210" height="56" rx="13" fill="#171533" stroke="#c4b5fd" stroke-width="2"/><circle cx="-72" cy="${y}" r="7" fill="#4ade80"/><path d="M-41 ${y}H72" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`;
const lnbits = server + path('M370 278C460 278 450 170 535 170H720C780 170 780 245 825 245') + path('M370 352C460 352 450 460 535 460H720C780 460 780 385 825 385','#facc15') + `<circle cx="615" cy="170" r="60" fill="#201d47" stroke="#4ade80" stroke-width="2"/>` + link(615,170) + `<circle cx="615" cy="460" r="60" fill="#201d47" stroke="#facc15" stroke-width="2"/><g transform="translate(615 460) rotate(-35)" fill="none" stroke="#facc15" stroke-width="9" stroke-linecap="round"><circle cx="-20" r="19"/><path d="M0 0H43M25 0V16M42 0V12"/></g>` + browser(940,315);
for (const [slug, artwork] of [['alby-hub-nwc',alby],['lnbits-wallet-setup',lnbits]]) {
  const dir = `public/images/guides/${slug}`;
  await mkdir(dir,{recursive:true});
  for (const [name,width,height] of [['featured',1200,600],['preview',800,450],['og',1200,630]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 630" preserveAspectRatio="xMidYMid slice">${defs}${backdrop}${artwork}</svg>`;
    await writeFile(`${dir}/${name}.svg`,svg);
    await sharp(Buffer.from(svg)).flatten({background:'#1e1b4b'}).jpeg({quality:92}).toFile(`${dir}/${name}.jpg`);
  }
}
console.log('Created SVG and JPEG guide illustrations in three sizes.');
