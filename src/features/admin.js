import { add, clear, h, toast } from '../core/dom';
import { cafeTracker, formatVnd } from '../core/loop';
import { MAX_HUB_KG, MAX_STOCK, cancelPickup, clearRejected, hubConfig, hubWaitingKg, isoDay, scheduledPickups, setHub, setStock, stock, waitingAtHub } from '../core/state';
import { ADMIN_PASSCODE_SHA256 } from '../data/admin';
import { HUBS, placeById } from '../data/places';
import { PRODUCTS } from '../data/products';
import { t } from '../i18n/index';
import { empty, fmtDate, pageHeader } from './ui';
const SESSION_KEY = 'grounds-loop/admin';
const DAY_MS = 86_400_000;
const unlocked = () => {
    try {
        return sessionStorage.getItem(SESSION_KEY) === '1';
    }
    catch {
        return false;
    }
};
const setUnlocked = (on) => {
    try {
        if (on)
            sessionStorage.setItem(SESSION_KEY, '1');
        else
            sessionStorage.removeItem(SESSION_KEY);
    }
    catch {
        // Session storage can be blocked; the lock then asks again on every visit.
    }
};
async function sha256(text) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
/** Admin page: lock screen first, then one editable stock number per product. */
function renderAdmin(root, store) {
    clear(root);
    const body = h('div', { class: 'wrap pg' });
    root.append(pageHeader('a_title', 'a_sub'), body);
    const drawLocked = () => {
        clear(body);
        const pin = h('input', { type: 'password', name: 'pin', autocomplete: 'off', required: true, 'aria-label': t('a_pin') });
        const err = h('p', { class: 'err', role: 'alert' });
        const form = h('form', { class: 'card admin-lock' }, h('label', { class: 'fld' }, h('span', {}, t('a_pin')), pin), err, h('button', { class: 'btn', type: 'submit' }, t('a_unlock')));
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            err.textContent = '';
            if (!globalThis.crypto?.subtle) {
                err.textContent = t('a_https');
                return;
            }
            const ok = (await sha256(pin.value)) === ADMIN_PASSCODE_SHA256;
            pin.value = '';
            if (!ok) {
                err.textContent = t('a_wrong');
                return;
            }
            setUnlocked(true);
            drawOpen();
        });
        body.append(form);
        pin.focus();
    };
    /** Run a state change; show an error or a message, then redraw. */
    const apply = (res, okKey, okParams) => {
        if (!res.ok) {
            toast(t(res.error));
            return;
        }
        store.set(res.value);
        toast(t(okKey, okParams));
        drawOpen();
    };
    const productRow = (p, state) => {
        const now = stock(state)[p.id];
        const input = h('input', { type: 'number', min: 0, max: MAX_STOCK, step: 1, value: now, inputmode: 'numeric', 'aria-label': `${t(`p_${p.id}`)} ${t('a_stock')}` });
        const row = h('form', { class: 'admin-row' }, h('strong', {}, t(`p_${p.id}`)), h('span', { class: 'admin-now' }, `${t('a_now')}: ${now}`), input, h('button', { class: 'btn', type: 'submit' }, t('a_save')));
        row.addEventListener('submit', (e) => {
            e.preventDefault();
            apply(setStock(store.get(), p.id, Number(input.value)), 'a_saved');
        });
        return row;
    };
    const hubBox = (hub, state) => {
        const cfg = hubConfig(state, hub.id);
        const waiting = waitingAtHub(state, hub.id);
        const rejected = waiting.filter((b) => b.result.grade === 'reject').length;
        const kg = hubWaitingKg(state, hub.id);
        const fill = h('div', { class: 'fill' });
        fill.style.width = `${Math.min(100, Math.round((kg / cfg.capacityKg) * 100))}%`;
        const toggle = h('button', { class: cfg.open ? 'btn ghost' : 'btn', type: 'button' }, t(cfg.open ? 'a_close_btn' : 'a_open_btn'));
        toggle.addEventListener('click', () => apply(setHub(store.get(), hub.id, { open: !cfg.open }), 'a_hub_saved'));
        const cap = h('input', { type: 'number', min: 1, max: MAX_HUB_KG, step: 1, value: cfg.capacityKg, inputmode: 'numeric', 'aria-label': `${hub.name}: ${t('a_cap')}` });
        const capForm = h('form', { class: 'admin-cap' }, h('label', {}, h('span', {}, t('a_cap')), cap), h('button', { class: 'btn', type: 'submit' }, t('a_save')));
        capForm.addEventListener('submit', (e) => {
            e.preventDefault();
            apply(setHub(store.get(), hub.id, { capacityKg: Number(cap.value) }), 'a_hub_saved');
        });
        const clear = h('button', { class: 'btn ghost', type: 'button' }, t('a_clear', { n: rejected }));
        clear.disabled = rejected === 0;
        clear.addEventListener('click', () => {
            const res = clearRejected(store.get(), hub.id);
            apply(res, 'a_cleared', { n: rejected });
        });
        return h('section', { class: 'card admin-hub' }, h('h3', {}, hub.name, h('span', { class: cfg.open ? 'badge open' : 'badge closed' }, t(cfg.open ? 'a_v_open' : 'hb_closed'))), h('p', { class: 'mut' }, hub.address ?? hub.district), h('div', { class: 'meter', role: 'img', 'aria-label': t('hb_cap', { kg, cap: cfg.capacityKg }) }, fill), h('p', { class: 'mut' }, `${t('hb_cap', { kg, cap: cfg.capacityKg })} · ${t('a_stat', { n: waiting.length, r: rejected })}`), capForm, h('div', { class: 'row' }, toggle, clear, h('a', { class: 'btn ghost', href: '#hub' }, t('a_view_hub'))));
    };
    /** One line of the change log, for either a stock edit or a hub edit. */
    const logRow = (a) => {
        let what;
        let from = String(a.from);
        let to = String(a.to);
        if (a.productId) {
            what = t('a_w_stock', { p: t(`p_${a.productId}`) });
        }
        else {
            const hubName = HUBS.find((x) => x.id === a.hubId)?.name ?? a.hubId;
            what = t('a_w_hub', { hub: hubName, field: t(`a_f_${a.field}`) });
            if (a.field === 'open') {
                from = t(a.from ? 'a_v_open' : 'hb_closed');
                to = t(a.to ? 'a_v_open' : 'hb_closed');
            }
        }
        return h('tr', {}, h('td', {}, fmtDate(a.at)), h('td', {}, what), h('td', {}, from), h('td', {}, to));
    };
    const day = (iso) => new Date(iso).toLocaleDateString();
    const dueText = (r) => {
        if (r.nextAt === null)
            return t('a_nodrop');
        const when = r.daysUntil < 0 ? t('a_overdue', { n: -r.daysUntil }) : r.daysUntil === 0 ? t('a_today') : t('a_in_days', { n: r.daysUntil });
        return `${day(r.nextAt)} · ${when}${r.estimated ? ` · ${t('a_est')}` : ''}`;
    };
    const csv = (rows) => {
        const head = ['cafe', 'drops', 'kg_dropped', 'last_drop', 'next_collection', 'expected_kg', 'units_bought', 'revenue_vnd'];
        const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
        const lines = rows.map((r) => [r.name, r.drops, r.kgDropped, r.lastDropAt?.slice(0, 10), r.nextAt?.slice(0, 10), r.expectedKg, r.unitsBought, r.revenueVnd].map(q).join(','));
        return `\uFEFF${[head.join(','), ...lines].join('\n')}`;
    };
    const cafeSection = (state) => {
        const { rows, totals } = cafeTracker(state);
        const dl = h('button', { class: 'btn ghost', type: 'button' }, t('a_csv'));
        dl.addEventListener('click', () => {
            const url = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' }));
            const a = h('a', { href: url, download: 'lang-cafes.csv' });
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        const stat = (value, label) => h('div', { class: 'stat' }, h('strong', {}, value), h('span', {}, label));
        return h('section', {}, h('h2', {}, t('a_cafe_h')), h('p', { class: 'mut' }, t('a_cafe_sub')), h('div', { class: 'stats' }, stat(formatVnd(totals.revenueVnd), t('a_cafe_rev')), stat(`${totals.kgDropped} kg`, t('a_cafe_kg')), stat(`${totals.dueSoonCount} · ${totals.dueSoonKg} kg`, t('a_cafe_due'))), h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['a_th_cafe', 'a_th_drops', 'a_th_kgd', 'a_th_last', 'a_th_next', 'a_th_exp', 'a_th_units', 'a_th_rev'].map((k) => h('th', { scope: 'col' }, t(k))))), h('tbody', {}, ...rows.map((r) => h('tr', {}, h('td', {}, r.name), h('td', {}, String(r.drops)), h('td', {}, `${r.kgDropped} kg`), h('td', {}, r.lastDropAt ? day(r.lastDropAt) : '-'), h('td', {}, dueText(r)), h('td', {}, `${r.expectedKg} kg`), h('td', {}, String(r.unitsBought)), h('td', {}, formatVnd(r.revenueVnd))))))), h('div', { class: 'row' }, dl));
    };
    /** Household pick-ups: who is booked on which day, so the collector can plan the round. */
    const pickupSection = (state) => {
        const list = scheduledPickups(state);
        const today = isoDay(new Date());
        const weekEnd = isoDay(new Date(Date.now() + 7 * DAY_MS));
        const week = list.filter((p) => p.date <= weekEnd);
        const stat = (value, label) => h('div', { class: 'stat' }, h('strong', {}, value), h('span', {}, label));
        const daysLate = (p) => Math.round((new Date(today).getTime() - new Date(p.date).getTime()) / DAY_MS);
        const row = (p) => {
            const cancel = h('button', { class: 'btn ghost', type: 'button' }, t('a_hh_cancel'));
            cancel.addEventListener('click', () => apply(cancelPickup(store.get(), p.id), 'cm_cancelled'));
            const late = p.date < today ? ` · ${t('a_overdue', { n: daysLate(p) })}` : p.date === today ? ` · ${t('a_today')}` : '';
            return h('tr', {}, h('td', {}, `${p.date}${late}`), h('td', {}, placeById(p.communityId)?.name ?? p.communityId), h('td', {}, p.name), h('td', {}, p.contact), h('td', {}, p.where), h('td', {}, `${p.kg} kg`), h('td', {}, p.note || '-'), h('td', {}, h('div', { class: 'row tight' }, cancel)));
        };
        return h('section', {}, h('h2', {}, t('a_hh_h')), h('p', { class: 'mut' }, t('a_hh_sub')), h('div', { class: 'stats' }, stat(String(list.length), t('a_hh_n')), stat(`${Math.round(week.reduce((s, p) => s + p.kg, 0) * 10) / 10} kg`, t('a_hh_kg')), stat(String(new Set(week.map((p) => `${p.communityId}|${p.date}`)).size), t('a_hh_rounds'))), list.length === 0
            ? empty('a_hh_none')
            : h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['cm_th_date', 'cm_th_area', 'cm_th_name', 'a_th_contact', 'a_th_where', 'cm_th_kg', 'a_th_note'].map((k) => h('th', { scope: 'col' }, t(k))), h('th', {}, ''))), h('tbody', {}, ...list.map(row)))), h('div', { class: 'row' }, h('a', { class: 'btn ghost', href: '#collect' }, t('a_hh_log'))));
    };
    const drawOpen = () => {
        clear(body);
        const state = store.get();
        const history = (state.adjustments ?? []).slice(0, 12);
        const lock = h('button', { class: 'btn ghost', type: 'button' }, t('a_lock'));
        lock.addEventListener('click', () => {
            setUnlocked(false);
            drawLocked();
        });
        add(body, h('p', { class: 'note' }, t('a_note')), h('h2', {}, t('a_prod_h')), h('div', { class: 'admin-rows' }, ...PRODUCTS.map((p) => productRow(p, state))), h('h2', {}, t('a_hubs_h')), h('p', { class: 'mut' }, t('a_hubs_sub')), h('div', { class: 'hubs' }, ...HUBS.map((x) => hubBox(x, state))), pickupSection(state), cafeSection(state), h('h2', {}, t('a_hist')), history.length === 0
            ? empty('a_empty')
            : h('div', { class: 'tbl' }, h('table', {}, h('thead', {}, h('tr', {}, ...['a_th_when', 'a_th_what', 'a_th_from', 'a_th_to'].map((k) => h('th', { scope: 'col' }, t(k))))), h('tbody', {}, ...history.map(logRow)))), h('div', { class: 'row' }, lock));
    };
    if (unlocked())
        drawOpen();
    else
        drawLocked();
}
export { renderAdmin };
