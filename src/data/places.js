/**
 * Scope: coffee shops around 34 and A35 Bạch Đằng (Tân Bình) and 485 Lê Quang Định.
 * Café names, addresses and coordinates come from Google Maps. Grounds volumes are
 * SAMPLE numbers, and these cafés are NOT partners yet.
 */
const BRANDS = [
    { id: 'c-ros', name: 'R.O.S.É Coffee & Tea', district: 'Bạch Đằng', address: 'B46 Bạch Đằng', lat: 10.8154157, lng: 106.6685424, kind: 'cafe', zone: 'bd', groundsKgPerWeek: 30, mapsId: 'ChIJibdrZwApdTERgqM7S9bRcTA' },
    { id: 'c-airport', name: 'Airport Coffee', district: 'Bạch Đằng', address: 'B124 Bạch Đằng', lat: 10.8141136, lng: 106.6696761, kind: 'cafe', zone: 'bd', groundsKgPerWeek: 42, mapsId: 'ChIJy8R8M4IpdTER-EXc8M5zGmU' },
    { id: 'c-galaxy', name: 'Galaxy Coffee A75', district: 'Bạch Đằng', address: 'A75/6D/34 Bạch Đằng', lat: 10.8160152, lng: 106.6721085, kind: 'cafe', zone: 'bd', groundsKgPerWeek: 36, mapsId: 'ChIJxWzLIOspdTER9uP67MYypeg' },
    { id: 'c-thin', name: 'Thìn Café', district: 'Bạch Đằng', address: 'A75/6D Bạch Đằng', lat: 10.815864, lng: 106.671384, kind: 'cafe', zone: 'bd', groundsKgPerWeek: 28, mapsId: 'ChIJ5wGNK9UpdTERI8xAYWr5154' },
    { id: 'c-mo', name: 'Mờ Coffee', district: 'Bạch Đằng', address: '187 Bạch Đằng', lat: 10.8156031, lng: 106.6756576, kind: 'cafe', zone: 'bd', groundsKgPerWeek: 48, mapsId: 'ChIJncah_PYpdTERSB1pIDVDQGE' },
    { id: 'c-gutram', name: 'Gu Trầm Coffee', district: 'Lê Quang Định', address: '261 Lê Quang Định', lat: 10.8099677, lng: 106.6923025, kind: 'cafe', zone: 'lqd', groundsKgPerWeek: 26, mapsId: 'ChIJVcxNGYYpdTERP-4ia5rtBx0' },
    { id: 'c-vuongom', name: 'Cafe Vườn Gốm', district: 'Lê Quang Định', address: '301 Lê Quang Định', lat: 10.8107806, lng: 106.6917466, kind: 'cafe', zone: 'lqd', groundsKgPerWeek: 40, mapsId: 'ChIJy2msH8opdTERIc0XKRveXXo' },
    { id: 'c-highlands', name: 'Highlands Coffee Lê Quang Định', district: 'Lê Quang Định', address: '359A Lê Quang Định', lat: 10.8123928, lng: 106.6900541, kind: 'cafe', zone: 'lqd', groundsKgPerWeek: 60, mapsId: 'ChIJz9uMCC8pdTER9eXVU8mEo5Y' },
];
/** The three addresses this prototype is built around. Their roles (hub / workshop) are assumptions. */
const ZONES = {
    bd: { addresses: ['34 Bạch Đằng', 'A35 Bạch Đằng'] },
    lqd: { addresses: ['485 Lê Quang Định'] },
};
const HUBS = [
    { id: 'h-a35', name: 'Điểm gom A35 Bạch Đằng', district: 'Bạch Đằng', address: 'A35 Bạch Đằng', lat: 10.8163045, lng: 106.6691692, capacityKg: 400, mapsId: 'ChIJxc6CPRkpdTERf0i5tCBMKpo' },
    { id: 'h-lqd', name: 'Điểm gom 485 Lê Quang Định', district: 'Lê Quang Định', address: '485 Lê Quang Định', lat: 10.8170658, lng: 106.6886022, capacityKg: 400, mapsId: 'ChIJ3_3PUu8odTER2d-UIw3PrsU' },
];
const WORKSHOPS = [
    { id: 'w-bd', name: 'Xưởng 34 Bạch Đằng', district: 'Bạch Đằng', address: '34 Bạch Đằng', lat: 10.8142824, lng: 106.6694055, capacityKgPerWeek: 300, mapsId: 'ChIJbdWWxhgpdTEReiS47yGBUcU' },
];
const placeById = (id) => [...BRANDS, ...HUBS, ...WORKSHOPS].find((p) => p.id === id);
/** Official Google Maps link format: opens the place by name and id. */
const mapsUrl = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address ?? ''}`.trim())}${p.mapsId ? `&query_place_id=${p.mapsId}` : ''}`;
/** The hub each area drops its grounds at. */
const HUB_FOR_ZONE = { bd: 'h-a35', lqd: 'h-lqd' };
const brandsInZone = (zone) => BRANDS.filter((b) => b.zone === zone);

export { BRANDS, ZONES, HUBS, WORKSHOPS, placeById, mapsUrl, HUB_FOR_ZONE, brandsInZone };
