# Form 3D Studio · Image → SVG workspace

A privacy-first raster-to-vector workspace integrated into Form 3D Studio. Images are decoded into a local canvas and sent to a Web Worker on the same device; no upload endpoint, analytics or account system exists. The former standalone route now opens this workspace inside the common Form 3D application shell.

## Engines and trade-offs

- **VTracer 1.0 alpha.3** is the default. Its Rust/WebAssembly core produces compact colour and monochrome paths and is particularly effective on illustrations and photographs. The build script converts the official Node-oriented WASM-bindgen loader into a browser loader without altering the engine itself.
- **Potrace WASM 0.5.0** is the specialist choice for black-and-white logos, signatures and line art. Potrace is GPL-2.0; it is included in the local vector worker and is selected explicitly in the UI.
- **ImageTracer.js 1.2.6** is the pure-JavaScript fallback. It starts simply and works without WebAssembly, but generally produces more paths on difficult photographs.
- **SVGO 4** cleans the generated markup. **fflate** creates local batch ZIP files.

VTracer is the recommended everyday engine. Potrace is useful when faithful binary outlines matter most. Photo tracing is necessarily an interpretation: more colours preserve detail but increase SVG size and editing complexity.

## Run locally

```sh
npm ci
npm run build
npx serve .
```

Open `http://localhost:3000/image-to-svg/`. A web server is required because browsers do not permit Web Workers, WebAssembly and service workers reliably from `file://` URLs.

The production files are `index.html`, `styles.css`, `app.js`, `vector-worker.js` and `vtracer_wasm_bg.wasm`. Source lives in `image-to-svg/src/`; do not edit the generated JavaScript bundles directly.

## Use

1. Drop one or more PNG, JPEG, WebP, GIF, BMP or AVIF files. Each file is limited to 20 MB. Animated files use the browser-decoded first frame.
2. Start from a preset. VTracer covers colour and photographs; select Potrace for binary line work if desired.
3. Compare, pan and zoom, then download or copy the SVG. Batch results can be downloaded as one ZIP.
4. **Apply to keychain** re-traces the selected image with the dedicated monochrome preset and passes the SVG contours directly to the 3D workspace without navigation or temporary storage. There the visible contours are fitted without cropping to a thin rounded white sticker backing; the backing and black artwork rotate together and attach to the keychain.

`Ctrl`/`⌘` + `V` pastes an image; `Ctrl`/`⌘` + `S` downloads the current SVG. Settings can be saved as a device-local custom preset.

## Parameters

| Control | Effect |
| --- | --- |
| Colours / colour regions | Limits the palette and chooses ordinary clustering or watershed segmentation. |
| Threshold / adaptive | Separates dark foreground from light background globally or by local neighbourhood. |
| Noise filter | Removes small isolated regions before curve fitting. |
| Curve fitting / corners | Chooses pixel, polygon or spline geometry and how readily sharp turns are retained. |
| Simplification / precision | Trades path size and node count against fidelity. |
| Cutout / stacked | Uses seam-free neighbouring regions or overlapping paint-like layers. |
| Fill / stroke | Emits filled shapes or converts path appearance to non-scaling strokes. |
| Background removal | Samples the four corners and makes similar pixels transparent before tracing. |

Images above the chosen maximum dimension are proportionally downscaled before tracing. The original stays available for re-conversion at another size.

## Command line

The optional CLI uses the same official VTracer WASM package:

```sh
npm run vectorize -- portrait.png portrait.svg --preset keychain
npm run vectorize -- poster.jpg poster.svg --preset illustration --colors 10
```

Run `node scripts/image-to-svg-cli.mjs --help` for all options. The CLI decoder accepts PNG, JPEG, GIF and BMP; use the browser studio for WebP and AVIF.

## Deploy

This is a static application. Run `npm ci && npm run build`, then publish the `form-3d-studio` directory to GitHub Pages, Vercel, Netlify or Cloudflare Pages. Serve `.wasm` as `application/wasm` where configurable. No server functions or environment variables are required.

The service worker caches the shell, worker and WASM engine after the first successful visit, permitting subsequent offline use. Conversions remain local both online and offline.

Third-party attribution is recorded in `../THIRD_PARTY_NOTICES.md`; the complete Potrace GPL-2.0 text is distributed as `POTRACE-GPL-2.0.txt` alongside the worker.
