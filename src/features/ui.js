import { h } from '../core/dom';
import { t } from '../i18n/index';
const pageHeader = (titleKey, subKey) => h('header', { class: 'ph' }, h('div', { class: 'wrap' }, h('h1', {}, t(titleKey)), h('p', { class: 'lead' }, t(subKey))));
function field(labelKey, control, hintKey) {
    return h('label', { class: 'fld' }, h('span', {}, t(labelKey)), control, hintKey ? h('small', {}, t(hintKey)) : null);
}
const gradeBadge = (grade, score) => h('span', { class: `badge g-${grade}` }, t(`g_${grade}`), score === undefined ? null : ` · ${score}`);
function option(value, label, selected = false) {
    return h('option', { value, selected }, label);
}
const numberInput = (name, value, attrs = {}) => h('input', { type: 'number', name, value, inputmode: 'decimal', step: 'any', required: true, ...attrs });
const empty = (key) => h('p', { class: 'empty' }, t(key));
const fmtDate = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export { pageHeader, field, gradeBadge, option, numberInput, empty, fmtDate };
