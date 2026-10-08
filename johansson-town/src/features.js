/**
 * What the public game shows. The live site (GitHub Pages) updates with the town as it is built, but the decorator
 * (BUILD on the title screen, "Arrange furniture" at home, and the ?build town builder) is not finished: it stays off
 * online and on everywhere else (localhost, the studio's captures, tests).
 */
export const LIVE_HOSTS=Object.freeze(['nj22az.github.io','www.nj22az.github.io']);

/** True where the decorator may run: anywhere but the live site. */
export function decoratorEnabled(where=globalThis.location){
 const host=String(where?.hostname||'').toLowerCase();
 return !LIVE_HOSTS.includes(host);
}
