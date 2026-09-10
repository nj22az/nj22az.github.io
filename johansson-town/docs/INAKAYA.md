# Inakaya and the crystal-room neighbour

The supplied Inakaya model replaces the active corridor's ramen exterior. Its
right-hand restaurant door retains Sato Ramen's playable interior and purchases;
the adjoining timber building opens into the crystal room. StepWise returns to
its measurement workshop interior. The town map and directory register the
neighbour as The Timber House, leaving the interior as a surprise.

Both doors face the east lane. Exit points are (24.65, 14.7) and (21.2, 14.7).
Source foreground paving, poles and crossing wires were removed to keep the lane
clear. The facade solids, approach paving and transitions were updated together.
The source's original branding remains part of its textures.

The new exterior is 8,511,072 bytes versus 20,465,048 supplied (58.4% smaller),
with six mesh primitives and 94,129 triangles. Textures are capped at 2048 for
base colour and 1024 for the other maps, with the transparent atlas retained.
The original playable ramen interior now loads on entry, like the crystal room.
The input model is unchanged. Reproduction and credit are in assets/ATTRIBUTION.md.

Validation: production build passed. Nine focused tests passed, including the
CPU game startup, entry/exit for every registered interior, door approaches,
crystal-room interaction reachability, retry/caching and asset integrity. The
boot test was updated for the existing separate Sakura facade, current clerk
position and Yuri bedroom entry facing. No browser or iPad rendering/performance
claim is made. The broader suite has three existing failing tests (legacy full
supplied overworld, harbour-block shop count and Japanese-town shop count),
reproduced on the unchanged ad0f893 baseline.
