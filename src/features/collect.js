import { clear, h, toast } from '../core/dom';
import { addBatch, defaultEnv, hubConfig, hubWaitingKg, scheduledPickups } from '../core/state';
import { assessQuality, parseQualityInput, productsFor } from '../core/quality';
import { BRANDS, COMMUNITIES, HUBS, HUB_FOR_ZONE, placeById } from '../data/places';
import { t } from '../i18n/index';
import { empty, field, fmtDate, gradeBadge, numberInput, option, pageHeader } from './ui';
function renderCollect(root, store) {
    clear(root);
    const brand = h('select', { name: 'brandId' }, h('optgroup', { label: t('c_group_cafe') }, ...BRANDS.map((b) => option(b.id, b.name))), h('optgroup', { label: t('c_group_com') }, ...COMMUNITIES.map((x) => option(x.id, x.name))));
    // Booked household pick-ups: choosing one fills in the community and weight.
    const booked = scheduledPickups(store.get());
    const pickup = h('select', { name: 'pickupId' }, option('', t('c_pickup_none')), ...booked.map((p) => option(p.id, `${p.date} · ${placeById(p.communityId)?.name ?? p.communityId} · ${p.name} · ${p.kg} kg`)));
    const hubState = (id) => {
        const cfg = hubConfig(store.get(), id);
        const left = cfg.capacityKg - hubWaitingKg(store.get(), id);
        return { open: cfg.open, left };
    };
    const hubLabel = (x) => {
        const st = hubState(x.id);
        return st.open ? x.name : `${x.name} · ${t('hb_closed')}`;
    };
    const hub = h('select', { name: 'hubId' }, ...HUBS.map((x) => {
        const o = option(x.id, hubLabel(x));
        o.disabled = !hubState(x.id).open;
        return o;
    }));
    const syncHub = () => {
        const zone = placeById(brand.value)?.zone;
        const want = zone ? HUB_FOR_ZONE[zone] : undefined;
        // Use the area's own hub when it is open; otherwise the first hub that is.
        hub.value = want && hubState(want).open ? want : (HUBS.find((x) => hubState(x.id).open)?.id ?? want ?? hub.value);
    };
    const kg = numberInput('kg', 20, { min: 0.1, max: 1000 });
    brand.addEventListener('change', () => {
        // Changing the source drops a pick-up that belongs to another community.
        const chosen = booked.find((p) => p.id === pickup.value);
        if (chosen && chosen.communityId !== brand.value)
            pickup.value = '';
        syncHub();
    });
    pickup.addEventListener('change', () => {
        const chosen = booked.find((p) => p.id === pickup.value);
        if (!chosen)
            return;
        brand.value = chosen.communityId;
        kg.value = String(chosen.kg);
        syncHub();
        updatePreview();
    });
    syncHub();
    const moisture = numberInput('moisturePct', 60, { min: 0, max: 100 });
    const contaminant = numberInput('contaminantPct', 3, { min: 0, max: 100 });
    const age = numberInput('ageHours', 6, { min: 0 });
    const ph = numberInput('ph', 5.2, { min: 0, max: 14, step: 0.1 });
    const mold = h('input', { type: 'checkbox', name: 'moldVisible' });
    const preview = h('div', { class: 'preview', 'aria-live': 'polite' });
    const form = h('form', { class: 'card form', novalidate: true }, h('div', { class: 'grid' }, field('c_brand', brand), field('c_hub', hub), booked.length ? field('c_pickup', pickup, 'c_pickup_h') : null, field('c_kg', kg, 'c_kg_h'), field('c_moist', moisture, 'c_moist_h'), field('c_contam', contaminant, 'c_contam_h'), field('c_age', age), field('c_ph', ph)), h('label', { class: 'chk' }, mold, h('span', {}, t('c_mold'))), preview, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, t('c_log'))));
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
        const res = addBatch(store.get(), { brandId: brand.value, hubId: hub.value, kg: Number(kg.value), quality: parsed.value, pickupId: pickup.value || undefined }, defaultEnv);
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
