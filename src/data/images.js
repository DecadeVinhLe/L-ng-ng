const INK = '#3a1f12';
const LOOKS = [
    { bg: ['#f6c98f', '#dc8f58'], cup: '#fff4e6', liquid: '#4a2412', table: '#a8643a' }, // espresso
    { bg: ['#f8d9c0', '#e8a98a'], cup: '#fdeede', liquid: '#b98255', foam: '#fff1de', table: '#b7704b' }, // cappuccino
    { bg: ['#dcebbf', '#93b57c'], cup: '#fff9ee', liquid: '#9dc26a', foam: '#e7f3cd', table: '#8a6a45' }, // matcha latte
    { bg: ['#ecc7d3', '#bb7690'], cup: '#fff1ef', liquid: '#6b3a2a', foam: '#f6d9cf', table: '#8c5a4a' }, // mocha
    { bg: ['#c3dbf2', '#7392c9'], cup: '#ffffff', liquid: '#3a2218', table: '#6c5a63' }, // cold-brew dusk
    { bg: ['#f8e6ad', '#e8ab52'], cup: '#fff7e8', liquid: '#7a4526', table: '#b27a3d' }, // pour-over
];
const bean = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="15" ry="10" fill="#5a2f19" stroke="${INK}" stroke-width="3"/><path d="M-13 0q13-8 26 0" fill="none" stroke="${INK}" stroke-width="2.5"/></g>`;
const spark = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-14 3-3 14 0 3 3 0 14-3 3-14 0-3-3z" fill="#fff" fill-opacity=".9"/>`;
/** One cup on a saucer, drawn around x=400 with the saucer near y=392. */
function cup(l) {
    const top = l.foam
        ? `<path d="M400 266c-28-15-32-28-19-32 9-2 16 2 19 9 3-7 10-11 19-9 13 4 9 17-19 32z" fill="${l.foam}"/>`
        : `<ellipse cx="362" cy="249" rx="26" ry="4" fill="#fff" fill-opacity=".35"/>`;
    return `
<g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="9" stroke-linecap="round" filter="url(#b)">
<path d="M360 212c-22-30 22-50 0-86"/><path d="M405 206c-22-34 24-56 2-96"/><path d="M450 212c-20-28 20-48 0-80"/></g>
${bean(205, 428, 20)}${bean(255, 452, -30)}${bean(600, 432, 40)}${bean(662, 458, 10)}${bean(160, 470, -15)}
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<ellipse cx="400" cy="392" rx="200" ry="34" fill="${l.cup}"/>
<ellipse cx="400" cy="388" rx="150" ry="20" fill="#000" fill-opacity=".08" stroke="none"/>
<path d="M526 275c66-8 72 72-14 74" fill="none" stroke-width="30"/>
<path d="M526 275c66-8 72 72-14 74" fill="none" stroke-width="17" stroke="${l.cup}"/>
<path d="M270 250h260c0 82-40 138-130 138S270 332 270 250z" fill="${l.cup}"/>
<path d="M472 254h58c0 82-40 138-130 138-14 0-26-2-37-6 62-8 109-50 109-132z" fill="#000" fill-opacity=".1" stroke="none"/>
<path d="M292 268c4 44 20 76 44 98" fill="none" stroke="#fff" stroke-width="9" stroke-opacity=".9"/>
<ellipse cx="400" cy="250" rx="130" ry="26" fill="${l.cup}"/>
<ellipse cx="400" cy="253" rx="114" ry="19" fill="${l.liquid}" stroke="none"/>
${top}
</g>
${spark(250, 200, 0.9)}${spark(560, 170, 0.7)}${spark(615, 230, 0.5)}`;
}
const BOKEH = [[90, 70, 46], [220, 130, 30], [640, 60, 54], [740, 150, 34], [520, 100, 24], [40, 230, 38], [330, 50, 22]];
function scene(l, f) {
    const k = f.w / 800;
    const tableY = f.ty + f.s * 372;
    const bokeh = f.round ? '' : `<g fill="#fff" fill-opacity=".32" filter="url(#f)">${BOKEH.map(([x, y, r]) => `<circle cx="${x * k}" cy="${y * (f.h / 500)}" r="${r * k}"/>`).join('')}</g>`;
    const body = `<rect width="${f.w}" height="${f.h}" fill="url(#g)"/>${bokeh}
<rect y="${tableY}" width="${f.w}" height="${f.h - tableY}" fill="${l.table}"/><rect y="${tableY}" width="${f.w}" height="${Math.max(2, f.s * 5)}" fill="#fff" fill-opacity=".25"/>
<g transform="translate(${f.tx} ${f.ty}) scale(${f.s})">${cup(l)}</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l.bg[0]}"/><stop offset="1" stop-color="${l.bg[1]}"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="3"/></filter><filter id="f"><feGaussianBlur stdDeviation="9"/></filter>${f.round ? `<clipPath id="c"><circle cx="${f.w / 2}" cy="${f.h / 2}" r="${f.w / 2 - 1}"/></clipPath>` : ''}</defs>${f.round ? `<g clip-path="url(#c)">${body}</g>` : body}</svg>`;
}
const uri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const look = (i) => LOOKS[((i % LOOKS.length) + LOOKS.length) % LOOKS.length] ?? LOOKS[0];
/** Wide hero: cup on the right so the headline sits clear on the left. */
const heroPhoto = () => uri(scene(look(0), { w: 1600, h: 700, tx: 700, ty: 130, s: 1.15 }));
// ---- Product art: original anime-style drawings, one per product ----
const PRODUCT_LOOKS = {
    'fridge-sachet': { bg: ['#cfe8f0', '#8fb8d0'], table: '#b88a5c' },
    'shoe-deodorizer': { bg: ['#d9ecd0', '#8fbf8a'], table: '#a8795a' },
    'car-sachet': { bg: ['#f3dcc0', '#e0a070'], table: '#7a5a48' },
    'scrub-soap': { bg: ['#f6d5dc', '#e29aae'], table: '#b88068' },
    candle: { bg: ['#3a2a4a', '#8a4f5c'], table: '#4a3530' },
};
/** A small cloth bag tied with string, drawn around (0,0). */
function pouch(fill, tie, x, y, k, rot) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k * 0.8} ${k * 1.12})" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path d="M-100 -70C-110 10-85 52-40 58H40C85 52 110 10 100 -70Z" fill="${fill}"/>
<path d="M45 -68C70 -10 62 40 36 58H40C85 52 110 10 100 -70Z" fill="#000" fill-opacity=".1" stroke="none"/>
<path d="M-100 -70C-60 -102 60 -102 100 -70" fill="#000" fill-opacity=".08"/>
<path d="M-68 -80Q0 -46 68 -80" fill="none" stroke="${tie}" stroke-width="6"/>
<circle cx="0" cy="-62" r="10" fill="${tie}"/>
<circle cy="4" r="27" fill="#fff7e8"/>${bean(0, 4, -30)}
<path d="M-82 -30C-86 0-78 30-62 44" fill="none" stroke-opacity=".8" stroke-width="7" stroke="#fff"/></g>`;
}
function productBody(id) {
    switch (id) {
        case 'shoe-deodorizer':
            return pouch('#cfe6d0', '#3f6b4a', 200, 300, 1, -8) + pouch('#cddff0', '#46618a', 400, 300, 1, 8);
        case 'car-sachet':
            return `<path d="M300 0V118" stroke="${INK}" stroke-width="5" fill="none"/><circle cx="300" cy="128" r="13" fill="none" stroke="${INK}" stroke-width="6"/>${pouch('#d9ecc0', '#6b8e4e', 300, 235, 1.1, 0)}`;
        case 'scrub-soap': {
            const dots = [[230, 285], [270, 310], [330, 280], [370, 320], [300, 335], [250, 335], [350, 300], [400, 290], [215, 318]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${INK}" fill-opacity=".65"/>`).join('');
            return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><ellipse cx="300" cy="352" rx="175" ry="30" fill="#fff4e6"/>
