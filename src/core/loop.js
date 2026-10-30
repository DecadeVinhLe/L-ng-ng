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
    const unitsProduced = state.productions.reduce((s, p) => s + p.units, 0);
    const unitsSold = state.sales.reduce((s, x) => s + x.units, 0);
    const suppliers = new Set(state.batches.map((b) => b.brandId));
    const unitsSoldBack = state.sales.filter((s) => suppliers.has(s.shopId)).reduce((s, x) => s + x.units, 0);
    const revenueVnd = state.sales.reduce((s, x) => s + x.revenueVnd, 0);
    const costVnd = state.sales.reduce((s, x) => s + x.units * productById(x.productId).costVnd, 0);
    return {
        collectedKg: round1(collectedKg),
        rejectedKg: round1(rejectedKg),
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
const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} ₫`;

export { CO2E_PER_KG_DIVERTED, summarize, formatVnd };
