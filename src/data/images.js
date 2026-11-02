import { productArt } from './product-art';
const INK = '#3a1f12';
const LOOKS = [
    { bg: ['#f6c98f', '#dc8f58'], cup: '#fff4e6', liquid: '#4a2412', table: '#a8643a' }, // espresso
    { bg: ['#f8d9c0', '#e8a98a'], cup: '#fdeede', liquid: '#b98255', foam: '#fff1de', table: '#b7704b' }, // cappuccino
    { bg: ['#dcebbf', '#93b57c'], cup: '#fff9ee', liquid: '#9dc26a', foam: '#e7f3cd', table: '#8a6a45' }, // matcha latte
    { bg: ['#ecc7d3', '#bb7690'], cup: '#fff1ef', liquid: '#6b3a2a', foam: '#f6d9cf', table: '#8c5a4a' }, // mocha
    { bg: ['#c3dbf2', '#7392c9'], cup: '#ffffff', liquid: '#3a2218', table: '#6c5a63' }, // cold-brew dusk
    { bg: ['#f8e6ad', '#e8ab52'], cup: '#fff7e8', liquid: '#7a4526', table: '#b27a3d' }, // pour-over
    { bg: ['#1d2745', '#0a0f1f'], cup: '#fff4e6', liquid: '#4a2412', table: '#3b2b27' }, // rainy night (hero)
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
/** Wide hero: cup on the right so the headline sits clear on the left. Dark rainy sky; the rain itself is drawn live (rain.js). */
const heroPhoto = () => uri(scene(look(6), { w: 1600, h: 700, tx: 700, ty: 130, s: 1.15 }));
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

/** Optional real pictures: drop public/images/products/<id>.png in and they replace the painted scene. */
const productPhoto = (id) => `./images/products/${id}.png`;
/** Realistic hand-painted still life (src/data/product-art.js), used until a real picture exists. */
const productDrawing = productArt;
export { heroPhoto, productPhoto, productDrawing, storyPhoto };
