import { emptyState } from './state';
const KEY = 'grounds-loop/state/1';
function isLoopState(v) {
    if (typeof v !== 'object' || v === null)
        return false;
    const o = v;
    return Array.isArray(o['batches']) && Array.isArray(o['productions']) && Array.isArray(o['sales']);
}
function loadState(storage) {
    try {
        const raw = storage?.getItem(KEY);
        if (!raw)
            return emptyState();
        const parsed = JSON.parse(raw);
        return isLoopState(parsed) ? parsed : emptyState();
    }
    catch {
        return emptyState();
    }
}
function saveState(storage, state) {
    try {
        storage?.setItem(KEY, JSON.stringify(state));
    }
    catch {
        // Storage can be full or blocked (private mode). The app keeps working in memory.
    }
}
/** Tiny observable store. All data stays in this browser; nothing is sent to a server. */
function createStore(storage) {
    let state = loadState(storage);
    const listeners = new Set();
    return {
        get: () => state,
        set(next) {
            state = next;
            saveState(storage, state);
            listeners.forEach((l) => l(state));
        },
        subscribe(l) {
            listeners.add(l);
            return () => listeners.delete(l);
        },
    };
}

export { loadState, saveState, createStore };
