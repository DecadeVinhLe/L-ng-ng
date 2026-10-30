import { clear, h } from '../core/dom';
import { formatVnd, summarize } from '../core/loop';
import { ZONES, brandsInZone, mapsUrl } from '../data/places';
import { heroPhoto, productPhoto, storyPhoto } from '../data/images';
import { PRODUCTS } from '../data/products';
import { t } from '../i18n/index';
import { LOOP_STEPS } from './hero';
import { mountGoogleMap } from './gmap';
import { mountHero } from './scene3d';
import { mountFigure } from './three-fig';
/** Image that falls back to a second source, then to a plain block, if it cannot load. */
const photo = (src, alt, cls, eager = false, fallback) => {
    const img = h('img', { src, alt, class: cls, decoding: 'async', referrerpolicy: 'no-referrer' });
    if (!eager)
        img.loading = 'lazy';
    let retried = false;
    img.addEventListener('error', () => {
        if (fallback && !retried) {
            retried = true;
            img.src = fallback;
        }
        else {
            img.classList.add('broken');
        }
    });
    return img;
};
// ---- Map: Google Maps (see gmap.ts) ----
const mapBlock = () => h('div', { class: 'gmap', role: 'region', 'aria-label': t('map_alt') });
const legend = () => h('p', { class: 'legend' }, h('span', {}, h('i', { class: 'k-cafe' }), t('leg_cafe')), h('span', {}, h('i', { class: 'k-hub' }), t('leg_hub')), h('span', {}, h('i', { class: 'k-ws' }), t('leg_ws')));
function zoneList(zone, start) {
    return h('section', { class: 'zone' }, h('h3', { class: 'zone-t' }, t(`z_${zone}`)), h('p', { class: 'mono-sm' }, ZONES[zone].addresses.join(' · ')), h('ul', { class: 'ledger' }, ...brandsInZone(zone).map((b, i) => h('li', { 'data-n': start + i + 1 }, h('span', { class: 'n' }, String(start + i + 1).padStart(2, '0')), h('a', { class: 'who', href: mapsUrl(b), target: '_blank', rel: 'noopener noreferrer' }, h('b', {}, b.name), h('span', {}, b.address ?? b.district)), h('span', { class: 'kg' }, `${b.groundsKgPerWeek} ${t('kg_short')}`)))));
}
const productRow = (p) => h('li', {}, h('div', { class: 'thumb' }, photo(productPhoto(p.id), '', 'cover')), h('div', { class: 'dish' }, h('h3', {}, t(`p_${p.id}`)), h('p', { class: 'mut' }, t(`p_${p.id}_d`))), h('span', { class: 'dots', 'aria-hidden': 'true' }), h('span', { class: 'price' }, formatVnd(p.priceVnd)));
const figure = (value, key) => h('li', {}, h('strong', {}, value), h('span', {}, t(key)));
function renderHome(root, store) {
    clear(root);
    const s = summarize(store.get());
    const bd = brandsInZone('bd').length;
    root.append(h('section', { class: 'hero' }, photo(heroPhoto(), '', 'hero-img', true), h('div', { class: 'hero-copy wrap' }, h('p', { class: 'eyebrow' }, t('h_eyebrow')), h('h1', {}, t('h_t')), h('p', { class: 'lead' }, t('h_p')), h('div', { class: 'row' }, h('a', { class: 'btn', href: '#collect' }, t('h_cta')), h('a', { class: 'btn ghost-on-photo', href: '#impact' }, t('h_cta2'))))), h('section', { class: 'story wrap' }, h('div', { class: 'story-copy' }, h('h2', {}, t('story_t')), h('p', { class: 'lead' }, t('story_p')), h('ul', { class: 'features' }, ...[1, 2, 3].map((n) => h('li', {}, h('h3', {}, t(`f${n}_t`)), h('p', { class: 'mut' }, t(`f${n}_d`)))))), h('figure', { class: 'story-fig' }, h('div', { class: 'story-img' }, photo(storyPhoto(), '', 'cover')))), h('section', { class: 'wrap board' }, h('div', { class: 'board-head' }, h('h2', {}, t('prod_t')), h('p', { class: 'mut' }, t('prod_sub'))), h('div', {}, h('ul', { class: 'menu' }, ...PRODUCTS.map(productRow)), h('p', { class: 'note' }, t('price_note')))), h('section', { class: 'where' }, h('div', { class: 'wrap' }, h('h2', {}, t('cafes_t')), h('p', { class: 'mut' }, t('cafes_sub')), mapBlock(), h('div', { class: 'row map-row' }, legend(), h('a', { class: 'btn', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('cafe near 34 Bạch Đằng, Tân Bình, Hồ Chí Minh')}`, target: '_blank', rel: 'noopener noreferrer' }, t('map_open'))), h('div', { class: 'zones' }, zoneList('bd', 0), zoneList('lqd', bd)), h('p', { class: 'note' }, `${t('map_note')} ${t('note_sample')}`))), h('section', { class: 'wrap how' }, h('h2', {}, t('steps_t')), h('ol', { class: 'route' }, ...LOOP_STEPS.map((key) => h('li', {}, h('h3', {}, t(`st_${key}`)), h('p', { class: 'mut' }, t(`st_${key}_d`))))), h('ul', { class: 'figures' }, figure(`${s.collectedKg} kg`, 'stat_collected'), figure(String(s.unitsProduced), 'stat_units'), figure(`${Math.round(s.circularity * 100)}%`, 'stat_circ'), figure(formatVnd(s.revenueVnd), 'stat_revenue'))));
    const hero = root.querySelector('.hero');
    if (hero)
        mountHero(hero);
    const fig = root.querySelector('.story-img');
    if (fig)
        void mountFigure(fig, { fruit: t('fig_fruit'), bean: t('fig_bean'), ground: t('fig_ground'), item: t('fig_item') });
    // The map is Google Maps. Hovering a café in the list lights its pin.
    const mapBox = root.querySelector('.gmap');
    const handle = mapBox ? mountGoogleMap(mapBox) : Promise.resolve(undefined);
    root.querySelectorAll('.ledger li').forEach((li) => {
        const n = Number(li.dataset['n']);
        const on = (v) => () => void handle.then((m) => m?.highlight(n, v));
        li.addEventListener('pointerenter', on(true));
        li.addEventListener('pointerleave', on(false));
        li.addEventListener('focusin', on(true));
        li.addEventListener('focusout', on(false));
    });
}

export { renderHome };
