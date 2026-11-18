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

## Office layout and footer

The homepage, Studio, Blog index and Hotels register share a compact footer with Office, Explore and Resources links, copyright and a Back to top control. About and Locations lead to the existing homepage sections. LinkedIn links to Nils Johansson's public professional profile. The site has no careers page.

The homepage brings Tools & Learning forward by shortening the opening, the Studio panel and the section spacing. The Studio uses a one-sentence introduction and brings Chisum and the downloads closer to the top. The Blog index uses the Office palette and places the harbour stamp beside its heading on wide screens. Hotels uses the shared spacing and footer through its existing stylesheet and script references. The individual apps and article pages retain their existing layouts.

The browser review covers all four pages, footer keyboard and touch targets, site navigation, the Office appearance preference, Studio previews and the three ZIP downloads. The comparison uses the public main baseline `7b26260ba99de5054d2dffe6f6be6eee73c6b22e`. Production and development updates use scoped commits. Browser checks use Chromium viewports, including a 200% zoom equivalent. Physical Safari remains unverified.

## Hotel reviews and stories

The Blog is the editorial landing page for hotel reviews and occasional stories. Latest, Hotel reviews and Other articles filter the shared chronological catalogue. The Office homepage uses the same entries. A review's Parking details link opens the matching record in the Hotels finder. The finder links to the editorial review where one exists.

The primary navigation treats the finder as part of Blog. Both pages use the same palette and a section navigation row for Reviews & stories and Hotel finder. The existing finder and article URLs are preserved. The finder receives the changes through its existing shared CSS and JavaScript, leaving the generated register and its data in the normal build workflow. The static Blog feed has links to the five registered reviews and the existing stories and engineering articles.

The browser review checks all six screen profiles, the review and article filters, the finder and Blog navigation, and the paid-parking Scandic Rosendahl round trip. It also checks the static Blog with JavaScript disabled. The catalogue test covers chronology, WordPress deduplication and links. This change is based on the published Office release `d8b0d1b07fe5629a9fa64e72f1de30aa514d73ea`. Physical Safari remains unverified.

## Journal layout continuity

The Blog and Hotel finder share the same navigation, masthead, Minato illustration and content width. The finder starts under that masthead with its own title, register count and tools. The tabs are present in the published HTML. The hotel page generator was updated and the register rebuilt from its existing 211 records.

The English journal articles use the shared Office header and footer, the journal navigation and a reading column. The compact Office wordmark keeps its surname with the given name on narrow screens. Browser checks measure the journal navigation and masthead on six profiles, follow a paid-parking record to its editorial article and verify the static tabs with JavaScript disabled. The register, stamp and catalogue checks cover the source templates. Physical Safari remains unverified. The production baseline is `14a99be2f15a15189685166140ca16ec3c79f7ac`.

## Engineering portfolio

The homepage leads with field service and commissioning, followed by About, a four-part engineering capability summary and four flagship Tools & Learning cards. The Studio follows as a showcase for WebGL, interface design and custom toolmaking. The harbour overlay is reserved for the scene and camera controls. Pocket Camera and the textbook remain in the project grid.

The homepage HTML includes its navigation, footer, biography, project cards, Field Notes preview and locations. JavaScript enhances that markup with filters, the maintenance preview, the menu and the existing harbour features. The homepage loads one generated CSS bundle while retaining the source modules. After changing a source module, run `python3 tools/office-home/build-css.py`. The homepage workflow checks the bundle for freshness.

Field Notes uses the published hotel records to describe parking, EV charging, receipts, registration and access. Badge wording stays tied to each report. The locations describe Nordic field-service work and the author's ties to Quảng Nam. The footer provides LinkedIn and GitHub actions. The production baseline is `e9936d0f1d249cd244afbb441542c02428f0087e`.
