/**
 * Selects one theme per browser visit before the page renders.
 * The choice follows same-origin navigation through sessionStorage, while the
 * last choice is retained only to prevent an immediate repeat next visit.
 */
(function () {
  "use strict";

  var THEME_KEY = "nj-theme";
  var VISIT_THEME_KEY = "nj-visit-theme-v1";
  var THEME_IDS = [
    "cobalt", "mossy", "cute", "colorgrid", "crimson", "inkcraft",
    "clarity", "horizon", "swift", "botanical", "popwave"
  ];

  function isValid(themeId) {
    return THEME_IDS.indexOf(themeId) !== -1;
  }

  function read(storage, key) {
    try { return storage.getItem(key); } catch (error) { return null; }
  }

  function write(storage, key, value) {
    try { storage.setItem(key, value); } catch (error) { /* preference storage is optional */ }
  }

  function randomIndex(length) {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        var value = new Uint32Array(1);
        window.crypto.getRandomValues(value);
        return value[0] % length;
      }
    } catch (error) { /* fall through to Math.random */ }
    return Math.floor(Math.random() * length);
  }

  function remember(themeId) {
    if (!isValid(themeId)) return;
    write(sessionStorage, VISIT_THEME_KEY, themeId);
    write(localStorage, THEME_KEY, themeId);
  }

  function getVisitTheme() {
    var activeTheme = read(sessionStorage, VISIT_THEME_KEY);
    if (isValid(activeTheme)) return activeTheme;

    var previousTheme = read(localStorage, THEME_KEY);
    var choices = THEME_IDS.filter(function (themeId) {
      return themeId !== previousTheme;
    });
    var selectedTheme = choices[randomIndex(choices.length)];
    remember(selectedTheme);
    return selectedTheme;
  }

  var selectedTheme = getVisitTheme();
  var pagePath = location.pathname;
  var usesFullTheme = pagePath === "/" || pagePath === "/index.html" ||
    pagePath === "/blog/" || pagePath === "/blog/index.html";
  if (usesFullTheme) document.documentElement.setAttribute("data-theme", selectedTheme);

  window.NJThemeVisit = {
    ids: THEME_IDS.slice(),
    get: getVisitTheme,
    remember: remember
  };
})();
