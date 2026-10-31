# Pocket Camera icon UI — publication evidence

[PR #417](https://github.com/nj22az/nj22az.github.io/pull/417) is merged as
`51f071309f6b9e1dbd6977595004c6c60602a0ee`, with the same tree as tested head
`dd5997a775736f5990044ea9b2a210fc47a68211` (`dbb3294fdd61c30f8418d81834c9cb264e53a0d4`).
[Current handover](../../HANDOVER-UI-REVIEW-2026-10-31.md).

[Publication JSON](publication.json) records 143 Camera + 57 UI checks, 15 MCP units + 20 MCP acceptance checks,
zero audit findings, World guard/WebKit, and the bounded Linux state. The Pages build/deploy/report jobs in
[41184647837](https://github.com/nj22az/nj22az.github.io/actions/runs/41184647837) passed. At 08:30:29 UTC,
**44/44 checked HTTPS addresses** matched the merged bytes, including bare/fresh entry pages, versioned app/styles,
renderer, imported modules, album, worker, manifest and the adapter's matching import key.

| Evidence | Artifact | ZIP SHA-256 |
| --- | --- | --- |
| [Camera regression](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839653/artifacts/13036056531) | 13036056531 | `8b11b6cd7bc36871890e1d8072ab1de895a0d7bd3ae29c79149ffcd407566824` |
| [Eight-layout UI screenshots](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839653/artifacts/13035901182) | 13035901182 | `424ff5a0fdf663bedbb7f7e8f9c4de48250d3172e2e5f3f063e1b5e003916ec6` |
| [Real MCP previews/export](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839641/artifacts/13035204003) | 13035204003 | `927772b7eb2a95a2ee1d58d668316fc0230c152745b96042259401db92f623af` |

All three ZIP digests and archive integrity were checked after download. Actual phone/tablet/large-text screenshots,
combined Adjust/Paper, sticker save, MCP before/after previews and exported JPEG were visually inspected. An audited
screenshot/evidence package was prepared for the owner; the earlier generated screenshot edit is illustrative only.
The images are hosted Chromium/WebGL captures. Physical Safari/native Share and the owner's installed MCP client
remain unverified. At enlarged text/short heights some controls require vertical scrolling. No claim of a complete
accessibility or device-performance audit is made. The documentation follow-up preserves the tested runtime bytes.
