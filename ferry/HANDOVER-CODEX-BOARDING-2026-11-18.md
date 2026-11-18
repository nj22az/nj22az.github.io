# Chisum boarding shortcuts · 18 November 2026

The Chisum page offers **Go to the bridge** and **Go to the stern ramp** below its title, with a note that the ramp can be lowered and raised. Selecting either shortcut enters the first-person view through the existing boarding and travel controls. The ramp shortcut opens the existing Raise, Stop and Lower controls. The direct links are `/ferry/?aboard=bridge` and `/ferry/?aboard=ramp`.

The change lives in `ferry/index.html`. Ordinary clicks reuse the model already loading or loaded on the page. The viewer script, ship model and operating logic are untouched. The shortcut script is inline so it is part of the page already included in the offline file list.

Chromium passed the keyboard shortcut while the model was loading and both direct links. The desktop browser entered the wheelhouse. The 390-pixel touch profile entered the stern ramp space, opened its controls, lowered the model ramp through 90 degrees and raised it again with the on-screen keys. Leaving first person brought the shortcuts back. Inline JavaScript syntax and `git diff --check` passed. These were targeted checks with the current model. The full model suite, offline mode and physical-device Safari were outside this check.

Review branch `codex/chisum-boarding-shortcuts` is based on published `main` at `9cb321f27662c9827b9163714eeeb66ae38b7e01`. The ferry publication process calls for owner approval before publishing.

## Publication

The owner approved publication. [Pull request #429](https://github.com/nj22az/nj22az.github.io/pull/429) was merged into `main` at [`e5fa149`](https://github.com/nj22az/nj22az.github.io/commit/e5fa149d2412b4374c1cbb25a6365ad9bb7e4318). [GitHub Pages deployed it successfully](https://github.com/nj22az/nj22az.github.io/actions/runs/44302924582). The public Chisum page and both boarding URLs returned the exact HTML reviewed in the pull request.
