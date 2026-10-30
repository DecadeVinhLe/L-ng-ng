import { $, clear, h } from '../core/dom';
import { applyStatic, getLang, onLang, setLang, t } from '../i18n/index';
import { renderCollect } from './collect';
import { renderHome } from './home';
import { renderHub } from './hub';
import { renderImpact } from './impact';
import { renderMarket } from './market';
import { renderWorkshop } from './workshop';
const BRAND = 'Lắng';
const PAGES = {
    home: renderHome,
    collect: renderCollect,
    hub: renderHub,
    workshop: renderWorkshop,
    market: renderMarket,
    impact: renderImpact,
};
const NAV = ['home', 'collect', 'hub', 'workshop', 'market', 'impact'];
const pageFromHash = () => {
    const id = window.location.hash.replace(/^#/, '');
    return id in PAGES ? id : 'home';
};
function safeGet(key) {
    try {
        return window.localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
function safeSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
    }
    catch {
        /* blocked storage: preference just won't persist */
    }
}
function setTheme(theme) {
    document.documentElement.dataset['theme'] = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12110e' : '#f1eee6');
    safeSet('grounds-loop/theme', theme);
}
function startShell(store) {
    const app = $('#app');
    const nav = $('#nav');
    const savedTheme = safeGet('grounds-loop/theme');
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
    const savedLang = safeGet('grounds-loop/lang');
    setLang(savedLang === 'en' ? 'en' : 'vi'); // Vietnamese by default
    function renderNav() {
        clear(nav);
        const current = pageFromHash();
        NAV.forEach((id) => {
            const link = h('a', { href: `#${id}`, class: id === current ? 'on' : '' }, t(`n_${id}`));
            if (id === current)
                link.setAttribute('aria-current', 'page');
            nav.append(link);
        });
    }
    function render() {
        const page = pageFromHash();
        PAGES[page]?.(app, store);
        renderNav();
        applyStatic();
        document.title = `${t(`n_${page}`)} · ${BRAND}`;
    }
    const themeBtn = $('#theme');
    const menuBtn = $('#menu');
    const panel = $('#menu-panel');
    const langBtns = [...panel.querySelectorAll('[data-lang]')];
    const paintTools = () => {
        langBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset['lang'] === getLang())));
        themeBtn.setAttribute('aria-checked', String(document.documentElement.dataset['theme'] === 'dark'));
    };
    function setMenu(open) {
        panel.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.classList.toggle('open', open);
        if (open)
            panel.querySelector('a')?.focus();
    }
    menuBtn.addEventListener('click', () => setMenu(panel.hasAttribute('hidden')));
    panel.addEventListener('click', (e) => {
        if (e.target.closest('#nav a'))
            setMenu(false);
    });
    document.addEventListener('click', (e) => {
        if (!panel.hasAttribute('hidden') && !e.target.closest('#hd'))
            setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
            setMenu(false);
            menuBtn.focus();
        }
    });
    langBtns.forEach((b) => b.addEventListener('click', () => {
        const next = b.dataset['lang'] === 'en' ? 'en' : 'vi';
        safeSet('grounds-loop/lang', next);
        setLang(next);
    }));
    themeBtn.addEventListener('click', () => {
        setTheme(document.documentElement.dataset['theme'] === 'dark' ? 'light' : 'dark');
        paintTools();
    });
    onLang(() => {
        render();
        paintTools();
    });
    window.addEventListener('hashchange', () => {
        render();
        window.scrollTo({ top: 0 });
    });
    // Data changes re-render the current page, except while a form is being typed in.
    store.subscribe(() => render());
    render();
    paintTools();
    $('#yr').textContent = String(new Date().getFullYear());
}

export { BRAND, PAGES, NAV, startShell };
