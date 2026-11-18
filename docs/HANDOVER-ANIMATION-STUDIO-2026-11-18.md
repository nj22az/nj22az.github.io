# Animation Studio section · 18 November 2026

The homepage put Chisum and Johansson World in the same grid as utilities and teaching material. Sakura Shōten appeared as a secondary World action. The live `/world/` and `/sakura/` entries are redirects to destinations in the separate World repository.

The new `/animation-studio/` landing page groups all three projects. It uses the approved vector sailor logo and existing project imagery. The homepage gives it a top navigation link and a dedicated introduction before Tools and learning. The project game URLs and old aliases keep their existing behavior. The sitemap now points directly to the canonical World and Sakura pages.

The changes were designed on `main` at `5285a7a4f5936c90380d8b5599f472057ecf6d76`. Apply this commit alone when preparing a release. The `development` parent `f7a2d5551a8633ef2f22ebd50958545dd99b020c` has independent ferry, camera and dock preview work and is not a release candidate as a whole.

Live HTTP checks returned 200 for Chisum, World, the Town game, Sakura and the Sakura browser demo. The World page contains the `downloads` anchor. The office review now verifies the studio route from the homepage, the three cards, six destination links, image loading, viewport fit and minimum target heights. Local Chromium startup was blocked by the workspace's socket restrictions. The GitHub browser review checks the complete layout on six profiles when run. No physical-device test was performed.

Next action: confirm the development review, then seek publication approval and apply only the studio change to the current `main`. Verify that GitHub Pages serves the homepage link, the studio landing page and the project links.
