(function () {
  "use strict";

  var REVISION = "20260808-south-land";
  var NATURAL_COMMIT = "3d0acefd09c2e270928c52a844e5ed2345c8c74c";
  var NATURAL_ROOT = "https://raw.githubusercontent.com/nj22az/JDS_Documentation/" + NATURAL_COMMIT + "/projects/literary/EIC/manuscript-editorial/";
  var PART_INTRO = "https://raw.githubusercontent.com/nj22az/JDS_Documentation/aac1c3198e601cd680243c3944357e9cb46a7482/projects/literary/EIC/manuscript-live-canon/part-one-the-venture.md";
  var PAGES = {
    "part-one-the-venture": PART_INTRO,
    "01-1603-the-boy-who-signed": NATURAL_ROOT + "01-1603-the-boy-who-signed-natural-opening.md",
    "02-1626-the-man-who-came-back-wrong": NATURAL_ROOT + "02-1626-the-man-who-came-back-wrong-natural-revision.md",
    "04-1629-the-south-land": NATURAL_ROOT + "04-1629-the-south-land-natural-revision.md",
    "05-1635-last-orders": NATURAL_ROOT + "05-1635-last-orders-natural-revision.md"
  };
  var cache = {};
  var loading = {};
  var scheduled = false;
  var observer;

  var DROP_PARAGRAPHS = [
    "The counter-ledger does not pretend to the Company's exactness. The Company's book can give the month, wage and deduction while losing the person entire. Maggie's wood keeps the opposite truth: somebody sat here, ate, feared and did not come back. When memory can supply the name, the room says it. When memory fails, the cut does not acquire a convenient one.",
    "An honest blank is still an entry.",
    "The room begins keeping things that are not inside the fault. A stool can be an entry. So can a name said properly. So can the dark shape in the grain of the centre table, scrubbed so often that only the person doing the scrubbing knows where to look.",
    "Paper is not the only material that can hold an account.",
    "That is fortunate. Paper belongs too easily to the man with the locked room.",
    "The Company would call this enlargement. More room, more custom, better return from the same house.",
    "Tom hears his own voice and his father's inside it. Beneath both, Maggie: do not call the taking a rescue. Beneath Maggie, Bell asking one quiet question across an unsigned page. Beneath Bell, a woman behind a door who has no English word available and a room deciding what her silence means.",
    "Paper order is not justice. It is the only correction available in the room.",
    "A deck, it turns out, has better manners than a court.",
    "The man is the message. She has sent the room back one of its debts.",
    "One long look. Not love. Recognition."
  ];

  var REPLACE_PARAGRAPHS = [
    {
      from: "Maggie is not collecting evidence for Tom's acquittal. That is what paid-off men think at first.",
      to: "Paid-off men sometimes mistake her questions for a request to defend him."
    },
    {
      from: "There is a room in London that reads accounts truly, she says. I have carried that fact twenty-two years. It is the most valuable thing I own, and I am spending it once. A tavern on Wapping Wall. The Pelican. When England lets him ashore, take him through that door and give him to the keeper.",
      to: "There is a keeper in Wapping who kept Bell's page when carrying it would have killed me, she says. A tavern on Wapping Wall. The Pelican. If she is still there, take him to her."
    }
  ];

  function routeId() {
    var match = window.location.hash.match(/#\/read\/([^/?]+)/);
    return match ? match[1] : "";
  }

  function isBookOneRoute(id) {
    var ids = window.FRONT_ROW_OMNIBUS && window.FRONT_ROW_OMNIBUS.readerBookIds && window.FRONT_ROW_OMNIBUS.readerBookIds[0];
    return id === "part-one-the-venture" || !!(ids && ids.indexOf(id) !== -1);
  }

  function compactText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function patchSouthLandHeader(reader, id) {
    if (!reader || id !== "04-1629-the-south-land") return;

    var walker = document.createTreeWalker(reader, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue
        .replace("A rope is an English mercy, Commander.", "They hired him after I warned them.")
        .replace("Maria de Sousa, the Abrolhos, 1629", "Maria Mori")
        .replace(/\bMaria de Sousa\b/g, "Maria Mori");
    }
  }

  function scrubLegacyProse(id) {
    if (!isBookOneRoute(id)) return;

    var reader = document.querySelector("article.reader");
    var prose = reader && reader.querySelector(".prose");
    if (!reader || !prose) return;

    patchSouthLandHeader(reader, id);

    var scrubKey = id + ":" + REVISION;
    if (reader.dataset.naturalScrub === scrubKey) return;

    var walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue
        .replace(/\bMaria de Sousa\b/g, "Maria Mori")
        .replace(/\bMara\b/g, "Maria");
    }

    prose.querySelectorAll("p").forEach(function (paragraph) {
      var text = compactText(paragraph.textContent);

      if (DROP_PARAGRAPHS.indexOf(text) !== -1) {
        paragraph.remove();
        return;
      }

      if (text.indexOf("A cut would have been the verdict.") !== -1) {
        paragraph.innerHTML = paragraph.innerHTML.replace(
          "A cut would have been the verdict.",
          "A cut would have meant Maggie had stopped honestly expecting him back."
        );
      }

      if (text.indexOf("Maggie calls it six more men she can feed before somebody asks them to sign.") !== -1) {
        paragraph.innerHTML = paragraph.innerHTML.replace(
          "Maggie calls it six more men she can feed before somebody asks them to sign.",
          "The new length gives Maggie room to feed six more men when the house is full."
        );
      }

      REPLACE_PARAGRAPHS.forEach(function (change) {
        if (compactText(paragraph.textContent) === change.from) paragraph.textContent = change.to;
      });
    });

    reader.dataset.naturalScrub = scrubKey;
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
    source = source.replace(/\bMara\b/g, "Maria");
    source = source.replace(/^---\n[^]*?\n---\n+/, "");
    source = source.replace(/^#\s+.*\n+/, "");

    if (source.trimStart().charAt(0) === ">") {
      source = source.trimStart().replace(/^(?:>.*(?:\n|$))+\s*/, "");
    }

    var blocks = source.trim().split(/\n\s*\n/);
    var html = [];

    blocks.forEach(function (raw) {
      var block = raw.trim();
      if (!block) return;

      if (block === "***" || block === "---" || block === "* * *") {
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

    prose.innerHTML = markup;
    prose.dataset.naturalRevision = REVISION;
    reader.dataset.bookOneRevision = "natural-" + REVISION;
    delete reader.dataset.naturalScrub;
    patchSouthLandHeader(reader, id);
    scrubLegacyProse(id);
  }

  function apply() {
    scheduled = false;
    var id = routeId();
    scrubLegacyProse(id);
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
