# Förklaringsfilmer

Korta animerade filmer till elteknikkursen med måsen Måns och matrosen Sigge i pixelstil.

| Film | Id | Hör till |
|------|----|----------|
| Dubbel ström | `dubbel-strom` | v39_01 Effekt och energi |
| Varför √2? | `varfor-rot-2` | v40_01 Sinusformad växelspänning |
| Varför √3? | `varfor-rot-3` | v41_01 Trefassystemets grunder |
| Hållkretsen | `hallkretsen` | v41_03 och v43_03 |

## Filer

- `engine.mjs` – deterministisk canvas-motor (1280×720), tavla, pratbubbla, titelkort och undertexter (WebVTT).
- `mascots.mjs` – figurerna som pixelrutnät. Munnen rör sig när figuren pratar, de blinkar, Sigge vinkar och Måns flaxar.
- `films/*.mjs` – en fil per film: scener med `draw(ctx, t)` och repliker `say: [[från, till, vem, text]]`.
- `spela.html` – interaktiv spelare (`?film=<id>`). Med `&render=1` visas bara duken.
- `render.cjs` – renderar bild för bild med Playwright och kodar H.264 med ffmpeg till `video/<id>.mp4`, plus affisch (`.png`) och undertexter (`.vtt`).

## Rendera

```bash
python3 -m http.server 8765 &          # i repots rot
node sjoskolan/filmer/render.cjs        # alla filmer
node sjoskolan/filmer/render.cjs hallkretsen
node sjoskolan/filmer/render.cjs --stills /tmp/bilder hallkretsen 5,20,40   # stillbilder för granskning
```

## Ny film

1. Skapa `films/<namn>.mjs` efter mönstret i de andra filerna och avsluta med `compile({...})`.
2. Lägg till filmen i `films/index.mjs`.
3. Rendera och länka från veckans sida.

Regler: samma färger som figurerna (L1 blå, L2 orange, L3 grön, rött bara för det som söks), inga nya exempeltal som krockar med övningarnas svar, och en säkerhetsrad där det passar.
