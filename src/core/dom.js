/**
 * Tiny element builder. Text is always added as text nodes, never as HTML,
 * so user input cannot inject markup.
 */
function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === false)
            continue;
        if (k.startsWith('on') && typeof v === 'function') {
            el.addEventListener(k.slice(2).toLowerCase(), v);
        }
        else if (v === true) {
            el.setAttribute(k, '');
        }
        else {
            el.setAttribute(k === 'class' ? 'class' : k, String(v));
        }
    }
    for (const c of children) {
        if (c === null || c === undefined || c === false)
            continue;
        el.append(typeof c === 'object' ? c : String(c));
    }
    return el;
}
/** Like Element.append, but skips null, undefined and false so conditional children stay tidy. */
function add(parent, ...children) {
    for (const c of children) {
        if (c === null || c === undefined || c === false)
            continue;
        parent.append(typeof c === 'object' ? c : String(c));
    }
}
function clear(el) {
    while (el.firstChild)
        el.removeChild(el.firstChild);
}
function $(selector, root = document) {
    const el = root.querySelector(selector);
    if (!el)
        throw new Error(`Missing element: ${selector}`);
    return el;
}
let toastTimer;
function toast(message) {
    const el = document.getElementById('toast');
    if (!el)
        return;
    el.textContent = message;
    el.classList.add('on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('on'), 2600);
}

export { h, add, clear, $, toast };
