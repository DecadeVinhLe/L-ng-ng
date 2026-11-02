# Lắng: Coffee Grounds Loop

![A pour-over coffee being brewed](docs/images/pour-over.png)


**Lắng** is a small web app that closes a loop for coffee waste. Local cafés drop their spent grounds at a hub, we check the quality, a workshop turns them into handmade odor-absorbing products, and the products are sold back to the same cafés.

This is the project of our group, **Crusaders**, for **Swin-Biz Rockstar**.

The site runs in English and Vietnamese. It has no backend. Everything you enter stays in your own browser.

## Features

- Five-step loop in one place: **drop, check, pick up, craft, sell**
- **Communities** page: households in the three areas book a **collection date** and we collect their grounds from the door, in addition to the café drops
- Quality check that grades every batch of grounds (A, B, C or reject) with clear reasons
- Café map around 34 Bạch Đằng, A35 Bạch Đằng and 485 Lê Quang Định (Tân Bình, Ho Chi Minh City)
- Live "impact" page: kilograms diverted, products made, revenue and estimated CO₂e saved
- **Demo** page: one batch walks through the whole loop with sample numbers, on its own copy of the data
- **Admin** page (passcode): edit how many of each product are in stock, and control the collecting hubs
- Vietnamese and English text, dark and light mode, one simple menu
- Plain HTML, CSS and JavaScript modules built with Vite. No framework.

> **Prototype notice:** café names, addresses and coordinates come from Google Maps. Grounds volumes, prices and costs are **sample numbers**, and the cafés are **not partners yet**. The three communities are **example areas** (the streets around 34 and A35 Bạch Đằng and 485 Lê Quang Định), and no household has signed up.

## How the core tools work

### 1. The loop (`src/core/state.js`)

All data is one state object: `{ batches, productions, sales }`. Each step is a plain function that takes the state and returns a new one, or an error key.

| Step | Page | Function | What it does |
| --- | --- | --- | --- |
| Drop | Collect | `addBatch` | A café logs kilograms of grounds and quality readings. The batch is graded and sent to the hub for its area. |
| Check | Collect | `assessQuality` | Scores the batch and shows which products it can become. |
| Pick up | Hub | `pickUp` | The workshop collects every usable batch waiting at a hub. Rejected batches stay behind. |
| Craft | Workshop | `produce` | Turns a batch into units of one product, based on dry weight. |
| Sell | Market | `sell` | Sells units back to a café and records revenue. |

### 1b. Household pick-ups (`src/core/state.js`, `src/features/community.js`)

Cafés are not the only source of grounds. `COMMUNITIES` in `src/data/places.js` lists three residential areas, one per address. A household opens **Communities** (`#community`), picks its community and a date, and gives a name, a phone or Zalo number, a house or lane and about how many kg.

| Function | What it does |
| --- | --- |
| `schedulePickup` | Books a date. Checks the name, phone (8 to 13 digits), address, weight (0.1 to 20 kg) and that the date is from tomorrow to 4 weeks ahead. One open booking per phone number per community, and at most 12 households per community per day. |
| `reschedulePickup` | Moves a booking to another valid date, with the same capacity check. |
| `cancelPickup` | Cancels a booking that is still waiting. |
| `addBatch` | Now accepts a community as the source, and an optional `pickupId`. Saving the batch marks that booking **collected** in the same step. |

The rules live in `PICKUP_RULES` in `src/data/places.js`. Dates are plain `YYYY-MM-DD` strings in the browser's time zone.

The flow for the collector: open **Admin → Household pick-ups** to see who is booked on which day (with phone, address and note), collect on that day, then on **Collect** choose the booking under "From a booked household pick-up". The community and weight are filled in, you enter the quality readings, and the batch goes to that area's hub like any other. **Impact** shows the kilograms that came from households.

> **Bookings stay in the browser.** The site has no backend, so a booking made on a household's phone is saved only on that phone. A collector cannot see it yet. To make this real, send bookings to a server or a shared sheet (for example a form that writes to Google Sheets, or a small database) and read them in the Admin page.

### 2. Quality check (`src/core/quality.js`)

`assessQuality` starts at 100 points and subtracts for problems:

- Contamination above 10%
- Moisture above 70% (too wet) or below 30% (too dry)
- Age above 24 hours (stale)
- pH outside 4.5 to 6.5

