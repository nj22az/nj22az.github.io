# Retouch acceptance photograph

`portrait-braids.jpg`: Ozan Çulha, Pexels photograph 28890349, used under the
[Pexels licence](https://www.pexels.com/license/).
[Original photograph](https://www.pexels.com/photo/28890349/).
Downloaded at 640 × 960 for deterministic offline face-detection acceptance.
This is the established Camera test portrait recorded in `tools/camera-test-photos.py`.
This test fixture is excluded from the Camera offline runtime inventory.

`portrait-braids-gray.pgm.gz` is a deterministic 320 × 480 grayscale sample of that photograph,
using Pillow's Lanczos reduction and the detector's `(2R + 7G + B) / 10` luminance weights.
`harbour-gray.pgm.gz` is a 320 × 240 grayscale sample of the existing Camera
`samples/default-original.png`, using the same conversion. Both contain binary PGM data
compressed with gzip (zero timestamp). `face-detect.test.mjs` reads them with Node's built-in
zlib and passes their pixels through the actual bundled classifier and detector API.
Only canvas sampling is substituted; browser layout and resampling require browser acceptance.
