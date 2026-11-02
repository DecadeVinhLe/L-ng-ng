/**
 * Product pictures, painted in code as realistic still-life paintings (600 x 450):
 * muted gouache colours, no outlines, soft window light, cast shadows, rough brush edges and a
 * canvas grain. No glow, sparkle or outside images. One scene per product.
 */

function rng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}
const f1 = (n) => Math.round(n * 10) / 10;

/** Shared filters: rough painted edges, soft blurs, brush streaks and canvas weave. */
const DEFS = `
<filter id="edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/><feGaussianBlur stdDeviation=".6"/></filter>
<filter id="edge2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/><feGaussianBlur stdDeviation=".4"/></filter>
<filter id="b2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="b5" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="b12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="streak" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .07" numOctaves="4" seed="2"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.35"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.2 -.3"/></filter>
<filter id="woodgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".005 .22" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 .14  0 0 0 0 .08  0 0 0 0 .04  0 0 0 1.5 -.5"/></filter>
<filter id="slub" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".01 .4" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .13  0 0 0 0 .08  0 0 0 1.6 -.5"/></filter>
<filter id="wave" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="38"/></filter>
<pattern id="lin" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .8H3" stroke="#2c1d14" stroke-opacity=".16" stroke-width=".8"/><path d="M.8 0V3" stroke="#f3e2c8" stroke-opacity=".1" stroke-width=".8"/></pattern>
<pattern id="bur" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 2H9M0 6.5H9" stroke="#6b5636" stroke-opacity=".55" stroke-width="2.2"/><path d="M2 0V9M6.5 0V9" stroke="#e8d6ae" stroke-opacity=".5" stroke-width="2.2"/></pattern>
<pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1.2H5M0 3.7H5" stroke="#3d2f1c" stroke-opacity=".22" stroke-width="1"/><path d="M1.2 0V5M3.7 0V5" stroke="#f4e6c4" stroke-opacity=".18" stroke-width="1"/></pattern>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a120a" stop-opacity=".5"/></radialGradient>`;

function frame(inner, extraDefs = '') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice"><defs>${DEFS}${extraDefs}</defs>${inner}
<rect width="600" height="450" filter="url(#streak)" opacity=".1" style="mix-blend-mode:multiply"/>
<rect width="600" height="450" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/>
<rect width="600" height="450" fill="url(#vig)"/></svg>`;
}
const uri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** A few coffee beans lying about. */
function bean(x, y, a = 0, s = 1) {
    return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})" filter="url(#edge2)">
<ellipse cx="2" cy="3" rx="9" ry="3.4" fill="#000" opacity=".28" filter="url(#b2)"/>
<ellipse cx="0" cy="0" rx="8.4" ry="5.6" fill="#4a2a17"/><ellipse cx="-2" cy="-1.6" rx="5.5" ry="2.6" fill="#7a4a29" opacity=".75"/>
<path d="M-6.6 .4 Q0 -1.6 6.6 .8" stroke="#1d0f07" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`;
}

/** Scattered grounds. */
function grounds(cx, cy, rx, ry, n, seed) {
    const r = rng(seed);
    const cols = ['#1d0f07', '#2c170b', '#432414', '#5b3320'];
    let out = '';
    for (let i = 0; i < n; i++) {
        const a = r() * 6.283;
        const d = Math.sqrt(r());
        out += `<ellipse cx="${f1(cx + Math.cos(a) * rx * d)}" cy="${f1(cy + Math.sin(a) * ry * d)}" rx="${f1(.8 + r() * 1.8)}" ry="${f1(.6 + r() * 1.1)}" fill="${cols[Math.floor(r() * 4)]}" opacity="${f1(.7 + r() * .3)}"/>`;
    }
    return out;
}


/**
 * A linen drawstring pouch (like the reference photo): gathered neck, ribbon, three printed beans.
 * (x, y) is the middle of the base. tone = 4 fabric stops light to dark, ribbon = colour of the ribbon.
 */
