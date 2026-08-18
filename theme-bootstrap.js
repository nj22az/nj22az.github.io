/**
 * Selects a new theme whenever the homepage loads, before it renders.
 * Same-origin subpages inherit the latest choice instead of rerandomizing.
 */
(function () {
  "use strict";

  var THEME_KEY = "nj-theme";
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

  var selectedTheme = null;

  function remember(themeId) {
    if (!isValid(themeId)) return;
    selectedTheme = themeId;
    write(localStorage, THEME_KEY, themeId);
  }

  function chooseDifferentTheme(previousTheme) {
    var choices = THEME_IDS.filter(function (themeId) {
      return themeId !== previousTheme;
    });
    return choices[randomIndex(choices.length)];
  }

  function getPageTheme() {
    if (isValid(selectedTheme)) return selectedTheme;
    var previousTheme = read(localStorage, THEME_KEY);
    var pagePath = location.pathname;
    var isHomepage = pagePath === "/" || pagePath === "/index.html";

    selectedTheme = isHomepage || !isValid(previousTheme)
      ? chooseDifferentTheme(previousTheme)
      : previousTheme;
    remember(selectedTheme);
    return selectedTheme;
  }

  selectedTheme = getPageTheme();
  var pagePath = location.pathname;
  var usesFullTheme = pagePath === "/" || pagePath === "/index.html" ||
    pagePath === "/blog/" || pagePath === "/blog/index.html";
  if (usesFullTheme) document.documentElement.setAttribute("data-theme", selectedTheme);

  window.NJThemeVisit = {
    ids: THEME_IDS.slice(),
    get: getPageTheme,
    remember: remember
  };
})();
