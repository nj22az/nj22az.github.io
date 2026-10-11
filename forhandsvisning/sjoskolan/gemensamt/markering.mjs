// Innehållsmarkering (se innehall/lib/text.py): X_{L} blir <sub>L</sub>, x^{2} blir <sup>2</sup>. Allt annat escapas.
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const markHtml = (t) => esc(t).replace(/([_^])\{([^{}]*)\}/g, (_, k, x) => (k === '_' ? `<sub>${x}</sub>` : `<sup>${x}</sup>`));
export const markText = (t) => String(t ?? '').replace(/[_^]\{([^{}]*)\}/g, '$1');