function pouch(x, y, w, h, o = {}) {
    const id = o.id || 'p';
    const bw = w / 2;
    const nk = bw * 0.5;
    const c = o.tone || ['#9c7b64', '#82614c', '#664b3a', '#47352a'];
    const rb = o.ribbon || ['#4a2f3f', '#6e4a5e'];
    const r = rng(o.seed || 3);
    const F = (n) => f1(n);
    const body = `M${F(x - bw)} ${F(y - h * 0.07)} Q${F(x - bw)} ${F(y)} ${F(x - bw * 0.9)} ${F(y)} Q${F(x)} ${F(y + h * 0.018)} ${F(x + bw * 0.9)} ${F(y)} Q${F(x + bw)} ${F(y)} ${F(x + bw)} ${F(y - h * 0.07)}
L${F(x + bw * 0.97)} ${F(y - h * 0.6)} C${F(x + bw * 0.94)} ${F(y - h * 0.72)} ${F(x + nk * 1.15)} ${F(y - h * 0.76)} ${F(x + nk)} ${F(y - h * 0.84)}
L${F(x + nk * 1.06)} ${F(y - h * 0.95)} Q${F(x + nk * 0.7)} ${F(y - h * 1.025)} ${F(x + nk * 0.4)} ${F(y - h * 0.97)} Q${F(x + nk * 0.1)} ${F(y - h * 1.03)} ${F(x - nk * 0.2)} ${F(y - h * 0.975)} Q${F(x - nk * 0.55)} ${F(y - h * 1.025)} ${F(x - nk * 0.85)} ${F(y - h * 0.96)} L${F(x - nk * 1.05)} ${F(y - h * 0.94)}
L${F(x - nk)} ${F(y - h * 0.84)} C${F(x - nk * 1.15)} ${F(y - h * 0.76)} ${F(x - bw * 0.94)} ${F(y - h * 0.72)} ${F(x - bw * 0.97)} ${F(y - h * 0.6)}Z`;
    const lx = o.light === 'r' ? 1 : 0;
    const defs = `<linearGradient id="${id}g" x1="${lx}" y1="0" x2="${1 - lx}" y2=".1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".4" stop-color="${c[1]}"/><stop offset=".8" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></linearGradient>
<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1c120a" stop-opacity=".34"/></linearGradient>
<clipPath id="${id}c"><path d="${body}"/></clipPath>`;
    // gathers at the neck
    let gathers = '';
    for (let i = 0; i < 11; i++) {
        const gx = x - nk * 0.95 + (i / 10) * nk * 1.9;
        const dark = i % 2 === 0;
        gathers += `<path d="M${F(gx)} ${F(y - h * 0.985)} Q${F(gx + (i - 5) * 1.4)} ${F(y - h * 0.9)} ${F(gx + (i - 5) * 2.4)} ${F(y - h * 0.8)}" stroke="${dark ? '#2a1a10' : '#d8b996'}" stroke-opacity="${dark ? 0.32 : 0.26}" stroke-width="${dark ? 4.2 : 3}" fill="none" stroke-linecap="round"/>`;
    }
    // soft creases on the body
    let creases = '';
    for (let i = 0; i < 5; i++) {
        const cx = x - bw * 0.7 + r() * bw * 1.4;
        const t0 = y - h * (0.55 + r() * 0.15);
        creases += `<path d="M${F(cx)} ${F(t0)} q${F((r() - 0.5) * 22)} ${F(h * 0.18)} ${F((r() - 0.5) * 16)} ${F(h * 0.34)}" stroke="#20130a" stroke-opacity="${F(0.08 + r() * 0.1)}" stroke-width="${F(5 + r() * 6)}" fill="none" stroke-linecap="round"/>`;
    }
    const bean = (bx, by, rot, k) => `<g transform="translate(${F(bx)} ${F(by)}) rotate(${rot}) scale(${k})"><ellipse rx="19" ry="25" fill="#3e2b21"/><path d="M-2 -23 C6 -9 -6 7 3 23" stroke="${c[1]}" stroke-width="3.4" fill="none"/></g>`;
    const print = `<g filter="url(#edge2)" opacity=".82" style="mix-blend-mode:multiply" transform="translate(${F(x - bw * 0.04)} ${F(y - h * 0.46)}) scale(${F(w / 190)})">${bean(-26, -34, -16, 1)}${bean(34, -20, 18, 0.9)}${bean(-10, 28, -32, 1)}</g>
<text x="${F(x - bw * 0.04)}" y="${F(y - h * 0.18)}" text-anchor="middle" font-family="Georgia,serif" font-size="${F(h * 0.05)}" letter-spacing="1.2" fill="#2e1f17" opacity=".7" style="mix-blend-mode:multiply">LẮNG · coffee</text>`;
    // ribbon: back loop behind the bag, front band across the neck, front loop on the left
    const ribbon = (d, wd) => `<path d="${d}" stroke="${rb[0]}" stroke-width="${wd}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${rb[1]}" stroke-width="${F(wd * 0.28)}" fill="none" stroke-linecap="round" opacity=".7" transform="translate(-1.2 -1)"/>`;
    const backRib = ribbon(`M${F(x + nk * 0.9)} ${F(y - h * 0.9)} C${F(x + bw * 1.5)} ${F(y - h * 1.0)} ${F(x + bw * 1.5)} ${F(y - h * 0.45)} ${F(x + bw * 1.08)} ${F(y - h * 0.22)}`, 10);
    const frontRib = `${ribbon(`M${F(x - nk * 1.05)} ${F(y - h * 0.855)} Q${F(x)} ${F(y - h * 0.82)} ${F(x + nk * 1.05)} ${F(y - h * 0.86)}`, 9)}
${ribbon(`M${F(x - nk * 0.95)} ${F(y - h * 0.9)} C${F(x - bw * 1.55)} ${F(y - h * 1.0)} ${F(x - bw * 1.55)} ${F(y - h * 0.5)} ${F(x - bw * 1.1)} ${F(y - h * 0.24)}`, 10.5)}
<g transform="translate(${F(x - bw * 1.1)} ${F(y - h * 0.24)}) rotate(8)"><rect x="-5" y="-4" width="10" height="${F(h * 0.07)}" fill="${rb[0]}"/></g>`;
    const shadow = o.noShadow ? '' : `<ellipse cx="${F(x + bw * 0.5)}" cy="${F(y + 3)}" rx="${F(bw * 1.5)}" ry="${F(bw * 0.17)}" fill="#160c05" opacity=".42" filter="url(#b5)" style="mix-blend-mode:multiply"/><ellipse cx="${F(x)}" cy="${F(y + 2)}" rx="${F(bw * 0.95)}" ry="${F(bw * 0.08)}" fill="#0e0702" opacity=".5" filter="url(#b2)"/>`;
    const art = `${shadow}<g filter="url(#edge2)">${backRib}</g>
<g filter="url(#edge)"><path d="${body}" fill="url(#${id}g)"/></g>
<g clip-path="url(#${id}c)">
<rect x="${x - w}" y="${y - h * 1.1}" width="${w * 2}" height="${h * 1.2}" fill="url(#lin)"/>
<rect x="${x - w}" y="${y - h * 1.1}" width="${w * 2}" height="${h * 1.2}" filter="url(#slub)" opacity=".5" style="mix-blend-mode:multiply"/>
<rect x="${x - w}" y="${y - h * 1.1}" width="${w * 2}" height="${h * 1.2}" fill="url(#${id}v)"/>
<g filter="url(#b2)">${creases}${gathers}</g>
<ellipse cx="${F(x - bw * 0.35)}" cy="${F(y - h * 0.45)}" rx="${F(bw * 0.28)}" ry="${F(h * 0.26)}" fill="#f7e3c4" opacity=".16" filter="url(#b5)"/>
<ellipse cx="${F(x + bw * 0.75)}" cy="${F(y - h * 0.1)}" rx="${F(bw * 0.3)}" ry="${F(h * 0.12)}" fill="#bd7d4a" opacity=".16" filter="url(#b5)"/>
${print}</g>
<g filter="url(#edge2)">${frontRib}</g>`;
    return { defs, art };
}

