/**
 * The map is Google Maps. With an API key (see README) it is the Maps JavaScript API: a pin for every
 * café, collection point and the workshop, with their real coordinates. Without a key it falls back to
 * Google's plain embedded map of the area, which needs no key but cannot show our own pins.
 */
import { BRANDS, HUBS, HUB_FOR_ZONE, WORKSHOPS, mapsUrl } from '../data/places';
import { getLang, t } from '../i18n/index';
/** Key comes from <meta name="google-maps-key"> in index.html (or the bundled page). Empty means "use the embed". */
const metaKey = () => document.querySelector('meta[name="google-maps-key"]')?.content.trim() ?? '';
let loading;
function loadMaps(key) {
    const w = window;
    if (w.google?.maps)
        return Promise.resolve(w.google.maps);
    loading ??= new Promise((resolve) => {
        w.__langMapReady = () => resolve(w.google?.maps);
        w.gm_authFailure = () => resolve(undefined); // wrong key, billing off, or a blocked referrer
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=__langMapReady&loading=async&language=${getLang()}&v=weekly`;
        s.async = true;
        s.onerror = () => resolve(undefined);
        document.head.append(s);
    });
    return loading;
}
const sq = (fill, size) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="${fill}" stroke="#14130f" stroke-width="2"/></svg>`)}`;
const center = { lat: 10.8138, lng: 106.6795 };
/** Google's keyless embedded map, centred on the three addresses. */
function embed(box) {
    const f = document.createElement('iframe');
    f.src = `https://www.google.com/maps?q=${encodeURIComponent('cafe near 34 Bạch Đằng, Tân Bình, Hồ Chí Minh')}&z=14&hl=${getLang()}&output=embed`;
    f.title = t('map_alt');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen', '');
    box.replaceChildren(f);
}
async function mountGoogleMap(box) {
    const key = metaKey();
    if (!key) {
        embed(box);
        return undefined;
    }
    const maps = await loadMaps(key);
    if (!maps || !box.isConnected) {
        if (box.isConnected)
            embed(box);
        return undefined;
    }
    const map = new maps.Map(box, { center, zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: 'cooperative', clickableIcons: false });
    const info = new maps.InfoWindow();
    const bounds = new maps.LatLngBounds();
    const open = (marker, name, line, place) => {
        const root = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = name;
        const p = document.createElement('div');
        p.textContent = line;
        const a = document.createElement('a');
        a.href = mapsUrl(place);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = t('open_maps');
        root.append(strong, p, a);
        info.setContent(root);
        info.open({ map, anchor: marker });
    };
    const cafeIcon = (fill) => ({ path: maps.SymbolPath.CIRCLE, scale: 13, fillColor: fill, fillOpacity: 1, strokeColor: '#14130f', strokeWeight: 2 });
    const pins = BRANDS.map((b, i) => {
        const pos = { lat: b.lat, lng: b.lng };
        bounds.extend(pos);
        const m = new maps.Marker({ map, position: pos, title: b.name, icon: cafeIcon('#14130f'), label: { text: String(i + 1), color: '#f1eee6', fontSize: '12px', fontWeight: '600' } });
        m.addListener('click', () => open(m, b.name, `${b.address ?? b.district} · ${b.groundsKgPerWeek} ${t('kg_short')}`, b));
        return m;
    });
    HUBS.forEach((x) => {
        const pos = { lat: x.lat, lng: x.lng };
        bounds.extend(pos);
        const m = new maps.Marker({ map, position: pos, title: x.name, zIndex: 5, icon: { url: sq('#17407a', 26), scaledSize: new maps.Size(26, 26), anchor: new maps.Point(13, 13) } });
        m.addListener('click', () => open(m, x.name, x.address ?? x.district, x));
    });
    const ws = WORKSHOPS[0];
    if (ws) {
        const pos = { lat: ws.lat, lng: ws.lng };
        bounds.extend(pos);
        const m = new maps.Marker({ map, position: pos, title: ws.name, zIndex: 6, icon: { url: sq('#f0c43a', 34), scaledSize: new maps.Size(34, 34), anchor: new maps.Point(17, 17) } });
        m.addListener('click', () => open(m, ws.name, ws.address ?? ws.district, ws));
        // Dashed blue lines: collection point to workshop. Thin grey: café to its collection point.
        HUBS.forEach((x) => new maps.Polyline({ map, path: [{ lat: x.lat, lng: x.lng }, pos], strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#17407a', scale: 3 }, offset: '0', repeat: '14px' }] }));
    }
    BRANDS.forEach((b) => {
        const hub = HUBS.find((x) => x.id === HUB_FOR_ZONE[b.zone]);
        if (hub)
            new maps.Polyline({ map, path: [{ lat: b.lat, lng: b.lng }, { lat: hub.lat, lng: hub.lng }], strokeColor: '#14130f', strokeOpacity: 0.35, strokeWeight: 1.5 });
    });
    map.fitBounds(bounds, 48);
    return {
        highlight: (n, on) => pins[n - 1]?.setIcon(cafeIcon(on ? '#f0c43a' : '#14130f')),
    };
}

export { mountGoogleMap };
