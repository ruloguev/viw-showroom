# Assets · Zpyra Showroom

This folder contains the real Zpyra imagery used by the showroom. Keep the
filenames exactly as listed below: the components reference them directly.

## Inventory

| File | Dimensions | Aspect | Used by | Notes |
| --- | --- | --- | --- | --- |
| `zpyra-aerial.webp` | 1320 × 743 | ~16:9 | Masterplan (`AerialMasterplan`) | Background of the interactive aerial plan. |
| `zpyra-day.webp` | 2560 × 1440 | 16:9 | Tower façade (`TowerFacadeViewer`) | Default daytime façade. |
| `zpyra-night.webp` | 2560 × 1440 | 16:9 | Tower façade (`TowerFacadeViewer`) | Night mode. Must match the day image framing. |
| `pano-1.webp` | 4096 × 2048 | 2:1 | 360° tour | Scene “Fachada & Llegada” — exterior front view. |
| `pano-2.webp` | 4096 × 2048 | 2:1 | 360° tour | Scene “Interior de Residencia” — representative apartment interior (all residences share the same layout). |
| `pano-3.webp` | 4096 × 2048 | 2:1 | 360° tour | Scene “Torre desde la Plaza” — tower seen through the plaza oculus. |
| `pano-4.webp` | 4096 × 2048 | 2:1 | 360° tour | Scene “Plaza Pública” — public plaza and fountain interior. |
| `zpyra-floorplan.webp` | 1320 × 743 | ~16:9 | Units view (`UnitsExplorer`) | Typical floor plan: four residences around the central core. Every level repeats this layout. |

> The original aerial file was named `zpyra-aereal.webp`. It was copied here as
> `zpyra-aerial.webp` to fix the typo. Keep the corrected name.

## Replacing the images

1. Export in **WebP**, sRGB, quality ≈ 82–88.
2. Preserve the existing filenames and aspect ratios.
3. Match the current framing for `zpyra-day.webp` / `zpyra-night.webp`. The unit
   polygons are calibrated in a 1600 × 900 SVG space on top of the façade, so a
   different crop or camera angle requires repositioning them in
   `src/data/zpyra-demo.ts` (`facade.points`, `facade.labelX`, `facade.labelY`).
4. Aerials keep the site centered as in the current image. The three pins use
   percentage coordinates (`position.x`, `position.y`) in
   `src/data/zpyra-demo.ts`; recalculating them is only necessary if the site
   moves within the new frame.
5. Panoramas must be **equirectangular, exactly 2:1**, with the horizon around
   the vertical midpoint. The viewer centers the texture at `u = 0.5` as the
   initial view. If a new panorama has a different orientation, adjust
   `initialYaw` for that scene in `src/data/zpyra-demo.ts`.
6. Hotspot positions are expressed in the 3D sphere space
   (`position: [x, y, z]`). Re-check them after replacing a panorama and update
   the `hotspots` array for that scene if needed.
7. After replacing an asset, run `npm run build` and walk through the five views
   in the browser to confirm alignment and orientation.

## Image rights

All imagery is provided by the client for the Zpyra / Ultea demo. Confirm usage
rights before publishing outside the demo environment.
