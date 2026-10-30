import { clear, h, toast } from '../core/dom';
import { defaultEnv, pickUp, waitingAtHub } from '../core/state';
import { BRANDS, HUBS, placeById } from '../data/places';
import { t } from '../i18n/index';
import { empty, gradeBadge, pageHeader } from './ui';
/** Grounds older than this at the hub are flagged: mold risk goes up after a day. */
const URGENT_HOURS = 24;
const hoursAtHub = (b) => Math.max(0, Math.round((Date.now() - new Date(b.receivedAt).getTime()) / 36e5));
function hubCard(store, hubId) {
    const hub = HUBS.find((x) => x.id === hubId);
    if (!hub)
        return h('div', {});
    const waiting = waitingAtHub(store.get(), hubId);
    const usable = waiting.filter((b) => b.result.grade !== 'reject');
    const kg = Math.round(waiting.reduce((s, b) => s + b.kg, 0) * 10) / 10;
    const pct = Math.min(100, Math.round((kg / hub.capacityKg) * 100));
    const fill = h('div', { class: 'fill' });
    fill.style.width = `${pct}%`;
    const pickBtn = h('button', { class: 'btn', type: 'button' }, t('hb_pickup'));
    pickBtn.disabled = usable.length === 0;
    pickBtn.addEventListener('click', () => {
        const res = pickUp(store.get(), hubId, defaultEnv);
        if (!res.ok) {
            toast(t(res.error));
            return;
        }
        store.set(res.value.state);
        toast(t('hb_picked', { n: res.value.count, kg: res.value.kg }));
    });
    const table = waiting.length
        ? h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['c_th_brand', 'c_th_kg', 'c_th_grade', 'hb_th_wait'].map((k) => h('th', {}, t(k))))), h('tbody', {}, ...waiting.map((b) => {
            const hrs = hoursAtHub(b);
            const note = b.result.grade === 'reject' ? t('hb_reject') : hrs > URGENT_HOURS ? t('hb_soon') : t('hb_ok');
            return h('tr', {}, h('td', {}, placeById(b.brandId)?.name ?? b.brandId), h('td', {}, `${b.kg} kg`), h('td', {}, gradeBadge(b.result.grade, b.result.score)), h('td', {}, `${t('hb_hours', { h: hrs })} · ${note}`));
        }))))
        : empty('hb_none');
    return h('section', { class: 'card hub' }, h('h3', {}, hub.name), h('p', { class: 'mut' }, hub.address ?? hub.district), h('div', { class: 'meter', role: 'img', 'aria-label': t('hb_cap', { kg, cap: hub.capacityKg }) }, fill), h('p', { class: 'mono-sm' }, t('hb_cap', { kg, cap: hub.capacityKg })), table, h('div', { class: 'row' }, pickBtn));
}
function renderHub(root, store) {
    clear(root);
    const state = store.get();
    // What each café has dropped so far: the café's side of the loop.
    const rows = BRANDS.map((b) => {
        const mine = state.batches.filter((x) => x.brandId === b.id);
        return { name: b.name, drops: mine.length, kg: Math.round(mine.reduce((s, x) => s + x.kg, 0) * 10) / 10 };
    }).filter((r) => r.drops > 0);
    const cafes = rows.length
        ? h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, t('c_th_brand')), h('th', {}, t('hb_th_drops')), h('th', {}, t('c_th_kg')))), h('tbody', {}, ...rows.map((r) => h('tr', {}, h('td', {}, r.name), h('td', {}, String(r.drops)), h('td', {}, `${r.kg} kg`))))))
        : empty('hb_cafes_none');
    root.append(pageHeader('hb_title', 'hb_sub'), h('div', { class: 'wrap pg' }, h('p', { class: 'note' }, t('note_sample')), h('h2', {}, t('hb_waiting')), h('div', { class: 'hubs' }, ...HUBS.map((x) => hubCard(store, x.id))), h('h2', {}, t('hb_cafes')), cafes));
}

export { renderHub };
