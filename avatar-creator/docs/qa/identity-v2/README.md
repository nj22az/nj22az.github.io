# Johansson identity v2 — owner review

Current characters are **left**; the stronger, opt-in Johansson prototype is **right**. Actual shared-engine renders, identical lights and cameras. V1 was not accepted as sufficiently distinct.

[Johansson close comparison](portrait-0.jpg) · [Thuan close comparison](portrait-1.jpg) · [Working head-shape customisation](customisation.jpg)

| Character | Four angles | Expressions / seat / hold | Walking / tea sipping |
| --- | --- | --- | --- |
| Johansson | [Views](review-0.jpg) | [Performance](performance-0.jpg) | [Motion](motion-0.gif) |
| Thuan | [Views](review-1.jpg) | [Performance](performance-1.jpg) | [Motion](motion-1.gif) |
| Tetsu | [Views](review-2.jpg) | [Performance](performance-2.jpg) | [Motion](motion-2.gif) |
| Grandmother Higa | [Views](review-3.jpg) | [Performance](performance-3.jpg) | [Motion](motion-3.gif) |
| Mai | [Views](review-4.jpg) | [Performance](performance-4.jpg) | [Motion](motion-4.gif) |

[Temporal contact sheet](motion-contact.jpg), [phone review page](review-phone.png), [capture report](report.json). Software Chromium/SwiftShader; physical-device and owner playback acceptance remain outstanding.

Open `/avatar-creator/identity-review.html` locally. Choose head shape, cheeks, head size and eye drawing; the existing identity stays on the left. Three original island eye families are also available in the ordinary shared creator. The opt-in body style is not yet a saved appearance version. No cast rollout or publication readiness is claimed.

Reproduce: `node avatar-creator/tests/identity-review.browser.mjs`, then `python avatar-creator/tests/identity-sheets.py`. Set `CHROMIUM_PATH` as needed. The runner freezes baseline `9f7ccd4c` through git archive. Raw intermediates are not committed.

[Handover and release gates](../../HANDOVER-IDENTITY-PROTOTYPE-2026-10-22.md).
