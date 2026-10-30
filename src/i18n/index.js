import { RAW } from './translations';
function parse() {
    const en = {};
    const vi = {};
    for (const line of RAW.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const [key, english, vietnamese] = trimmed.split('|');
        if (!key || english === undefined)
            continue;
        en[key] = english;
        // A missing Vietnamese string falls back to English, as in CONTRIBUTING.md.
        vi[key] = vietnamese && vietnamese.length > 0 ? vietnamese : english;
    }
    return { en, vi };
}
const DICT = parse();
let lang = 'en';
const listeners = new Set();
const getLang = () => lang;
function setLang(next) {
    lang = next;
    document.documentElement.lang = next;
    listeners.forEach((l) => l(next));
}
const onLang = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
};
/** Look up a string; `{name}` placeholders are filled from `vars`. Unknown keys return the key. */
function t(key, vars = {}, forLang = lang) {
    const raw = DICT[forLang][key] ?? DICT.en[key] ?? key;
    return raw.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}
/** Fill every `data-i` element under `root`. */
function applyStatic(root = document) {
    root.querySelectorAll('[data-i]').forEach((el) => {
        el.textContent = t(el.dataset['i'] ?? '');
    });
}

export { DICT, getLang, setLang, onLang, t, applyStatic };
