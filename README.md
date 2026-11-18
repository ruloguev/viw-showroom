# VIW · Interactive Sales Showroom

An immersive real-estate sales showroom built for **Ultea** and its **Zpyra**
residential demo on the Mérida–Progreso corridor in Yucatán. The experience
combines an interactive masterplan, an explorable tower façade, a chained 360°
tour with WebXR support, a location map and a live inventory workflow — all
wrapped in the VIW visual system.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with a small set of custom CSS animations
- **Three.js / React Three Fiber / @react-three/xr** for the 360° viewer
- **lucide-react** icons and **qrcode.react** for QR sharing
- Fonts: **Inter** (UI) and **Poppins** (display) via `next/font`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
npx tsc --noEmit
```

## What is included

- **Interactive aerial masterplan** with 3 calibrated pins (arrival, water
  amenities, tower).
- **Tower façade viewer** with day/night imagery, 8 clickable residences, status
  colors and hover/active cards.
- **360° tour** with 4 chained scenes, animated hotspots, keyboard/pointer
  navigation and optional WebXR entry. The viewer is loaded client-side only.
- **Location view** with 4 points of interest, an animated route line and travel
  times.
- **Units explorer** with the typical floor plan: four residences per level
  around the central core, repeated on every floor.
- **Unit ficha (drawer)** with gallery image, specs, price, highlights, direct
  WhatsApp CTA, QR sharing and a “start tour” shortcut.
- **Live inventory modal** to switch availability (`Disponible`, `Reservado`,
  `Vendido`). Changes persist in `localStorage` and update every view.
- **Search and filters** in the top bar: full-text search plus
  “Todas / Disponibles”.
- **Deep links**: `?unit=ZP-1701` opens the tower view with that ficha; the URL
  is kept in sync while a unit is open.
- **QR sharing** that encodes the current unit’s deep link.
- Responsive layout with a top bar, a collapsible side rail and mobile-friendly
  panels.

## Demo data

Everything lives in [`src/data/zpyra-demo.ts`](src/data/zpyra-demo.ts):

- Project copy, amenities, pins and scenes.
- 8 units, their prices, specs and `tourSceneId`.
- Façade overlays (`facade.points`, label coordinates).
- `PLATFORM_CONFIG` with the demo WhatsApp number and contact email.

> The phone number, prices and availability are demo placeholders. Replace
> `PLATFORM_CONFIG.whatsappNumber` and the unit data before a real launch.

Live inventory is stored under the `viw:zpyra:inventory` localStorage key. It
is intentionally device-local: there is no backend in this demo.

## Project structure

```
src/
  app/                 App Router entry, global styles and metadata
  components/
    commercial/        Unit drawer, preview card, live inventory
    layout/            Top navbar and side rail
    ui/                QR modal
    viewer/            Aerial, façade, 360° tour and location views
  data/                Zpyra demo dataset
  lib/                 Formatting, WhatsApp and share-link helpers
  types/               Shared TypeScript contracts
public/assets/         Real Zpyra imagery (see README_ASSETS.md)
```

## Assets

All imagery is served from `public/assets`. The original client files were kept
and only the aerial filename typo was corrected. See
[`public/assets/README_ASSETS.md`](public/assets/README_ASSETS.md) for the full
inventory, dimensions and replacement instructions.

## Notes

- The 360° viewer uses a full equirectangular sphere; panoramas must be 2:1.
- The façade overlays are SVG polygons calibrated to the supplied day/night
  images. Replacing those images may require recalibration.
- WebXR requires a compatible headset/browser; the standard drag-to-look tour
  works everywhere.
- This is a sales demo, not a listing platform: there is no authentication,
  backend or payment flow.
