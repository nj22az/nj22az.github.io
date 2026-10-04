import {peninsulaActive} from './town-mode.js';
import {BUS_STATION} from './bus-station.js';
import {FERRY_TERMINAL} from './ferry.js';

/**
 * How the town's commuters come and go. The island has no road out, so there it is the
 * ferry from the outer pier; the older layouts keep the Harbour Line bus. Everything that
 * walks people to "the stop" asks here which stop that is.
 */
export const transitStop=()=>peninsulaActive()?FERRY_TERMINAL:BUS_STATION;
export const awayPlace=()=>peninsulaActive()?'on the mainland':'away from the shopping district';
