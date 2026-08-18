/**
 * Carries the portfolio appearance preference into same-origin project pages.
 * Individual apps keep their own controls and behavior; this bridge supplies
 * the shared palette through CSS custom properties.
 */
(function () {
  "use strict";

  var THEME_KEY = "nj-theme";
  var VISIT_THEME_KEY = "nj-visit-theme-v1";
  var THEMES = {
    cobalt:   ["#343ec9", "#2833ad", "rgba(52,62,201,.12)", "#ffffff", "#ffffff", "#f5f5f8", "#20275f", "#5d6494", "rgba(52,62,201,.22)", "#3affff"],
    mossy:    ["#06a947", "#058c3c", "rgba(6,199,85,.12)", "#ffffff", "#ffffff", "#f5faf7", "#111814", "#5d6861", "rgba(17,24,20,.14)", "#06c755"],
    cute:     ["#3c98aa", "#2d7f8f", "rgba(139,208,221,.2)", "#ffffff", "#ffffff", "#f8f3fa", "#55545d", "#817f89", "rgba(139,208,221,.32)", "#e383a8"],
    colorgrid:["#267fa8", "#1f6b8d", "rgba(93,173,209,.16)", "#ffffff", "#ffffff", "#eef3f4", "#272b2d", "#6f7679", "rgba(49,49,49,.18)", "#3eb088"],
    crimson:  ["#d9001b", "#b80017", "rgba(240,0,0,.1)", "#faf9f5", "#ffffff", "#f7f3ef", "#312c2d", "#746d6e", "rgba(240,0,0,.2)", "#f00000"],
    inkcraft: ["#002f9e", "#001e6f", "rgba(0,47,158,.12)", "#f6f7f9", "#ffffff", "#e9edf1", "#101827", "#5d6470", "rgba(0,47,158,.2)", "#4b78d1"],
    clarity:  ["#333333", "#1a1a1a", "rgba(51,51,51,.1)", "#f2f2f2", "#ffffff", "#e8e8e8", "#1a1a1a", "#666666", "rgba(51,51,51,.2)", "#777777"],
    horizon:  ["#0065bd", "#00529a", "rgba(0,101,189,.11)", "#f3f5fa", "#ffffff", "#e8eef6", "#252d33", "#69747d", "rgba(0,101,189,.2)", "#37b1de"],
    swift:    ["#006bd6", "#0055ad", "rgba(0,122,255,.12)", "#fffbe8", "#ffffff", "#fff3ad", "#212121", "#666050", "rgba(33,33,33,.2)", "#ffd700"],
    botanical:["#7a6500", "#5f4f00", "rgba(255,213,0,.2)", "#fafaef", "#ffffff", "#f0f0e2", "#272727", "#69695f", "rgba(39,39,39,.18)", "#ffd500"],
    popwave:  ["#f2157f", "#d80f70", "rgba(242,21,127,.12)", "#ffffff", "#ffffff", "#f3f3f3", "#70133e", "#87546a", "rgba(242,21,127,.24)", "#f2157f"]
  };

  function getVisitTheme() {
    if (window.NJThemeVisit) return window.NJThemeVisit.get();

    var visitTheme = sessionStorage.getItem(VISIT_THEME_KEY);
    if (THEMES[visitTheme]) return visitTheme;

    var previousTheme = localStorage.getItem(THEME_KEY);
    var choices = Object.keys(THEMES).filter(function (themeId) {
      return themeId !== previousTheme;
    });
    var selectedTheme = choices[Math.floor(Math.random() * choices.length)];
    sessionStorage.setItem(VISIT_THEME_KEY, selectedTheme);
    localStorage.setItem(THEME_KEY, selectedTheme);
    return selectedTheme;
  }

  function applySiteTheme(themeId) {
    var id = THEMES[themeId] ? themeId : "cobalt";
    var values = THEMES[id];
    var root = document.documentElement;
    var path = location.pathname;

    root.setAttribute("data-site-theme", id);
    root.classList.add("site-themed-subpage");
    root.classList.toggle("site-theme-studio", path.indexOf("/form-3d-studio/") === 0);
    root.classList.toggle("site-theme-reader", path.indexOf("/the-front-row-seat/") === 0);
    root.classList.toggle("site-theme-pelican", path.indexOf("/the-front-row-seat/pelican/") === 0);
    root.classList.toggle("site-theme-motion", path.indexOf("/the-front-row-seat/1888-motion-graphic-novel/") === 0);
    root.classList.toggle("site-theme-engineering", path.indexOf("/engineering-blog/") === 0);
    root.classList.toggle("site-theme-shop", path.indexOf("/shop/") === 0);

    ["accent", "accent-hover", "accent-soft", "bg", "surface", "surface-2", "text", "muted", "border", "highlight"].forEach(function (name, index) {
      root.style.setProperty("--site-theme-" + name, values[index]);
    });

    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute("content", values[3]);
    });
  }

  applySiteTheme(getVisitTheme());
})();
