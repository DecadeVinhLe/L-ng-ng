import { PRODUCTS } from '../data/products';
const RANK = { reject: 0, C: 1, B: 2, A: 3 };
/**
 * Scores a batch of wet spent grounds from 0 to 100.
 * Hard fails (visible mold, heavy contamination) are always rejected.
 * Thresholds are sample values for the prototype, not a lab standard.
 */
function assessQuality(input) {
    const issues = [];
    let score = 100;
    const hardFail = input.moldVisible || input.contaminantPct > 25;
    if (input.moldVisible)
        issues.push('mold');
    if (input.contaminantPct > 10) {
        issues.push('contaminated');
        score -= Math.min(40, (input.contaminantPct - 10) * 2);
    }
    if (input.moisturePct > 70) {
        issues.push('too_wet');
        score -= Math.min(25, (input.moisturePct - 70) * 1.5);
    }
    else if (input.moisturePct < 30) {
        issues.push('too_dry');
        score -= Math.min(15, (30 - input.moisturePct) * 0.75);
    }
    if (input.ageHours > 24) {
        issues.push('stale');
        score -= Math.min(35, (input.ageHours - 24) * 0.75);
    }
    if (input.ph < 4.5 || input.ph > 6.5) {
        issues.push('ph_off');
        score -= Math.min(15, Math.abs(input.ph < 4.5 ? 4.5 - input.ph : input.ph - 6.5) * 10);
    }
    score = Math.max(0, Math.round(score));
    let grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'reject';
    if (hardFail) {
        grade = 'reject';
        score = Math.min(score, 49);
    }
    return { grade, score, issues };
}
const gradeAtLeast = (grade, min) => RANK[grade] >= RANK[min];
const productsFor = (grade) => PRODUCTS.filter((p) => gradeAtLeast(grade, p.minGrade));
/** Validates raw form values; returns an error key or the clean input. */
function parseQualityInput(raw) {
    const num = (k) => Number(raw[k]);
    const moisturePct = num('moisturePct');
    const contaminantPct = num('contaminantPct');
    const ageHours = num('ageHours');
    const ph = num('ph');
    if ([moisturePct, contaminantPct, ageHours, ph].some((n) => !Number.isFinite(n))) {
        return { ok: false, error: 'err_number' };
    }
    if (moisturePct < 0 || moisturePct > 100 || contaminantPct < 0 || contaminantPct > 100) {
        return { ok: false, error: 'err_percent' };
    }
    if (ageHours < 0 || ph < 0 || ph > 14)
        return { ok: false, error: 'err_range' };
    return { ok: true, value: { moisturePct, contaminantPct, ageHours, ph, moldVisible: Boolean(raw['moldVisible']) } };
}

export { assessQuality, gradeAtLeast, productsFor, parseQualityInput };
