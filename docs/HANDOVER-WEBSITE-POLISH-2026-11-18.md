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

## Production release

The owner asked to implement the recommendations. The scoped design was published to `main` in [`ebb9b0ff`](https://github.com/nj22az/nj22az.github.io/commit/ebb9b0ff884bd658f343f1c9f978ac4f3ab2c22f). The release fixes a mobile selector so the fixed header clears the opening text, with a matching regression assertion. That fix is carried back to `development` in the commit recording this release.

[GitHub Pages deployed successfully](https://github.com/nj22az/nj22az.github.io/actions/runs/44265631045). Twelve public files matched the deployed commit, including the Office, Studio, Blog and Hotels HTML, the shared styles, the quay opening image and preview assets. The exact release candidate passed all six local Chromium profiles. The [production browser review](https://github.com/nj22az/nj22az.github.io/actions/runs/44265632031) and [production harbour review](https://github.com/nj22az/nj22az.github.io/actions/runs/44265632074) carry the hosted run results. The three public ZIPs are the same releases verified by the preview and download tests.

## Studio porthole

The owner requested the original black sailor logo in a round porthole. The [published update](https://github.com/nj22az/nj22az.github.io/commit/5d0aa74a68c1a19dc8081504f709d251a8ee469a) adds a brass rim and an ivory face in the Studio intro. On phones the title has a full row, with the porthole beside the description. The original SVG is used directly.

Local Chromium passed at 320, 390, 768 and 1440 CSS pixels. The 390 and 1440 layouts were visually checked. [GitHub Pages deployed successfully](https://github.com/nj22az/nj22az.github.io/actions/runs/44268720139), and the live Studio HTML and CSS both matched the commit. No physical device was used for testing.

## Studio detail pass

Studio projects and digital downloads share their section heading scale, divider spacing and card treatments. Each project uses the same primary button. The Chisum button sits with its description. File formats and ZIP sizes appear together above each product title, with their layout adapting to the card width.

Chromium verification covered 320, 390, 768, 820, 1024 and 1440 CSS pixels. Checks covered viewport fit, the porthole and original artwork, keyboard access to preview galleries, and the three published ZIP downloads. A physical Safari device was outside this review.

The changes went live on `main` in [`7b26260`](https://github.com/nj22az/nj22az.github.io/commit/7b26260ba99de5054d2dffe6f6be6eee73c6b22e). The public Studio HTML and CSS matched that commit byte-for-byte. The same Studio files are carried into `development` with this release record.

## Office layout and footer

The homepage, Studio, Blog index and Hotels register share a compact footer with Office, Explore and Resources links, copyright and a Back to top control. About and Locations lead to the existing homepage sections. LinkedIn links to Nils Johansson's public professional profile. The site has no careers page.

The homepage brings Tools & Learning forward by shortening the opening, the Studio panel and the section spacing. The Studio uses a one-sentence introduction and brings Chisum and the downloads closer to the top. The Blog index uses the Office palette and places the harbour stamp beside its heading on wide screens. Hotels uses the shared spacing and footer through its existing stylesheet and script references. The individual apps and article pages retain their existing layouts.

The browser review covers all four pages, footer keyboard and touch targets, site navigation, the Office appearance preference, Studio previews and the three ZIP downloads. The comparison uses the public main baseline `7b26260ba99de5054d2dffe6f6be6eee73c6b22e`. Production and development updates use scoped commits. Browser checks use Chromium viewports, including a 200% zoom equivalent. Physical Safari remains unverified.

[Production release `d8b0d1b`](https://github.com/nj22az/nj22az.github.io/commit/d8b0d1b07fe5629a9fa64e72f1de30aa514d73ea) is live. Seven served HTML, CSS and JavaScript files matched the release blobs. The Hotels HTML was verified against its tracked source and loads the verified shared assets. All six local Chromium profiles passed. At 390 CSS pixels, Tools & Learning and the first Studio project moved up by 74 and 86 pixels respectively. The Office and Studio footer routes to About and Digital downloads were followed in the browser.
