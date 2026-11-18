# Website polish · 18 November 2026

The homepage, Animation Studio, Blog index and Hotels register now use the same navigation structure and heading typeface. The Office opens onto Tools & Learning and the Studio. Its new still was rendered from the live diorama's Quay camera, with the Minato Maru and waterfront visible. The existing resident arrival films and interactive harbour remain available, with the 3D scene still loaded on demand.

The Studio keeps its black background and sailor logo. Its three download cards show formats, ZIP sizes and separate preview and download controls. The preview gallery uses nine pages rendered from the public packs, three per product. The project images can also be enlarged. The public ZIPs are reused as published.

The work was built on main e696c800732fe0857c39cde7ac4e5834f6974e34 for review on development, starting at 22704852bdaa7b5954f01309ad71fac39664d820. Development also receives the three previously published download packs and their handover because its base predates that release. The development branch has separate work in progress. For a production release, apply the scoped website change to current main and verify Pages against that commit.

Reviewed development commit: [`6fb7522`](https://github.com/nj22az/nj22az.github.io/commit/6fb752212542c9ee89bde3b3d6b300785c2e7bff). GitHub Actions passed the [six-profile browser review](https://github.com/nj22az/nj22az.github.io/actions/runs/44263236507) and the [four-profile harbour review](https://github.com/nj22az/nj22az.github.io/actions/runs/44263236439) on that commit. The browser run includes screenshots.

Verification on the main-based candidate:

- Chromium Office review passed all six profiles at 1440, 1024, 768, 720, 390 and 320 CSS pixels, including a 200% zoom equivalent. Checked homepage navigation and preferences, Blog and Hotels navigation, project links, preview galleries, three byte-identical ZIP downloads, 44-pixel controls and viewport fit.
- Chromium harbour review passed all four profiles, including close/reopen, camera controls, reduced motion, deferred loading and a failed-asset fallback.
- The harbour controller, Blog feed and stamp builder, generated Hotels page, source syntax and ZIP integrity checks passed. The CV and cover letter sample PDFs use the public name placeholder.
- Browser tests use emulated viewports. A physical iPhone or iPad Safari test remains open.

The file-level licences are linked from [third-party notices](../THIRD_PARTY_NOTICES.md).

The production candidate also corrects the mobile selector that reserves room for the fixed header. The browser review checks that the first line of the homepage clears the header across all six profiles. Publication applies the scoped changes to the public site's `main`, which already includes the download packs.

## Studio porthole

The Studio introduction displays the original black sailor artwork on an ivory field with a brass ring and four fasteners. The phone layout gives the heading a full row and places the porthole beside the description. The frame is CSS around the original SVG.

The Chromium check at 320, 390, 768 and 1440 CSS pixels passed. It verified the round frame, the logo's original colours, the spacing beside the description, viewport fit and the Digital downloads link. The 390 and 1440 screenshots were reviewed. The production candidate is based on `ebb9b0ff884bd658f343f1c9f978ac4f3ab2c22f`.

## Studio detail pass

Studio projects and digital downloads share their section heading scale, divider spacing and card treatments. Each project uses the same primary button. The Chisum button sits with its description. File formats and ZIP sizes appear together above each product title, with their layout adapting to the card width.

Chromium verification covered 320, 390, 768, 820, 1024 and 1440 CSS pixels. Checks covered viewport fit, the porthole and original artwork, keyboard access to preview galleries, and the three published ZIP downloads. A physical Safari device was outside this review.