const beanPile = (cx, cy, n, spread, seed) => {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < n; i++) out += bean(cx + (r() - 0.5) * spread, cy + (r() - 0.5) * spread * 0.32, r() * 180, 0.9 + r() * 0.35);
    return out;
};

/* ------------------------------------------------------------------ scenes */

function fridge() {
    const a = pouch(238, 360, 128, 190, { id: 'fa', seed: 11, tone: ['#b2a58f', '#988a74', '#766a58', '#53493d'], ribbon: ['#51603f', '#7a8a62'] });
    const b = pouch(364, 346, 108, 160, { id: 'fb', seed: 21, tone: ['#a99a84', '#8e7f69', '#6d614f', '#4b4136'], ribbon: ['#51603f', '#7a8a62'] });
    return frame(`
<rect width="600" height="450" fill="url(#frw)"/>
<g filter="url(#b12)" opacity=".7"><ellipse cx="60" cy="150" rx="55" ry="90" fill="#a9bd93"/><ellipse cx="540" cy="120" rx="50" ry="100" fill="#b6c79d"/><ellipse cx="500" cy="230" rx="30" ry="50" fill="#93aa80"/></g>
<g filter="url(#b12)" opacity=".8"><rect x="230" y="0" width="120" height="260" fill="#fff"/></g>
<rect y="332" width="600" height="118" fill="#bfa27a"/><rect y="332" width="600" height="118" filter="url(#woodgrain)" opacity=".7" style="mix-blend-mode:multiply"/>
<rect y="330" width="600" height="4" fill="#f1dfc0" opacity=".6"/>
<path d="M0 372 H600 M0 412 H600" stroke="#3a2512" stroke-opacity=".35" stroke-width="1.4"/>
${b.art}${a.art}
${beanPile(300, 392, 14, 190, 5)}`,
    `<linearGradient id="frw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f5f2"/><stop offset="1" stop-color="#cfdad6"/></linearGradient>${a.defs}${b.defs}`);
}

