(function () {
  "use strict";

  var REVISION = "20260808";
  var NATURAL_COMMIT = "3d0acefd09c2e270928c52a844e5ed2345c8c74c";
  var NATURAL_ROOT = "https://raw.githubusercontent.com/nj22az/JDS_Documentation/" + NATURAL_COMMIT + "/projects/literary/EIC/manuscript-editorial/";
  var PART_INTRO = "https://raw.githubusercontent.com/nj22az/JDS_Documentation/aac1c3198e601cd680243c3944357e9cb46a7482/projects/literary/EIC/manuscript-live-canon/part-one-the-venture.md";
  var PAGES = {
    "part-one-the-venture": PART_INTRO,
    "01-1603-the-boy-who-signed": NATURAL_ROOT + "01-1603-the-boy-who-signed-natural-opening.md",
    "05-1635-last-orders": NATURAL_ROOT + "05-1635-last-orders-natural-revision.md"
  };
  var cache = {};
  var loading = {};
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
    source = source.replace(/^---\n[^]*?\n---\n+/, "");
    source = source.replace(/^#\s+.*\n+/, "");

    // The compiled reader already owns the page header and, where present, epigraph.
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

  function loadMarkup(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (loading[id]) return loading[id];

    loading[id] = fetch(PAGES[id], { cache: "no-store", mode: "cors" })
      .then(function (response) {
        if (!response.ok) throw new Error("Natural Book One source returned " + response.status + " for " + id);
        return response.text();
      })
      .then(function (text) {
        cache[id] = markdownToReaderBody(text);
        return cache[id];
      })
      .catch(function (error) {
        console.error("Natural Book One patch could not load:", error);
        return null;
      });

    return loading[id];
  }

  function install(id, markup) {
    if (!markup || routeId() !== id) return;

    var reader = document.querySelector("article.reader");
    var prose = reader && reader.querySelector(".prose");
    if (!prose || prose.dataset.naturalRevision === REVISION) return;

    // omnibus.js may already have paginated the compiled prose. Clearing the
    // prose removes those stale pages; its own observer then repaginates these
    // revised nodes using the existing responsive book layout.
    prose.innerHTML = markup;
    prose.dataset.naturalRevision = REVISION;
    reader.dataset.bookOneRevision = "natural-" + REVISION;
  }

  function apply() {
    scheduled = false;
    var id = routeId();
    if (!PAGES[id]) return;
    loadMarkup(id).then(function (markup) { install(id, markup); });
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
