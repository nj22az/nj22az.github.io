# East lawn Japanese garden

A small garden cluster on the peninsula's east lawn, east of the harbour park mound.

Module: `johansson-town/src/world/east-garden.js`

Taken from [orlandocarnate/japanese_garden](https://github.com/orlandocarnate/japanese_garden): the water-wave and firefly shader approach (Three.js Journey Perlin elevation + additive points). The full baked GLB is not loaded — it is a self-contained Chicago garden and would fight the 1988 harbour scale, the cel pass, and the streamed park.

What stands on the lawn:

- a stone-rimmed pond at `x=28.15, z=-6.4` (east of the mound, not on it)
- two stone lanterns and a tsukubai basin
- fireflies after 18:30 (town minutes >= 1110) until 06:00

Collision stays walkable around the cluster. Credit remains with Orlando Carnate for the shader idea.

## Wire it in

`east-lawn.js`:

```js
import {buildEastGarden} from './east-garden.js';
// inside buildEastLawn, after the seawall look marker:
const garden=buildEastGarden({parent:group,colliders,shadows,heightAt,register,onAction});
return {group,lawn,shore,shrubs,garden,useParkGreenery,tick:garden.tick};
```

`town.js` `world.update`:

```js
world.eastLawn?.tick?.(time,minutes);
```
