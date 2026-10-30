# Lắng: Coffee Grounds Loop

![A pour-over coffee being brewed](docs/images/pour-over.png)

*Image: illustrative still, used for this README only.*

**Lắng** is a small web app that closes a loop for coffee waste. Local cafés drop their spent grounds at a hub, we check the quality, a workshop turns them into handmade odor-absorbing products, and the products are sold back to the same cafés.

This is the project of our group, **Crusaders**, for **Swin-Biz Rockstar**.

The site runs in English and Vietnamese. It has no backend. Everything you enter stays in your own browser.

## Features

- Five-step loop in one place: **drop, check, pick up, craft, sell**
- Quality check that grades every batch of grounds (A, B, C or reject) with clear reasons
- Café map around 34 Bạch Đằng, A35 Bạch Đằng and 485 Lê Quang Định (Tân Bình, Ho Chi Minh City)
- Live "impact" page: kilograms diverted, products made, revenue and estimated CO₂e saved
- Vietnamese and English text, dark and light mode, one simple menu
- Plain HTML, CSS and JavaScript modules built with Vite. No framework.

> **Prototype notice:** café names, addresses and coordinates come from Google Maps. Grounds volumes, prices and costs are **sample numbers**, and the cafés are **not partners yet**.

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

The page is chosen by the URL hash (`#home`, `#collect`, `#hub`, `#workshop`, `#market`, `#impact`). The shell draws the header menu, the language switch and the dark mode switch, then calls the matching `render...` function in `src/features/`.

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

## Project structure

```
.
├── .github/workflows/deploy.yml   Deploys to GitHub Pages
├── docs/images/pour-over.png      README image
├── public/logo.svg                Logo and favicon
├── src/
│   ├── core/                      state, quality, store, loop, dom
│   ├── data/                      places, products, images
│   ├── features/                  one file per page, plus map and 3D
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
