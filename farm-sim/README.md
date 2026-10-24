# Minato Farm

A small farm simulator built from Johansson World assets (`johansson-town/assets`: food art, town icon, title backdrop,
copied into `www/assets`). Plant seeds, wait, harvest, sell, clear more fields. Progress is saved in `localStorage`.
Crops are the island's staples: rice (onigiri), wheat (ramen), cabbage (gyoza), pumpkin (curry), milk (ice cream).

## Play in a browser
`npm run serve`, then open http://localhost:8000 (no build step).

## Build the iOS app (needs macOS with Xcode)
```bash
cd farm-sim
npm install
npx cap add ios
npx cap sync ios
npx cap open ios   # set your signing team in Xcode, then Run / Archive
```
After editing `www/`, run `npx cap sync ios` again. App icon: use `www/assets/town-512.png` as the base (Xcode needs 1024×1024; upscale or replace).

Not yet verified on a device or simulator.
