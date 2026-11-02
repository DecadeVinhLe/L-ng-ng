import { add, clear, h } from '../core/dom';
import { formatVnd, summarize } from '../core/loop';
import { addBatch, atWorkshop, dryGrams, emptyState, pickUp, produce, sell } from '../core/state';
import { BRANDS, HUBS } from '../data/places';
import { t } from '../i18n/index';
import { pageHeader } from './ui';
/**
 * Guided demo of the whole loop with sample numbers. It runs on its own in-memory state, so it never
 * touches the real data saved in the browser. It uses the same functions as the real pages.
 */
const CAFE = 'c-ros';
const SHOP = 'c-gutram';
const HUB = 'h-a35';
const PRODUCT = 'candle';
const KG = 4;
const SOLD = 10;
const QUALITY = { moisturePct: 55, contaminantPct: 3, ageHours: 6, ph: 5.4, moldVisible: false };
const nameOf = (id) => BRANDS.find((b) => b.id === id)?.name ?? id;
const hubName = () => HUBS.find((x) => x.id === HUB)?.name ?? HUB;
const STEPS = [
    {
        run(state) {
            const res = addBatch(state, { brandId: CAFE, hubId: HUB, kg: KG, quality: QUALITY });
            if (!res.ok)
                return res;
            const b = res.value.batches[0];
            return { ok: true, value: res.value, note: { key: 'd_r1', p: { grade: b.result.grade, score: b.result.score, kg: KG, hub: hubName() } } };
        },
    },
    {
        run(state) {
            const res = pickUp(state, HUB);
            if (!res.ok)
                return res;
            return { ok: true, value: res.value.state, note: { key: 'd_r2', p: { kg: res.value.kg, count: res.value.count } } };
        },
    },
    {
        run(state) {
            const batch = atWorkshop(state)[0];
            if (!batch)
                return { ok: false, error: 'err_batch' };
            const res = produce(state, batch.id, PRODUCT);
            if (!res.ok)
                return res;
            return { ok: true, value: res.value, note: { key: 'd_r3', p: { units: res.value.productions[0].units, product: t(`p_${PRODUCT}`), g: dryGrams(batch) } } };
        },
    },
    {
        run(state) {
            const res = sell(state, { productId: PRODUCT, shopId: SHOP, units: SOLD });
            if (!res.ok)
                return res;
            return { ok: true, value: res.value, note: { key: 'd_r4', p: { units: SOLD, product: t(`p_${PRODUCT}`), cafe: nameOf(SHOP), v: formatVnd(res.value.sales[0].revenueVnd) } } };
        },
    },
    {
        run(state) {
            const s = summarize(state);
            return { ok: true, value: state, note: { key: 'd_r5', p: { kg: s.divertedKg, co2: s.co2AvoidedKg } } };
        },
    },
];
// Kept between language switches so the page does not reset itself.
let demo = { state: emptyState(), notes: [], error: '' };
const reset = () => { demo = { state: emptyState(), notes: [], error: '' }; };
function runNext() {
    const step = STEPS[demo.notes.length];
    if (!step)
        return;
    const res = step.run(demo.state);
    if (!res.ok) {
        demo.error = res.error;
        return;
    }
    demo.error = '';
    demo.state = res.value;
    demo.notes.push(res.note);
}
function renderDemo(root) {
    clear(root);
    const body = h('div', { class: 'wrap pg' });
    const draw = () => {
        clear(body);
        const done = demo.notes.length;
        const finished = done >= STEPS.length;
        const s = summarize(demo.state);
        const list = h('ol', { class: 'demo-steps' }, ...STEPS.map((_, i) => {
            const state = i < done ? 'done' : i === done ? 'now' : 'todo';
            const note = demo.notes[i];
            return h('li', { class: `demo-step ${state}`, 'aria-current': state === 'now' ? 'step' : undefined }, h('span', { class: 'demo-n' }, String(i + 1)), h('div', {}, h('h3', {}, t(`d_${i + 1}_t`)), h('p', {}, t(`d_${i + 1}_b`, { cafe: nameOf(CAFE), shop: nameOf(SHOP), hub: hubName(), kg: KG, product: t(`p_${PRODUCT}`), units: SOLD })), note ? h('p', { class: 'ok', 'aria-live': 'polite' }, t(note.key, note.p)) : null));
        }));
        const next = h('button', { class: 'btn', type: 'button', disabled: finished }, t(done === 0 ? 'd_start' : 'd_next'));
        next.addEventListener('click', () => { runNext(); draw(); });
        const all = h('button', { class: 'btn ghost', type: 'button', disabled: finished }, t('d_all'));
        all.addEventListener('click', () => { while (demo.notes.length < STEPS.length && !demo.error)
            runNext(); draw(); });
        const again = h('button', { class: 'btn ghost', type: 'button', disabled: done === 0 }, t('d_reset'));
        again.addEventListener('click', () => { reset(); draw(); });
        add(body, h('p', { class: 'note' }, t('note_sample')), h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': STEPS.length, 'aria-valuenow': done, 'aria-label': t('d_progress') }, h('div', { class: 'fill', style: `width:${(done / STEPS.length) * 100}%` })), list, demo.error ? h('p', { class: 'err', role: 'alert' }, t(demo.error)) : null, h('div', { class: 'row' }, next, all, again), finished
            ? h('section', { class: 'demo-end' }, h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('strong', {}, `${s.divertedKg} kg`), h('span', {}, t('d_s_kg'))), h('div', { class: 'stat' }, h('strong', {}, String(s.unitsProduced)), h('span', {}, t('d_s_units'))), h('div', { class: 'stat' }, h('strong', {}, formatVnd(s.revenueVnd)), h('span', {}, t('d_s_rev'))), h('div', { class: 'stat' }, h('strong', {}, `${s.co2AvoidedKg} kg`), h('span', {}, t('d_s_co2')))), h('p', {}, t('d_end')), h('div', { class: 'row' }, h('a', { class: 'btn', href: '#collect' }, t('d_try'))))
            : null);
    };
    draw();
    root.append(pageHeader('d_title', 'd_sub'), body);
}
export { renderDemo };
