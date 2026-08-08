(function () {
  "use strict";

  var CHAPTER_ONE_ID = "01-1603-the-boy-who-signed";
  var SOURCE = "https://raw.githubusercontent.com/nj22az/JDS_Documentation/3d0acefd09c2e270928c52a844e5ed2345c8c74c/projects/literary/EIC/manuscript-editorial/01-1603-the-boy-who-signed-natural-opening.md";
  var cachedMarkup = null;
  var loading = null;
  var scheduled = false;
  var observer;

  function routeId() {
    var match = window.location.hash.match(/#\/read\/([^/?]+)/);
    return match ? match[1] : "";
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inlineMarkup(text) {
    var out = escapeHtml(text);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
    out = out.replace(/`(.+?)`/g, "<code>$1</code>");
    return out;
  }

  function headingId(text) {
    return text
      .replace(/[\*_`]/g, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function markdownToReaderBody(source) {
    source = source.replace(/\r\n/g, "\n");
    source = source.replace(/<!--[^]*?-->\s*/g, "");
    source = source.replace(/\bMaria de Sousa\b/g, "Maria Mori");
    source = source.replace(/^#\s+.*\n+/, "");

    // The reader already renders the chapter epigraph in its header.
    if (source.trimStart().charAt(0) === ">") {
      source = source.trimStart().replace(/^(?:>.*(?:\n|$))+\s*/, "");
    }

    var blocks = source.trim().split(/\n\s*\n/);
    var html = [];

    blocks.forEach(function (raw) {
      var block = raw.trim();
      if (!block) return;

      if (block === "***" || block === "---") {
        html.push('<hr class="scene">');
        return;
      }

      var heading = block.match(/^(#{2,5})\s+(.+)$/);
      if (heading) {
        var level = heading[1].length;
        html.push("<h" + level + ' id="' + headingId(heading[2]) + '">' + inlineMarkup(heading[2]) + "</h" + level + ">");
        return;
      }

      if (block.split("\n").every(function (line) { return line.charAt(0) === ">"; })) {
        var quote = block.split("\n").map(function (line) { return line.replace(/^>\s?/, ""); }).join("\n");
        html.push("<blockquote><p>" + inlineMarkup(quote) + "</p></blockquote>");
        return;
      }

      var paragraph = block.split("\n").map(function (line) { return line.trim(); }).join("\n");
      html.push("<p>" + inlineMarkup(paragraph) + "</p>");
    });

    return html.join("\n");
  }

  function loadMarkup() {
    if (cachedMarkup) return Promise.resolve(cachedMarkup);
    if (loading) return loading;

    loading = fetch(SOURCE, { cache: "no-store", mode: "cors" })
      .then(function (response) {
        if (!response.ok) throw new Error("Natural Chapter One source returned " + response.status);
        return response.text();
      })
      .then(function (text) {
        cachedMarkup = markdownToReaderBody(text);
        return cachedMarkup;
      })
      .catch(function (error) {
        console.error("Natural Chapter One patch could not load:", error);
        return null;
      });

    return loading;
  }

  function install(markup) {
    if (!markup || routeId() !== CHAPTER_ONE_ID) return;

    var reader = document.querySelector("article.reader");
    var prose = reader && reader.querySelector(".prose");
    if (!prose || prose.dataset.naturalRevision === "20260808") return;

    // Existing book layout moves prose nodes into .book-spreads. Replacing the
    // prose body here deliberately removes those old pages. omnibus.js observes
    // the mutation and builds fresh pages from the natural-revision nodes.
    prose.innerHTML = markup;
    prose.dataset.naturalRevision = "20260808";
    reader.dataset.bookOneRevision = "natural-20260808";
  }

  function apply() {
    scheduled = false;
    if (routeId() !== CHAPTER_ONE_ID) return;
    loadMarkup().then(install);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(apply);
  }

  observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("hashchange", schedule);
  window.addEventListener("DOMContentLoaded", schedule);
  schedule();
})();
