import {FERRY_TERMINAL} from './ferry.js';

/**
 * How the town's commuters come and go. The island has no road out, so there it is the
 * ferry from the outer pier; the older layouts keep the Harbour Line bus. Everything that
 * walks people to "the stop" asks here which stop that is.
 */
export const transitStop=()=>FERRY_TERMINAL;
export const awayPlace=()=>'on the mainland';