function shoe() {
    const p = pouch(206, 362, 150, 224, { id: 'sh', seed: 5, tone: ['#a07f67', '#85644e', '#684c3b', '#47352a'], ribbon: ['#3d2433', '#62415a'] });
    return frame(`
<rect width="600" height="450" fill="url(#shw)"/>
<g filter="url(#b12)" opacity=".85"><path d="M20 20 H200 V210 H20Z" fill="#fbecc9"/></g>
<path d="M0 300 H600 V450 H0Z" fill="#8a5a36"/><rect y="300" width="600" height="150" filter="url(#woodgrain)" opacity=".8" style="mix-blend-mode:multiply"/>
<path d="M0 340 H600 M0 384 H600 M0 424 H600" stroke="#2a170a" stroke-opacity=".4" stroke-width="1.6"/>
<path d="M60 450 L150 300 L260 300 L190 450Z" fill="#f2cf94" opacity=".3" filter="url(#b5)" style="mix-blend-mode:screen"/>
<ellipse cx="450" cy="372" rx="190" ry="22" fill="#1a0e05" opacity=".4" filter="url(#b5)" style="mix-blend-mode:multiply"/>
<g filter="url(#edge)">
<path d="M326 372 Q322 340 350 336 L560 330 Q606 330 610 360 Q610 378 580 380 L352 384 Q328 384 326 372Z" fill="#e4dac6"/>
<path d="M326 372 Q326 380 350 384 L580 380 Q606 378 610 362 L610 366 Q606 384 578 386 L352 390 Q326 390 326 372Z" fill="#a89a80"/>
<path d="M338 338 Q344 280 384 266 L448 258 Q486 286 540 292 Q596 300 612 332 L560 334 L350 340Z" fill="url(#shoeUp)"/>
<path d="M520 296 Q590 302 610 330 L560 334 Q540 320 520 296Z" fill="#ece6d6"/>
<path d="M400 268 q20 14 44 20 M388 284 q26 12 54 18 M376 300 q30 10 62 16" stroke="#f4f0e4" stroke-width="4.4" fill="none" stroke-linecap="round"/>
</g>
${p.art}
${beanPile(300, 410, 9, 260, 8)}`,
    `<linearGradient id="shw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0cfb2"/><stop offset="1" stop-color="#b79d7a"/></linearGradient>
<linearGradient id="shoeUp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8195a6"/><stop offset=".7" stop-color="#5d6f80"/><stop offset="1" stop-color="#3f4e5c"/></linearGradient>${p.defs}`);
}

