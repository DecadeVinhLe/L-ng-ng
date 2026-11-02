import { BRANDS, COMMUNITIES } from '../data/places';
import { productById } from '../data/products';
/**
 * Illustrative factor: kg CO2e avoided per kg of wet grounds kept out of landfill.
 * It is a placeholder, not a measured value. Replace it with a sourced figure.
 */
const CO2E_PER_KG_DIVERTED = 0.25;
function summarize(state) {
    const collectedKg = state.batches.reduce((s, b) => s + b.kg, 0);
    const rejectedKg = state.batches.filter((b) => b.result.grade === 'reject').reduce((s, b) => s + b.kg, 0);
    const divertedKg = state.batches.filter((b) => b.processed).reduce((s, b) => s + b.kg, 0);
    const communityIds = new Set(COMMUNITIES.map((x) => x.id));
    const householdKg = state.batches.filter((b) => communityIds.has(b.brandId)).reduce((s, b) => s + b.kg, 0);
    const unitsProduced = state.productions.reduce((s, p) => s + p.units, 0);
    const unitsSold = state.sales.reduce((s, x) => s + x.units, 0);
    const suppliers = new Set(state.batches.map((b) => b.brandId));
    const unitsSoldBack = state.sales.filter((s) => suppliers.has(s.shopId)).reduce((s, x) => s + x.units, 0);
    const revenueVnd = state.sales.reduce((s, x) => s + x.revenueVnd, 0);
    const costVnd = state.sales.reduce((s, x) => s + x.units * productById(x.productId).costVnd, 0);
    return {
        collectedKg: round1(collectedKg),
        rejectedKg: round1(rejectedKg),
        householdKg: round1(householdKg),
        divertedKg: round1(divertedKg),
        unitsProduced,
        unitsSold,
        unitsSoldBack,
        revenueVnd,
        costVnd,
        circularity: unitsProduced === 0 ? 0 : Math.round((unitsSoldBack / unitsProduced) * 100) / 100,
        co2AvoidedKg: round1(divertedKg * CO2E_PER_KG_DIVERTED),
    };
}
const round1 = (n) => Math.round(n * 10) / 10;
const DAY_MS = 86_400_000;
/** With only one drop on record we assume the café drops about once a week. */
const DEFAULT_INTERVAL_DAYS = 7;
/**
 * Per-café tracker: grounds dropped, what the café has bought back (revenue), and when its next
 * collection is likely. The next date is the last drop plus the café's own average gap between drops
 * (a week if there is only one drop). A café with no drops yet has no date; its expected kg falls back
 * to its sample weekly figure. Rows are sorted by revenue, then by expected kg.
 */
function cafeTracker(state, now = Date.now()) {
    const rows = BRANDS.filter((b) => b.kind === 'cafe').map((b) => {
        const drops = state.batches.filter((x) => x.brandId === b.id).sort((a, c) => new Date(a.receivedAt).getTime() - new Date(c.receivedAt).getTime());
        const buys = state.sales.filter((x) => x.shopId === b.id);
        const kgDropped = round1(drops.reduce((sum, x) => sum + x.kg, 0));
        const times = drops.map((x) => new Date(x.receivedAt).getTime());
        const gaps = times.slice(1).map((t, i) => (t - times[i]) / DAY_MS).filter((g) => g > 0);
        const intervalDays = gaps.length ? round1(gaps.reduce((a, c) => a + c, 0) / gaps.length) : DEFAULT_INTERVAL_DAYS;
        const lastDropAt = drops.length ? drops[drops.length - 1].receivedAt : null;
        const nextAt = lastDropAt ? new Date(new Date(lastDropAt).getTime() + intervalDays * DAY_MS).toISOString() : null;
        const daysUntil = nextAt ? Math.round((new Date(nextAt).getTime() - now) / DAY_MS) : null;
        return {
            id: b.id,
            name: b.name,
            drops: drops.length,
            kgDropped,
            lastDropAt,
            nextAt,
            daysUntil,
            estimated: gaps.length === 0,
            expectedKg: drops.length ? round1(kgDropped / drops.length) : b.groundsKgPerWeek,
            unitsBought: buys.reduce((sum, x) => sum + x.units, 0),
            revenueVnd: buys.reduce((sum, x) => sum + x.revenueVnd, 0),
        };
    });
    rows.sort((a, b) => b.revenueVnd - a.revenueVnd || b.expectedKg - a.expectedKg);
    const dueSoon = rows.filter((r) => r.daysUntil !== null && r.daysUntil <= 7);
    return {
        rows,
        totals: {
            revenueVnd: rows.reduce((s, r) => s + r.revenueVnd, 0),
            kgDropped: round1(rows.reduce((s, r) => s + r.kgDropped, 0)),
            dueSoonCount: dueSoon.length,
            dueSoonKg: round1(dueSoon.reduce((s, r) => s + r.expectedKg, 0)),
        },
    };
}
const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} ₫`;

export { CO2E_PER_KG_DIVERTED, summarize, formatVnd, cafeTracker };
