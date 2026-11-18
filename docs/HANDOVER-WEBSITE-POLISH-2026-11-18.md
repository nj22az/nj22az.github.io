# Website polish · 18 November 2026

The homepage, Animation Studio, Blog index and Hotels register now use the same navigation structure and heading typeface. The Office opens onto Tools & Learning and the Studio. Its new still was rendered from the live diorama's Quay camera, with the Minato Maru and waterfront visible. The existing resident arrival films and interactive harbour remain available, with the 3D scene still loaded on demand.

The Studio keeps its black background and sailor logo. Its three download cards show formats, ZIP sizes and separate preview and download controls. The preview gallery uses nine pages rendered from the public packs, three per product. The project images can also be enlarged. The public ZIPs are reused as published.

The work was built on main e696c800732fe0857c39cde7ac4e5834f6974e34 for review on development, starting at 22704852bdaa7b5954f01309ad71fac39664d820. Development also receives the three previously published download packs and their handover because its base predates that release. The development branch has separate work in progress. For a production release, apply the scoped website change to current main and verify Pages against that commit.

Verification on the main-based candidate:

- Chromium Office review passed all six profiles at 1440, 1024, 768, 720, 390 and 320 CSS pixels, including a 200% zoom equivalent. Checked homepage navigation and preferences, Blog and Hotels navigation, project links, preview galleries, three byte-identical ZIP downloads, 44-pixel controls and viewport fit.
- Chromium harbour review passed all four profiles, including close/reopen, camera controls, reduced motion, deferred loading and a failed-asset fallback.
- The harbour controller, Blog feed and stamp builder, generated Hotels page, source syntax and ZIP integrity checks passed. The CV and cover letter sample PDFs use the public name placeholder.
- Browser tests use emulated viewports. A physical iPhone or iPad Safari test remains open.

The file-level licences are linked from [third-party notices](../THIRD_PARTY_NOTICES.md).
