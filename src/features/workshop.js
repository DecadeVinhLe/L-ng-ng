import { add, clear, h, toast } from '../core/dom';
import { formatVnd } from '../core/loop';
import { gradeAtLeast } from '../core/quality';
import { atWorkshop, defaultEnv, dryGrams, produce, stock, unitsFromBatch } from '../core/state';
import { placeById } from '../data/places';
import { PRODUCTS } from '../data/products';
import { t } from '../i18n/index';
import { empty, field, fmtDate, gradeBadge, option, pageHeader } from './ui';
function renderWorkshop(root, store) {
    clear(root);
    const state = store.get();
    const ready = atWorkshop(state);
    const body = h('div', { class: 'wrap pg' }, h('p', { class: 'note' }, t('note_sample')));
    if (ready.length === 0) {
        body.append(empty('w_none'), h('a', { class: 'btn', href: '#hub' }, t('w_go_hub')));
    }
    else {
        const batchSel = h('select', { name: 'batch' }, ...ready.map((b) => option(b.id, `${placeById(b.brandId)?.name ?? b.brandId} · ${b.kg} kg · ${t(`g_${b.result.grade}`)} · ${fmtDate(b.receivedAt)}`)));
        const productSel = h('select', { name: 'product' });
        const info = h('div', { class: 'preview', 'aria-live': 'polite' });
        const current = () => ready.find((b) => b.id === batchSel.value);
        function refresh() {
            const b = current();
            clear(productSel);
            clear(info);
            if (!b)
                return;
            const options = PRODUCTS.filter((p) => b.result.grade !== 'reject' && gradeAtLeast(b.result.grade, p.minGrade));
            options.forEach((p) => productSel.append(option(p.id, `${t(`p_${p.id}`)} (≥ ${t(`g_${p.minGrade}`)})`)));
            const pid = productSel.value;
            add(info, h('div', { class: 'row' }, h('strong', {}, t('w_batch_grade')), gradeBadge(b.result.grade, b.result.score)), h('p', {}, t('w_dry', { kg: Math.round(dryGrams(b)) / 1000, wet: b.kg })), pid ? h('p', { class: 'ok' }, t('w_units', { n: unitsFromBatch(b, pid), name: t(`p_${pid}`) })) : null, pid ? h('p', { class: 'mut' }, t(`p_${pid}_d`)) : null);
        }
        batchSel.addEventListener('change', refresh);
        productSel.addEventListener('change', refresh);
        const form = h('form', { class: 'card form', novalidate: true }, h('div', { class: 'grid' }, field('w_pick', batchSel), field('w_product', productSel)), info, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, t('w_make'))));
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const res = produce(store.get(), batchSel.value, productSel.value, defaultEnv);
            if (!res.ok) {
                toast(t(res.error));
                return;
            }
            store.set(res.value);
            toast(t('w_made'));
        });
        body.append(form);
        refresh();
    }
    const inStock = stock(state);
    body.append(h('h2', {}, t('w_stock')), h('div', { class: 'cards' }, ...PRODUCTS.map((p) => h('div', { class: 'card' }, h('h3', {}, t(`p_${p.id}`)), h('p', { class: 'big' }, String(inStock[p.id])), h('p', { class: 'mut' }, `${p.gramsPerUnit} g · ${formatVnd(p.priceVnd)}`)))));
    root.append(pageHeader('w_title', 'w_sub'), body);
}

export { renderWorkshop };
