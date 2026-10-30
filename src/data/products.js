/** SAMPLE prices and costs in VND. */
const PRODUCTS = [
    { id: 'fridge-sachet', gramsPerUnit: 30, minGrade: 'C', priceVnd: 25_000, costVnd: 6_000 },
    { id: 'shoe-deodorizer', gramsPerUnit: 60, minGrade: 'C', priceVnd: 45_000, costVnd: 12_000 },
    { id: 'car-sachet', gramsPerUnit: 25, minGrade: 'B', priceVnd: 59_000, costVnd: 15_000 },
    { id: 'scrub-soap', gramsPerUnit: 20, minGrade: 'B', priceVnd: 55_000, costVnd: 18_000 },
    { id: 'candle', gramsPerUnit: 40, minGrade: 'A', priceVnd: 89_000, costVnd: 32_000 },
];
const productById = (id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p)
        throw new Error(`Unknown product: ${id}`);
    return p;
};

export { PRODUCTS, productById };
