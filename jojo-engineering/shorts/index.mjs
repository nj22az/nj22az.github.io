// All shorts in publishing order.
import rms325v from './episodes/rms-325v.mjs';
import ampJack from './episodes/amp-jack.mjs';
import doubleCurrent from './episodes/double-current.mjs';
import insulationAlarm from './episodes/insulation-alarm.mjs';
import testBeforeTouch from './episodes/test-before-touch.mjs';
import rootThree from './episodes/root-three.mjs';
import latchingCircuit from './episodes/latching-circuit.mjs';
import kvaVsKw from './episodes/kva-vs-kw.mjs';
import kirchhoff from './episodes/kirchhoff.mjs';
import fiftySixtyHz from './episodes/fifty-sixty-hz.mjs';

export const SHORTS = [rms325v, ampJack, doubleCurrent, insulationAlarm, testBeforeTouch, rootThree, latchingCircuit, kvaVsKw, kirchhoff, fiftySixtyHz];
export const IDS = SHORTS.map((s) => s.id);
