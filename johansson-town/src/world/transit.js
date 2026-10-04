import {FERRY_TERMINAL} from './ferry.js';

/**
 * How the town's commuters come and go: the island has no road out, so it is the ferry
 * from the outer pier. Everything that walks people to "the stop" asks here.
 */
export const transitStop=()=>FERRY_TERMINAL;
export const awayPlace=()=>'on the mainland';
