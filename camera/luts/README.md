# Original creative film grades

`python3 tools/build-camera-luts.py` regenerates these 32³ RGB LUTs and the identity reference. No third-party LUT,
camera profile, film brand, reference shader or film-stock measurement is used. These are creative display-RGB
curves, not calibrated film emulations or colour-management profiles.

PNG layout: 1024 × 32, `x = blue * 32 + red`, `y = green`, each axis running from 0 to 31. `looks-gl.js` reorders the
decoded strip into a 32 × 32 × 32 RGBA8 WebGL2 texture. LINEAR min/mag filters interpolate all three axes; sampling
at `rgb * 31/32 + .5/32` addresses texel centres and keeps the endpoints.

- **Warm slide:** a modest S curve, slightly stronger colour, warmer lights and a small cool-shadow bias.
- **Soft negative:** lifted toe, softer ceiling, restrained colour and gentle warm bias.
- **Identity:** tests axis orientation, endpoints and interpolation; it is not offered as another Natural Look.

The two runtime PNGs load once per graphics context. Thumbnail/viewfinder drawing waits for the texture; a failed
load marks the grades unavailable, and a save refuses to produce a black/missing-grade photograph. The existing
offline worker caches the PNGs when fetched. Their physical iPhone first-load/offline behaviour remains unverified.