<g transform="rotate(-6 300 300)"><rect x="190" y="245" width="220" height="110" rx="34" fill="#a8724a"/><rect x="190" y="305" width="220" height="50" rx="30" fill="#000" fill-opacity=".12" stroke="none"/>${dots}<path d="M214 275C230 262 260 258 290 258" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="8" stroke-linecap="round"/></g>
<circle cx="440" cy="225" r="26" fill="#fff" fill-opacity=".3"/><circle cx="478" cy="272" r="15" fill="#fff" fill-opacity=".3"/><circle cx="162" cy="228" r="19" fill="#fff" fill-opacity=".3"/></g>`;
        }
        case 'candle':
            return `<circle cx="300" cy="170" r="110" fill="url(#gl)"/><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect x="215" y="230" width="170" height="130" rx="22" fill="#e8c79a"/><rect x="335" y="236" width="48" height="124" rx="20" fill="#000" fill-opacity=".12" stroke="none"/>
<ellipse cx="300" cy="230" rx="85" ry="16" fill="#f6e7c8"/><ellipse cx="300" cy="231" rx="70" ry="11" fill="#d9b27a" stroke="none"/>
<rect x="240" y="272" width="120" height="64" rx="10" fill="#fff7e8"/>${bean(300, 304, -20)}
<path d="M300 228v-22" fill="none"/><path d="M300 128C332 165 334 200 300 212C266 200 268 165 300 128Z" fill="#ffb347" stroke-width="4"/>
<path d="M300 160C316 180 315 198 300 205C285 198 284 180 300 160Z" fill="#fff2b0" stroke="none"/>
<path d="M232 252C228 290 232 330 240 350" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="7"/></g>${spark(190, 150, 0.9)}${spark(420, 120, 0.7)}`;
        default:
            return pouch('#f4e4c6', '#b5523b', 300, 285, 1.25, 0) + bean(190, 410, 20) + bean(420, 405, -30) + bean(470, 425, 10);
    }
}
/** Anime-style drawing of a product (fridge-sachet, shoe-deodorizer, car-sachet, scrub-soap, candle). */
function productPhoto(id) {
    const l = PRODUCT_LOOKS[id] ?? PRODUCT_LOOKS['fridge-sachet'];
    const night = id === 'candle';
    const bokeh = [[90, 80, 40], [500, 60, 52], [560, 190, 30], [40, 210, 34], [330, 40, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l.bg[0]}"/><stop offset="1" stop-color="${l.bg[1]}"/></linearGradient><radialGradient id="gl"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient><filter id="f"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="600" height="450" fill="url(#g)"/><g fill="#fff" fill-opacity="${night ? 0.14 : 0.32}" filter="url(#f)">${bokeh}</g><rect y="360" width="600" height="90" fill="${l.table}"/><rect y="360" width="600" height="4" fill="#fff" fill-opacity=".25"/>${productBody(id)}</svg>`;
    return uri(svg);
}
/** The coffee loop, drawn: a tree in a ring of cherry, bean, grounds and product. Shown when the live 3D scene cannot run. */
function storyPhoto() {
    const stops = [
        ['#c4271c', 'cherry'],
        ['#5a2f19', 'bean'],
        ['#2a1a10', 'grounds'],
        ['#e9d9b8', 'product'],
    ];
    const dots = stops.map(([fill], i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
        return `<circle cx="${(320 + Math.cos(a) * 200).toFixed(1)}" cy="${(440 + Math.sin(a) * 200).toFixed(1)}" r="44" fill="${fill}" stroke="#f1eee6" stroke-width="5"/>`;
    }).join('');
    const leaves = [[-70, -40], [70, -50], [-40, -110], [50, -120], [0, -160], [-90, -100], [90, -105]].map(([x, y]) => `<ellipse cx="${320 + x}" cy="${440 + y}" rx="46" ry="16" fill="#3f6a28" transform="rotate(${x > 0 ? -20 : 20} ${320 + x} ${440 + y})"/>`).join('');
    return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" preserveAspectRatio="xMidYMid slice"><rect width="640" height="800" fill="#1d1b18"/><circle cx="320" cy="440" r="200" fill="none" stroke="#f0c43a" stroke-width="6" stroke-dasharray="18 12"/><rect x="311" y="400" width="18" height="90" fill="#5a3a22"/>${leaves}<circle cx="290" cy="395" r="9" fill="#c4271c"/><circle cx="350" cy="388" r="9" fill="#c4271c"/><circle cx="320" cy="350" r="9" fill="#c4271c"/>${dots}</svg>`);
}

export { heroPhoto, productPhoto, storyPhoto };
