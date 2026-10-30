import { clear, h, toast } from '../core/dom';
import { addBatch, defaultEnv } from '../core/state';
import { assessQuality, parseQualityInput, productsFor } from '../core/quality';
import { BRANDS, HUBS, HUB_FOR_ZONE, placeById } from '../data/places';
import { t } from '../i18n/index';
import { empty, field, fmtDate, gradeBadge, numberInput, option, pageHeader } from './ui';
function renderCollect(root, store) {
    clear(root);
    const brand = h('select', { name: 'brandId' }, ...BRANDS.map((b) => option(b.id, b.name)));
    const hub = h('select', { name: 'hubId' }, ...HUBS.map((x) => option(x.id, x.name)));
    const syncHub = () => {
        const zone = BRANDS.find((b) => b.id === brand.value)?.zone;
        if (zone)
            hub.value = HUB_FOR_ZONE[zone];
    };
    brand.addEventListener('change', syncHub);
    syncHub();
    const kg = numberInput('kg', 20, { min: 0.1, max: 1000 });
    const moisture = numberInput('moisturePct', 60, { min: 0, max: 100 });
    const contaminant = numberInput('contaminantPct', 3, { min: 0, max: 100 });
    const age = numberInput('ageHours', 6, { min: 0 });
    const ph = numberInput('ph', 5.2, { min: 0, max: 14, step: 0.1 });
    const mold = h('input', { type: 'checkbox', name: 'moldVisible' });
    const preview = h('div', { class: 'preview', 'aria-live': 'polite' });
    const form = h('form', { class: 'card form', novalidate: true }, h('div', { class: 'grid' }, field('c_brand', brand), field('c_hub', hub), field('c_kg', kg, 'c_kg_h'), field('c_moist', moisture, 'c_moist_h'), field('c_contam', contaminant, 'c_contam_h'), field('c_age', age), field('c_ph', ph)), h('label', { class: 'chk' }, mold, h('span', {}, t('c_mold'))), preview, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, t('c_log'))));
    const readQuality = () => parseQualityInput(Object.fromEntries(new FormData(form).entries()));
    function updatePreview() {
        clear(preview);
        const parsed = readQuality();
        if (!parsed.ok) {
            preview.append(h('p', { class: 'err' }, t(parsed.error)));
            return;
        }
        const r = assessQuality(parsed.value);
        const usable = productsFor(r.grade);
        preview.append(h('div', { class: 'row' }, h('strong', {}, t('c_preview')), gradeBadge(r.grade, r.score)), r.issues.length ? h('ul', { class: 'issues' }, ...r.issues.map((i) => h('li', {}, t(`i_${i}`)))) : h('p', { class: 'ok' }, t('c_clean')), h('p', { class: 'mut' }, usable.length ? `${t('c_usable')} ${usable.map((p) => t(`p_${p.id}`)).join(', ')}` : t('c_none')));
    }
    form.addEventListener('input', updatePreview);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const parsed = readQuality();
        if (!parsed.ok) {
            toast(t(parsed.error));
            return;
        }
        const res = addBatch(store.get(), { brandId: brand.value, hubId: hub.value, kg: Number(kg.value), quality: parsed.value }, defaultEnv);
        if (!res.ok) {
            toast(t(res.error));
            return;
        }
        store.set(res.value);
        toast(t('c_logged'));
    });
    updatePreview();
    const state = store.get();
    const list = state.batches.length
        ? h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['c_th_brand', 'c_th_kg', 'c_th_grade', 'c_th_when', 'c_th_status'].map((k) => h('th', {}, t(k))))), h('tbody', {}, ...state.batches.map((b) => h('tr', {}, h('td', {}, placeById(b.brandId)?.name ?? b.brandId), h('td', {}, `${b.kg} kg`), h('td', {}, gradeBadge(b.result.grade, b.result.score)), h('td', {}, fmtDate(b.receivedAt)), h('td', {}, t(b.processed ? 'c_done' : b.result.grade === 'reject' ? 'c_rejected' : b.pickedUpAt ? 'c_picked' : 'c_at_hub')))))))
        : empty('c_empty');
    const brands = h('div', { class: 'cards' }, ...BRANDS.map((b) => h('div', { class: 'card shop' }, h('h3', {}, b.name), h('p', { class: 'mut' }, b.address ?? b.district), h('p', {}, `≈ ${b.groundsKgPerWeek} ${t('kg_wk')}`))));
    root.append(pageHeader('c_title', 'c_sub'), h('div', { class: 'wrap pg' }, form, h('h2', {}, t('c_batches')), list, h('h2', {}, t('c_brands')), h('p', { class: 'note' }, t('note_sample')), brands));
}

export { renderCollect };
