import { BRANDS, HUBS, PICKUP_RULES, communityById } from '../data/places';
import { OPENING_STOCK, productById } from '../data/products';
import { assessQuality, gradeAtLeast } from './quality';
const defaultEnv = {
    now: () => new Date().toISOString(),
    id: (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
};
const emptyState = () => ({ batches: [], productions: [], sales: [], adjustments: [], hubSettings: {}, pickups: [] });
const fail = (error) => ({ ok: false, error });
const MAX_BATCH_KG = 1000;
function addBatch(state, input, env = defaultEnv) {
    if (!BRANDS.some((b) => b.id === input.brandId) && !communityById(input.brandId))
        return fail('err_brand');
    const hubId = input.hubId ?? HUBS[0]?.id ?? '';
    if (!HUBS.some((h) => h.id === hubId))
        return fail('err_hub');
    if (!Number.isFinite(input.kg) || input.kg <= 0 || input.kg > MAX_BATCH_KG)
        return fail('err_kg');
    const cfg = hubConfig(state, hubId);
    if (!cfg.open)
        return fail('err_hub_closed');
    if (hubWaitingKg(state, hubId) + input.kg > cfg.capacityKg)
        return fail('err_hub_full');
    // A batch can come from a booked household pick-up. Check it before anything is changed.
    const pickup = input.pickupId ? (state.pickups ?? []).find((p) => p.id === input.pickupId) : undefined;
    if (input.pickupId && (!pickup || pickup.status !== 'scheduled'))
        return fail('err_pk_none');
    if (pickup && pickup.communityId !== input.brandId)
        return fail('err_pk_mismatch');
    const batch = {
        id: env.id('batch'),
        brandId: input.brandId,
        hubId,
        kg: input.kg,
        receivedAt: env.now(),
        quality: input.quality,
        result: assessQuality(input.quality),
        processed: false,
    };
    const pickups = pickup
        ? (state.pickups ?? []).map((p) => (p.id === pickup.id ? { ...p, status: 'collected', batchId: batch.id, collectedAt: env.now() } : p))
        : (state.pickups ?? []);
    return { ok: true, value: { ...state, batches: [batch, ...state.batches], pickups } };
}
// ---- Household pick-ups: a household in a community books a date, and we collect from the door ----
const pad2 = (n) => String(n).padStart(2, '0');
/** A Date as YYYY-MM-DD in the browser's own time zone. */
const isoDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
/** Parse YYYY-MM-DD as a local date. Returns null for anything else, including dates like 2026-02-31. */
function parseDay(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? ''));
    if (!m)
        return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isoDay(d) === s ? d : null;
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** The first and last date a household may book, counted from "now". */
function pickupWindow(env = defaultEnv) {
    const now = new Date(env.now());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { min: isoDay(addDays(today, PICKUP_RULES.minLeadDays)), max: isoDay(addDays(today, PICKUP_RULES.maxAheadDays)) };
}
const inWindow = (date, env) => {
    const w = pickupWindow(env);
    return parseDay(date) !== null && date >= w.min && date <= w.max;
};
/** Booked (not yet collected or cancelled) pick-ups, soonest first. */
const scheduledPickups = (state) => (state.pickups ?? [])
    .filter((p) => p.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
/** How many households are booked in one community on one date. */
const roundSize = (state, communityId, date, exceptId) => scheduledPickups(state).filter((p) => p.communityId === communityId && p.date === date && p.id !== exceptId).length;
const spotsLeft = (state, communityId, date, exceptId) => PICKUP_RULES.maxHouseholdsPerDay - roundSize(state, communityId, date, exceptId);
const digitsOf = (s) => String(s ?? '').replace(/[\s.\-()]/g, '');
const PHONE = /^\+?\d{8,13}$/;
function schedulePickup(state, input, env = defaultEnv) {
    const community = communityById(input.communityId);
    if (!community)
        return fail('err_community');
    const name = String(input.name ?? '').trim();
    if (name.length < 2 || name.length > 60)
        return fail('err_pk_name');
    const contact = String(input.contact ?? '').trim();
    if (!PHONE.test(digitsOf(contact)))
        return fail('err_pk_contact');
    const where = String(input.where ?? '').trim();
    if (where.length < 3 || where.length > 120)
        return fail('err_pk_where');
    const kg = Number(input.kg);
    if (!Number.isFinite(kg) || kg < PICKUP_RULES.minKg || kg > PICKUP_RULES.maxKg)
        return fail('err_pk_kg');
    const note = String(input.note ?? '').trim();
    if (note.length > 140)
        return fail('err_pk_note');
    if (!inWindow(input.date, env))
        return fail('err_pk_date');
    const open = scheduledPickups(state);
    if (open.some((p) => p.communityId === community.id && digitsOf(p.contact) === digitsOf(contact)))
        return fail('err_pk_dup');
    if (spotsLeft(state, community.id, input.date) < 1)
        return fail('err_pk_full');
    const pickup = {
        id: env.id('pk'),
        communityId: community.id,
        name,
        contact,
        where,
        kg: Math.round(kg * 10) / 10,
        date: input.date,
        note,
        status: 'scheduled',
        createdAt: env.now(),
    };
    return { ok: true, value: { ...state, pickups: [...(state.pickups ?? []), pickup] } };
}
/** Move a booking to another date. Only a booking that is still waiting can move. */
function reschedulePickup(state, pickupId, date, env = defaultEnv) {
    const p = (state.pickups ?? []).find((x) => x.id === pickupId);
    if (!p || p.status !== 'scheduled')
        return fail('err_pk_none');
    if (!inWindow(date, env))
        return fail('err_pk_date');
    if (date === p.date)
        return { ok: true, value: state };
    if (spotsLeft(state, p.communityId, date, p.id) < 1)
        return fail('err_pk_full');
    return { ok: true, value: { ...state, pickups: (state.pickups ?? []).map((x) => (x.id === p.id ? { ...x, date } : x)) } };
}
function cancelPickup(state, pickupId, env = defaultEnv) {
    const p = (state.pickups ?? []).find((x) => x.id === pickupId);
    if (!p || p.status !== 'scheduled')
        return fail('err_pk_none');
    return { ok: true, value: { ...state, pickups: (state.pickups ?? []).map((x) => (x.id === p.id ? { ...x, status: 'cancelled', cancelledAt: env.now() } : x)) } };
}
/** Batches sitting at a hub: dropped by a café, not yet collected by the workshop. */
const waitingAtHub = (state, hubId) => state.batches.filter((b) => (b.hubId || HUBS[0]?.id) === hubId && !b.pickedUpAt && !b.processed);
/** Kilograms sitting at a hub right now (waiting for the workshop). */
const hubWaitingKg = (state, hubId) => Math.round(waitingAtHub(state, hubId).reduce((sum, b) => sum + b.kg, 0) * 10) / 10;
/** A hub's live settings: the defaults from data/places.js plus anything the admin changed. */
function hubConfig(state, hubId) {
    const base = HUBS.find((x) => x.id === hubId);
    const set = state.hubSettings?.[hubId] ?? {};
    return { open: set.open ?? true, capacityKg: set.capacityKg ?? base?.capacityKg ?? 0 };
}
const MAX_HUB_KG = 5000;
/**
 * Admin: open or close a hub, or change how many kg it can hold. A closed hub takes no new drops;
 * a hub never accepts a drop that would go over its capacity. Each change is logged in `adjustments`.
 */
function setHub(state, hubId, change, env = defaultEnv) {
    if (!HUBS.some((x) => x.id === hubId))
        return fail('err_hub');
    const cur = hubConfig(state, hubId);
    const log = [];
    const next = { ...(state.hubSettings?.[hubId] ?? {}) };
    if (change.open !== undefined && change.open !== cur.open) {
        next.open = change.open;
        log.push({ id: env.id('adj'), hubId, field: 'open', from: cur.open, to: change.open, at: env.now() });
    }
    if (change.capacityKg !== undefined && change.capacityKg !== cur.capacityKg) {
        if (!Number.isInteger(change.capacityKg) || change.capacityKg < 1 || change.capacityKg > MAX_HUB_KG)
            return fail('err_hub_cap');
        next.capacityKg = change.capacityKg;
        log.push({ id: env.id('adj'), hubId, field: 'capacityKg', from: cur.capacityKg, to: change.capacityKg, at: env.now() });
    }
    if (log.length === 0)
        return { ok: true, value: state };
    return {
        ok: true,
        value: { ...state, hubSettings: { ...(state.hubSettings ?? {}), [hubId]: next }, adjustments: [...log, ...(state.adjustments ?? [])] },
    };
}
/** Admin: remove the rejected batches that are stuck waiting at a hub. */
function clearRejected(state, hubId, env = defaultEnv) {
    if (!HUBS.some((x) => x.id === hubId))
        return fail('err_hub');
    const gone = waitingAtHub(state, hubId).filter((b) => b.result.grade === 'reject');
    if (gone.length === 0)
        return fail('err_nothing');
    const ids = new Set(gone.map((b) => b.id));
    return {
        ok: true,
        value: {
            ...state,
            batches: state.batches.filter((b) => !ids.has(b.id)),
            adjustments: [{ id: env.id('adj'), hubId, field: 'cleared', from: gone.length, to: 0, at: env.now() }, ...(state.adjustments ?? [])],
        },
    };
}
/** Batches the workshop has collected and can turn into products. */
const atWorkshop = (state) => state.batches.filter((b) => b.pickedUpAt && !b.processed && b.result.grade !== 'reject');
/** The workshop collects every usable batch waiting at a hub. Rejected batches stay behind. */
function pickUp(state, hubId, env = defaultEnv) {
    if (!HUBS.some((h) => h.id === hubId))
        return fail('err_hub');
    const take = waitingAtHub(state, hubId).filter((b) => b.result.grade !== 'reject');
    if (take.length === 0)
        return fail('err_nothing');
    const ids = new Set(take.map((b) => b.id));
    const at = env.now();
    return {
        ok: true,
        value: {
            state: { ...state, batches: state.batches.map((b) => (ids.has(b.id) ? { ...b, pickedUpAt: at } : b)) },
            count: take.length,
            kg: Math.round(take.reduce((s, b) => s + b.kg, 0) * 10) / 10,
        },
    };
}
/** Dry grounds in grams after the moisture is dried out. */
const dryGrams = (b) => Math.round(b.kg * 1000 * (1 - b.quality.moisturePct / 100));
const unitsFromBatch = (b, productId) => Math.floor(dryGrams(b) / productById(productId).gramsPerUnit);
function produce(state, batchId, productId, env = defaultEnv) {
    const batch = state.batches.find((b) => b.id === batchId);
    if (!batch)
        return fail('err_batch');
    if (batch.processed)
        return fail('err_processed');
    const product = productById(productId);
    if (batch.result.grade === 'reject' || !gradeAtLeast(batch.result.grade, product.minGrade)) {
        return fail('err_grade');
    }
    if (!batch.pickedUpAt)
        return fail('err_pickup');
    const units = unitsFromBatch(batch, productId);
    if (units < 1)
        return fail('err_units');
    return {
        ok: true,
        value: {
            ...state,
            batches: state.batches.map((b) => (b.id === batchId ? { ...b, processed: true } : b)),
            productions: [
                { id: env.id('prod'), batchId, productId, units, madeAt: env.now() },
                ...state.productions,
            ],
        },
    };
}
function stock(state) {
    const out = { ...OPENING_STOCK };
    for (const p of state.productions)
        out[p.productId] += p.units;
    for (const s of state.sales)
        out[s.productId] -= s.units;
    for (const a of state.adjustments ?? [])
        if (a.productId && a.productId in out)
            out[a.productId] += a.to - a.from;
    return out;
}
const MAX_STOCK = 100000;
/**
 * Admin edit: set the number in stock for one product. The change is kept as an entry in
 * `adjustments` (who-did-what trail), so later batches and sales continue from the new number.
 */
function setStock(state, productId, units, env = defaultEnv) {
    if (!(productId in OPENING_STOCK))
        return fail('err_product');
    if (!Number.isInteger(units) || units < 0 || units > MAX_STOCK)
        return fail('err_stock_num');
    const from = stock(state)[productId];
    if (from === units)
        return { ok: true, value: state };
    return {
        ok: true,
        value: { ...state, adjustments: [{ id: env.id('adj'), productId, from, to: units, at: env.now() }, ...(state.adjustments ?? [])] },
    };
}
function sell(state, input, env = defaultEnv) {
    const shop = BRANDS.find((b) => b.id === input.shopId);
    if (!shop || shop.kind !== 'cafe')
        return fail('err_shop');
    if (!Number.isInteger(input.units) || input.units < 1)
        return fail('err_units');
    if (input.units > stock(state)[input.productId])
        return fail('err_stock');
    const revenueVnd = input.units * productById(input.productId).priceVnd;
    return {
        ok: true,
        value: {
            ...state,
            sales: [
                { id: env.id('sale'), productId: input.productId, shopId: input.shopId, units: input.units, revenueVnd, soldAt: env.now() },
                ...state.sales,
            ],
        },
    };
}

export { defaultEnv, emptyState, MAX_BATCH_KG, addBatch, isoDay, parseDay, pickupWindow, scheduledPickups, roundSize, spotsLeft, schedulePickup, reschedulePickup, cancelPickup, waitingAtHub, atWorkshop, pickUp, dryGrams, unitsFromBatch, produce, stock, setStock, MAX_STOCK, sell, hubConfig, hubWaitingKg, setHub, clearRejected, MAX_HUB_KG };
