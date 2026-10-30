import { BRANDS, HUBS } from '../data/places';
import { productById } from '../data/products';
import { assessQuality, gradeAtLeast } from './quality';
const defaultEnv = {
    now: () => new Date().toISOString(),
    id: (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
};
const emptyState = () => ({ batches: [], productions: [], sales: [] });
const fail = (error) => ({ ok: false, error });
const MAX_BATCH_KG = 1000;
function addBatch(state, input, env = defaultEnv) {
    if (!BRANDS.some((b) => b.id === input.brandId))
        return fail('err_brand');
    const hubId = input.hubId ?? HUBS[0]?.id ?? '';
    if (!HUBS.some((h) => h.id === hubId))
        return fail('err_hub');
    if (!Number.isFinite(input.kg) || input.kg <= 0 || input.kg > MAX_BATCH_KG)
        return fail('err_kg');
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
    return { ok: true, value: { ...state, batches: [batch, ...state.batches] } };
}
/** Batches sitting at a hub: dropped by a café, not yet collected by the workshop. */
const waitingAtHub = (state, hubId) => state.batches.filter((b) => (b.hubId || HUBS[0]?.id) === hubId && !b.pickedUpAt && !b.processed);
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
    const out = {
        'fridge-sachet': 0,
        'shoe-deodorizer': 0,
        'car-sachet': 0,
        'scrub-soap': 0,
        candle: 0,
    };
    for (const p of state.productions)
        out[p.productId] += p.units;
    for (const s of state.sales)
        out[s.productId] -= s.units;
    return out;
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

export { defaultEnv, emptyState, MAX_BATCH_KG, addBatch, waitingAtHub, atWorkshop, pickUp, dryGrams, unitsFromBatch, produce, stock, sell };
