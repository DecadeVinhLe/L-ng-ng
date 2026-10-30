import { clear, h, toast } from '../core/dom';
import { formatVnd } from '../core/loop';
import { defaultEnv, sell, stock } from '../core/state';
import { BRANDS, placeById } from '../data/places';
import { PRODUCTS, productById } from '../data/products';
import { t } from '../i18n/index';
import { empty, field, fmtDate, numberInput, option, pageHeader } from './ui';
function renderMarket(root, store) {
    clear(root);
    const state = store.get();
    const inStock = stock(state);
    const suppliers = new Set(state.batches.map((b) => b.brandId));
    const cafes = BRANDS.filter((b) => b.kind === 'cafe');
    const shop = h('select', { name: 'shop' }, ...cafes.map((c) => option(c.id, `${c.name}${suppliers.has(c.id) ? ` ★ ${t('m_supplier')}` : ''}`)));
    const product = h('select', { name: 'product' }, ...PRODUCTS.map((p) => option(p.id, `${t(`p_${p.id}`)} · ${inStock[p.id]} ${t('m_left')}`)));
    const units = numberInput('units', 1, { min: 1, step: 1 });
    const total = h('p', { class: 'ok', 'aria-live': 'polite' });
    const update = () => {
        const n = Number(units.value);
        total.textContent = Number.isInteger(n) && n > 0 ? t('m_total', { v: formatVnd(n * productById(product.value).priceVnd) }) : '';
    };
    [product, units].forEach((c) => c.addEventListener('input', update));
    update();
    const form = h('form', { class: 'card form', novalidate: true }, h('div', { class: 'grid' }, field('m_shop', shop, 'm_shop_h'), field('m_product', product), field('m_units', units)), total, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, t('m_sell'))));
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = sell(store.get(), { productId: product.value, shopId: shop.value, units: Number(units.value) }, defaultEnv);
        if (!res.ok) {
            toast(t(res.error));
            return;
        }
        store.set(res.value);
        toast(t('m_sold'));
    });
    const ledger = state.sales.length
        ? h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['m_th_shop', 'm_th_product', 'm_th_units', 'm_th_rev', 'm_th_when'].map((k) => h('th', {}, t(k))))), h('tbody', {}, ...state.sales.map((s) => h('tr', {}, h('td', {}, `${placeById(s.shopId)?.name ?? s.shopId}${suppliers.has(s.shopId) ? ' ★' : ''}`), h('td', {}, t(`p_${s.productId}`)), h('td', {}, String(s.units)), h('td', {}, formatVnd(s.revenueVnd)), h('td', {}, fmtDate(s.soldAt)))))))
        : empty('m_empty');
    root.append(pageHeader('m_title', 'm_sub'), h('div', { class: 'wrap pg' }, h('p', { class: 'note' }, t('note_sample')), form, h('h2', {}, t('m_ledger')), ledger));
}

export { renderMarket };
