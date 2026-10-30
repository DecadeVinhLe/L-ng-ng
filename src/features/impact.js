import { clear, h } from '../core/dom';
import { formatVnd, summarize } from '../core/loop';
import { t } from '../i18n/index';
import { pageHeader } from './ui';
function renderImpact(root, store) {
    clear(root);
    const s = summarize(store.get());
    const pct = Math.round(s.circularity * 100);
    const card = (label, value, hint) => h('div', { class: 'card' }, h('p', { class: 'mut' }, t(label)), h('p', { class: 'big' }, value), hint ? h('p', { class: 'mut' }, t(hint)) : null);
    root.append(pageHeader('i_title', 'i_sub'), h('div', { class: 'wrap pg' }, h('p', { class: 'note' }, t('i_note')), h('div', { class: 'card' }, h('h3', {}, t('i_circ')), h('div', { class: 'meter', role: 'img', 'aria-label': `${pct}%` }, h('div', { class: 'fill', style: `width:${pct}%` })), h('p', {}, t('i_circ_p', { back: s.unitsSoldBack, made: s.unitsProduced, pct }))), h('div', { class: 'cards' }, card('stat_collected', `${s.collectedKg} kg`), card('i_rejected', `${s.rejectedKg} kg`, 'i_rejected_h'), card('i_diverted', `${s.divertedKg} kg`), card('stat_units', String(s.unitsProduced)), card('i_sold', String(s.unitsSold)), card('stat_revenue', formatVnd(s.revenueVnd)), card('i_cost', formatVnd(s.costVnd), 'i_cost_h'), card('i_co2', `${s.co2AvoidedKg} kg CO₂e`, 'i_co2_h'))));
}

export { renderImpact };
