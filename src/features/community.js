import { clear, h, toast } from '../core/dom';
import { cancelPickup, defaultEnv, pickupWindow, reschedulePickup, schedulePickup, scheduledPickups, spotsLeft } from '../core/state';
import { COMMUNITIES, HUBS, HUB_FOR_ZONE, PICKUP_RULES, communityById } from '../data/places';
import { getLang, t } from '../i18n/index';
import { empty, field, numberInput, option, pageHeader } from './ui';

const dayLabel = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(getLang() === 'vi' ? 'vi-VN' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
const hubName = (community) => HUBS.find((x) => x.id === HUB_FOR_ZONE[community.zone])?.name ?? '';

/** One card per community: where it is, which hub it drops at, and the days already booked (counts only). */
function communityCard(store, c) {
    const rounds = new Map();
    scheduledPickups(store.get())
        .filter((p) => p.communityId === c.id)
        .forEach((p) => rounds.set(p.date, (rounds.get(p.date) ?? 0) + 1));
    const next = [...rounds.entries()].slice(0, 4);
    return h('div', { class: 'card community' }, h('h3', {}, c.name), h('p', { class: 'mut' }, c.address), h('p', { class: 'mono-sm' }, t('cm_hub', { hub: hubName(c) })), h('p', { class: 'mut' }, t('cm_next')), next.length
        ? h('ul', { class: 'rounds' }, ...next.map(([date, n]) => h('li', {}, t('cm_round', { date: dayLabel(date), n, max: PICKUP_RULES.maxHouseholdsPerDay }))))
        : h('p', { class: 'mut' }, t('cm_no_rounds')));
}

/** The booking form. */
function bookingForm(store) {
    const win = pickupWindow();
    const area = h('select', { name: 'communityId' }, ...COMMUNITIES.map((c) => option(c.id, c.name)));
    const name = h('input', { type: 'text', name: 'name', required: true, maxlength: 60, autocomplete: 'name' });
    const contact = h('input', { type: 'tel', name: 'contact', required: true, maxlength: 20, autocomplete: 'tel', inputmode: 'tel' });
    const where = h('input', { type: 'text', name: 'where', required: true, maxlength: 120, autocomplete: 'street-address' });
    const kg = numberInput('kg', 1, { min: PICKUP_RULES.minKg, max: PICKUP_RULES.maxKg, step: 0.1 });
    const date = h('input', { type: 'date', name: 'date', required: true, min: win.min, max: win.max, value: win.min });
    const note = h('textarea', { name: 'note', rows: 2, maxlength: 140 });
    const spots = h('p', { class: 'mono-sm', 'aria-live': 'polite' });
    const form = h('form', { class: 'card form', novalidate: true }, h('div', { class: 'grid' }, field('cm_f_area', area), field('cm_f_name', name), field('cm_f_contact', contact, 'cm_f_contact_h'), field('cm_f_where', where, 'cm_f_where_h'), field('cm_f_kg', kg, 'cm_f_kg_h'), field('cm_f_date', date, 'cm_f_date_h')), field('cm_f_note', note), spots, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, t('cm_book'))));
    const showSpots = () => {
        const left = spotsLeft(store.get(), area.value, date.value);
        spots.textContent = left < 1 ? t('cm_spots_full') : t('cm_spots', { left, max: PICKUP_RULES.maxHouseholdsPerDay });
        spots.classList.toggle('err', left < 1);
    };
    area.addEventListener('change', showSpots);
    date.addEventListener('input', showSpots);
    showSpots();
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = schedulePickup(store.get(), {
            communityId: area.value,
            name: name.value,
            contact: contact.value,
            where: where.value,
            kg: Number(kg.value),
            date: date.value,
            note: note.value,
        }, defaultEnv);
        if (!res.ok) {
            toast(t(res.error));
            return;
        }
        store.set(res.value);
        toast(t('cm_booked', { date: dayLabel(date.value) }));
    });
    return form;
}

/** The bookings saved in this browser, with change-date and cancel buttons. */
function myPickups(store) {
    const state = store.get();
    const all = [...(state.pickups ?? [])].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    if (all.length === 0)
        return empty('cm_mine_none');
    const win = pickupWindow();
    const row = (p) => {
        const actions = h('td', {});
        if (p.status === 'scheduled') {
            const when = h('input', { type: 'date', min: win.min, max: win.max, value: p.date >= win.min && p.date <= win.max ? p.date : win.min, 'aria-label': t('cm_change') });
            const save = h('button', { class: 'btn ghost', type: 'button' }, t('cm_change'));
            save.addEventListener('click', () => {
                const res = reschedulePickup(store.get(), p.id, when.value, defaultEnv);
                if (!res.ok) {
                    toast(t(res.error));
                    return;
                }
                store.set(res.value);
                toast(t('cm_moved', { date: dayLabel(when.value) }));
            });
            const cancel = h('button', { class: 'btn ghost', type: 'button' }, t('cm_cancel'));
            cancel.addEventListener('click', () => {
                const res = cancelPickup(store.get(), p.id, defaultEnv);
                if (!res.ok) {
                    toast(t(res.error));
                    return;
                }
                store.set(res.value);
                toast(t('cm_cancelled'));
            });
            actions.append(h('div', { class: 'row tight' }, when, save, cancel));
        }
        return h('tr', {}, h('td', {}, dayLabel(p.date)), h('td', {}, communityById(p.communityId)?.name ?? p.communityId), h('td', {}, `${p.name} · ${p.where}`), h('td', {}, `${p.kg} kg`), h('td', {}, h('span', { class: `badge pk-${p.status}` }, t(`cm_s_${p.status}`))), actions);
    };
    return h('div', { class: 'sc' }, h('table', {}, h('thead', {}, h('tr', {}, ...['cm_th_date', 'cm_th_area', 'cm_th_name', 'cm_th_kg', 'cm_th_status'].map((k) => h('th', {}, t(k))), h('th', {}, ''))), h('tbody', {}, ...all.map(row))));
}

function renderCommunity(root, store) {
    clear(root);
    const tips = h('div', { class: 'card' }, h('h3', {}, t('cm_tips_h')), h('ul', { class: 'tips' }, ...[1, 2, 3, 4].map((n) => h('li', {}, t(`cm_tip${n}`)))));
    root.append(pageHeader('cm_title', 'cm_sub'), h('div', { class: 'wrap pg' }, h('p', { class: 'note' }, t('cm_local')), h('h2', {}, t('cm_areas')), h('div', { class: 'cards' }, ...COMMUNITIES.map((c) => communityCard(store, c))), h('p', { class: 'note' }, t('cm_area_note')), h('h2', {}, t('cm_book_h')), h('div', { class: 'book' }, bookingForm(store), tips), h('h2', {}, t('cm_mine')), myPickups(store)));
}

export { renderCommunity };
