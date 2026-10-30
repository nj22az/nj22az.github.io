# Minato surface rebuild - 30 October 2026

- `geometry-before.json`: original source and original scanner (45 reported pairs; includes an angular-projection false alarm).
- `geometry.json`: rebuilt complete game room, strict 2 mm / 0.0005 m2 scan, cold-store door shut and open; zero conflicts, zero invalid transforms.
- `artlist-provenance.json`: original Sango Quay print, generation and texture hash.
- `browser-limits.json`: actual browser failures before gameplay. They do not reproduce the owner's crash.

The refreshed architectural images and CAD are in `art/izakaya/compact/`. The Blender frames are not game screenshots.

Reproduce the geometry check from `johansson-town`:

```sh
node --max-old-space-size=6144 tools/audit-izakaya-room.mjs docs/qa/izakaya-rebuild-2026-10-30/geometry.json
node --test tests/izakaya-backbar.test.mjs tests/shared-dining-entry.test.mjs tests/izakaya-devices.test.mjs
```

See the dated handover for checks, exact implementation and review state, and outstanding physical-device validation.