function car() {
    const p = pouch(302, 352, 142, 206, { id: 'cr', seed: 9, light: 'r', noShadow: true, tone: ['#a68468', '#8a6850', '#6b4e3b', '#4a362a'], ribbon: ['#3d2433', '#62415a'] });
    return frame(`
<rect width="600" height="450" fill="url(#crw)"/>
<g filter="url(#b12)" opacity=".85"><ellipse cx="500" cy="262" rx="150" ry="60" fill="#f5b374"/></g>
<g filter="url(#b5)" opacity=".7"><rect x="30" y="250" width="80" height="60" fill="#6a6483"/><rect x="120" y="226" width="50" height="84" fill="#7a7390"/><rect x="190" y="262" width="90" height="48" fill="#6a6483"/><rect x="390" y="238" width="60" height="72" fill="#7a7390"/></g>
<g filter="url(#b5)" opacity=".85"><circle cx="70" cy="282" r="5" fill="#ffd89a"/><circle cx="148" cy="262" r="4" fill="#ffc07a"/><circle cx="420" cy="266" r="5" fill="#ff9a6a"/><circle cx="238" cy="288" r="4" fill="#ffe1ad"/></g>
<path d="M0 340 Q150 312 300 318 T600 308 V450 H0Z" fill="#1f1b1c"/>
<path d="M0 340 Q150 312 300 318 T600 308" stroke="#e8b080" stroke-opacity=".55" stroke-width="3" fill="none"/>
<path d="M0 372 Q300 350 600 354 V450 H0Z" fill="#131011"/>
<path d="M440 0 H600 V40 Q520 70 440 40Z" fill="#17151a"/>
<g filter="url(#edge2)"><path d="M284 156 L300 0 M318 156 L306 0" stroke="#3d2433" stroke-width="6.4" stroke-linecap="round" fill="none"/><path d="M285 156 L301 0 M319 156 L307 0" stroke="#7a566c" stroke-width="1.6" fill="none" opacity=".7"/></g>
${p.art}
<ellipse cx="302" cy="392" rx="120" ry="11" fill="#000" opacity=".28" filter="url(#b5)"/>`,
    `<linearGradient id="crw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5078"/><stop offset=".45" stop-color="#a0808a"/><stop offset=".75" stop-color="#eba776"/><stop offset="1" stop-color="#f4c58c"/></linearGradient>${p.defs}`);
}