Score 85 or more is **A**, 70 or more is **B**, 50 or more is **C**, and anything lower is **reject**. Visible mold or contamination above 25% is always a reject. The thresholds are sample values, not a lab standard.

The grade decides what can be made. Each product in `src/data/products.js` has a minimum grade: fridge sachet and shoe deodorizer (C), car sachet and scrub soap (B), candle (A).

### 3. Store (`src/core/store.js`)

A tiny observable store saves the state to `localStorage` and tells pages when to redraw. If the browser blocks storage, the app still works for that visit.

### 4. Pages and routing (`src/features/shell.js`)

The page is chosen by the URL hash (`#home`, `#community`, `#collect`, `#hub`, `#workshop`, `#market`, `#impact`, `#demo`, `#admin`). The shell draws the header menu, the language switch and the dark mode switch, then calls the matching `render...` function in `src/features/`.

### 5. DOM helper (`src/core/dom.js`)

`h(tag, attrs, ...children)` builds elements without a framework. It is used by every page.

### 6. Languages (`src/i18n/`)

All text lives in `translations.js` as `key|English|Tiếng Việt` lines. `t(key)` returns the text for the current language, and elements with `data-i="key"` in `index.html` are filled automatically.

### 7. Maps (`src/features/gmap.js`)

With no key, the home page shows Google's keyless embedded map. To use the full Google Maps JavaScript API with markers, paste a key into the `google-maps-key` meta tag in `index.html`.

### 8. Visuals

- `src/features/scene3d.js`: a WebGL shader draws a 3D coffee cup in the hero. If WebGL is missing, the drawn pictures are used instead.
- `src/features/three-fig.js`: loads Three.js r128 from cdnjs for the 3D figure.
- `src/data/images.js`: anime-style SVG pictures for the hero and the five products, generated in code.


### 6. Admin (`src/features/admin.js`)

Open it from the footer link or `#admin`. It asks for a passcode (default `lang2026`; change the SHA-256 hash in `src/data/admin.js`). Behind the lock:

- **Product numbers:** set the stock for each product (`setStock`). Later batches and sales continue from the new number.
- **Collecting hubs:** for each hub, open or close it, set its capacity in kg (`setHub`), and clear rejected batches stuck there (`clearRejected`). A closed hub takes no new drops and is greyed out on the Collect page; `addBatch` refuses any drop that would go over a hub's capacity.
- **Household pick-ups:** every booked household by date, with contact, address and note, plus how many kilograms and collection days are due in the next 7 days. A booking can be cancelled here.
- **Café tracker** (`cafeTracker` in `src/core/loop.js`): for every café, grounds dropped, units bought back and revenue, plus the next likely collection date (last drop plus the café's own average gap between drops, or a week if there is only one drop) and the expected kg. A CSV download is included for planning.
- Every change is written to a log (`adjustments`) and shown under "Recent changes".

> **Not real security.** The site has no backend, so the passcode check runs in the browser and every change is saved only in that browser. Anyone can read the hash or the browser storage. Shared admin control across devices needs a server with a login.

`npm run build` makes the Vite site. `python3 scripts/bundle_single.py out.html` makes one self-contained HTML file with no build tools.

## Project structure

```
.
├── .github/workflows/deploy.yml   Deploys to GitHub Pages
├── docs/images/pour-over.png      README image
├── public/logo.svg                Logo and favicon
├── src/
│   ├── core/                      state, quality, store, loop, dom
│   ├── data/                      places, products, images
│   ├── features/                  one file per page (community.js for household bookings), plus map and 3D
│   ├── i18n/                      translations and t()
│   ├── styles/                    base, header, forms, home
│   └── main.js                    entry point
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
└── README.md
```

## Getting started: clone and run locally

You need [Node.js](https://nodejs.org/) 18 or higher and [Git](https://git-scm.com/).

```bash
git clone <your-repo-url>
cd lang-website
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

Build and preview the production site:

```bash
npm run build
npm run preview
```

## Deploy

1. Push the project to a GitHub repository on the `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy.yml`, builds the site and publishes it.

Because `vite.config.js` uses `base: './'`, the same build also works on any other static host.

## Team

**Lặng**, for **Design-Thinking**.

## License

MIT, see [LICENSE](LICENSE).