/** A rectangular soap bar seen from slightly above: front, top and right faces with flecks. */
function bar(x, y, w, h, d, seed, idn, rot = 0, pivot = [0, 0]) {
    const r = rng(seed);
    const fx = d * 0.55;
    const fy = d * 0.34;
    const front = `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    const top = `M${x} ${y}L${x + fx} ${y - fy}H${x + w + fx}L${x + w} ${y}Z`;
    const side = `M${x + w} ${y}L${x + w + fx} ${y - fy}V${y + h - fy}L${x + w} ${y + h}Z`;
    const flecks = (poly, n, bx, by, bw, bh) => {
        let out = '';
        for (let i = 0; i < n; i++) {
            const k = r();
            out += `<ellipse cx="${f1(bx + r() * bw)}" cy="${f1(by + r() * bh)}" rx="${f1(.6 + r() * 1.5)}" ry="${f1(.5 + r() * 1)}" fill="${k > .45 ? '#2f2925' : '#cfc7bb'}" opacity="${f1(.35 + r() * .5)}"/>`;
        }
        return `<clipPath id="${idn}${poly}"><path d="${poly === 'f' ? front : poly === 't' ? top : side}"/></clipPath><g clip-path="url(#${idn}${poly})">${out}</g>`;
    };
    return `<g transform="rotate(${rot} ${pivot[0]} ${pivot[1]})">
<ellipse cx="${x + w * 0.55}" cy="${y + h + 4}" rx="${w * 0.62}" ry="${h * 0.12}" fill="#1c1208" opacity=".38" filter="url(#b5)" style="mix-blend-mode:multiply"/>
<g filter="url(#edge2)"><path d="${front}" fill="#5e5852"/><path d="${top}" fill="#837d76"/><path d="${side}" fill="#46413c"/></g>
${flecks('f', Math.round(w * h / 70), x, y, w, h)}${flecks('t', Math.round(w * d / 120), x + 6, y - fy, w, fy)}${flecks('s', 30, x + w, y - fy, fx, h)}
<path d="M${x} ${y}H${x + w}" stroke="#a49d94" stroke-opacity=".6" stroke-width="2" filter="url(#b2)"/>
<path d="M${x + w} ${y}V${y + h}" stroke="#2a2622" stroke-opacity=".5" stroke-width="3" filter="url(#b2)"/></g>`;
}

function soap() {
    return frame(`
<rect width="600" height="450" fill="#b9a37f"/>
<g filter="url(#wave)"><rect x="-40" y="-40" width="680" height="530" fill="url(#bur)"/></g>
<g filter="url(#b12)"><path d="M-20 90 Q150 20 300 80 T640 40 V0 H-20Z" fill="#f4e3bf" opacity=".4"/><path d="M-20 400 Q200 330 360 390 T640 360 V460 H-20Z" fill="#5e4a2c" opacity=".35"/><path d="M420 -10 Q470 200 520 460 H640 V-10Z" fill="#6a5535" opacity=".25"/></g>
${bar(160, 92, 196, 66, 40, 3, 'ba')}
${bar(124, 164, 214, 118, 34, 7, 'bb')}
${bar(392, 146, 152, 84, 50, 13, 'bc', -13, [470, 190])}
<g>${beanPile(280, 346, 17, 190, 21)}${beanPile(330, 392, 9, 150, 22)}${bean(448, 396, 20, 1.05)}${bean(476, 372, 80, 1)}</g>`);
}

function candle() {
    const r = rng(77);
    const cx = 290;
    let top = '';
    for (let i = 0; i < 560; i++) {
        const a = r() * 6.283;
        const d = Math.sqrt(r());
        const k = r();
        top += `<ellipse cx="${f1(cx + Math.cos(a) * 112 * d)}" cy="${f1(182 + Math.sin(a) * 36 * d)}" rx="${f1(.9 + r() * 2.4)}" ry="${f1(.7 + r() * 1.5)}" fill="${k > .8 ? '#8b5a3a' : k > .4 ? '#3d2217' : '#20120b'}" opacity="${f1(.6 + r() * .4)}"/>`;
    }
    let spill = '';
    for (let i = 0; i < 170; i++) {
        const x = 20 + r() * 120 + (r() - 0.5) * 40;
        const y = 262 + r() * 140;
        spill += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(1 + r() * 3)}" ry="${f1(.8 + r() * 2)}" fill="${r() > .5 ? '#2a170e' : '#4a2a19'}" opacity="${f1(.6 + r() * .4)}"/>`;
    }
    let flowers = '';
    for (let i = 0; i < 30; i++) {
        flowers += `<circle cx="${f1(470 + r() * 120)}" cy="${f1(20 + r() * 190)}" r="${f1(3 + r() * 5)}" fill="#f2e6cf" opacity="${f1(.4 + r() * .4)}"/>`;
    }
    return frame(`
<rect width="600" height="450" fill="url(#cdw)"/>
<g filter="url(#b5)">${flowers}<path d="M520 220 Q540 120 570 30 M560 230 Q585 140 600 60" stroke="#b79b68" stroke-width="2" fill="none"/></g>
<ellipse cx="300" cy="376" rx="300" ry="80" fill="#2a170a" opacity=".3" filter="url(#b5)"/>
<g filter="url(#edge)"><ellipse cx="300" cy="376" rx="290" ry="74" fill="url(#cdb)"/></g>
<g clip-path="url(#cbc)" opacity=".8"><path d="M60 424 Q200 344 420 384 M120 444 Q280 384 500 414 M30 384 Q160 334 320 349" stroke="#3a2010" stroke-opacity=".55" stroke-width="7" fill="none" filter="url(#b2)"/></g>
<g>${spill}</g>
<ellipse cx="318" cy="356" rx="150" ry="20" fill="#1c0f06" opacity=".5" filter="url(#b5)"/>
<g filter="url(#edge)">
<path d="M162 180 V322 Q162 356 290 358 Q418 356 418 322 V180Z" fill="url(#cdm)"/>
<ellipse cx="290" cy="180" rx="128" ry="44" fill="#f1e4c9"/>
</g>
<rect x="222" y="236" width="136" height="64" rx="3" fill="#d8c19a" filter="url(#edge2)"/>
<rect x="222" y="236" width="136" height="64" rx="3" fill="url(#lin)" opacity=".8"/>
<text x="290" y="266" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="700" letter-spacing="3" fill="#3a2418" opacity=".85" style="mix-blend-mode:multiply">LẮNG</text>
<text x="290" y="287" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2" fill="#3a2418" opacity=".75" style="mix-blend-mode:multiply">COFFEE CANDLE</text>
<ellipse cx="290" cy="182" rx="118" ry="39" fill="#d7b88a" opacity=".5"/>
<ellipse cx="290" cy="183" rx="112" ry="36" fill="#241109"/>
<g clip-path="url(#cct)">${top}</g>
<ellipse cx="290" cy="183" rx="112" ry="36" fill="none" stroke="#c9a074" stroke-opacity=".35" stroke-width="3"/>
<ellipse cx="290" cy="186" rx="84" ry="24" fill="#d9712e" opacity=".22" filter="url(#b12)" style="mix-blend-mode:screen"/>
<path d="M290 186 V170" stroke="#120a05" stroke-width="3" stroke-linecap="round"/>
<g filter="url(#edge2)"><path d="M290 126 C300 142 304 158 290 171 C276 158 280 142 290 126Z" fill="#f4b45a"/><path d="M290 143 C295 152 294 162 290 170 C286 162 285 152 290 143Z" fill="#fff0c0"/></g>
<path d="M172 214 V334" stroke="#fff6e2" stroke-opacity=".5" stroke-width="10" filter="url(#b5)"/>
<path d="M402 214 V334" stroke="#7a5f3a" stroke-opacity=".3" stroke-width="12" filter="url(#b5)"/>`,
    `<linearGradient id="cdw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f2ee"/><stop offset=".6" stop-color="#e3e0da"/><stop offset="1" stop-color="#c9c4bb"/></linearGradient>
<linearGradient id="cdb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4a373"/><stop offset=".5" stop-color="#b57d4c"/><stop offset="1" stop-color="#8a5530"/></linearGradient>
<linearGradient id="cdm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2e7cf"/><stop offset=".5" stop-color="#e3d3b2"/><stop offset="1" stop-color="#b79f7a"/></linearGradient>
<clipPath id="cct"><ellipse cx="290" cy="183" rx="112" ry="36"/></clipPath>
<clipPath id="cbc"><ellipse cx="300" cy="376" rx="290" ry="74"/></clipPath>`);
}

const SCENES = {
    'fridge-sachet': fridge,
    'shoe-deodorizer': shoe,
    'car-sachet': car,
    'scrub-soap': soap,
    candle,
};

/** Painted still life for a product id, as an SVG data URI. */
function productArt(id) {
    return uri((SCENES[id] ?? fridge)());
}

export { productArt };
