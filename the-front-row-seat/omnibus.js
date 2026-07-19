(function () {
  "use strict";

  var books = [
    {
      numeral: "I",
      word: "One",
      title: "The Venture",
      years: "1603–1635",
      id: "part-one-the-venture",
      words: 31523
    },
    {
      numeral: "II",
      word: "Two",
      title: "The Gallows Years",
      years: "1696–1701",
      id: "part-two-the-gallows-years",
      words: 5767
    },
    {
      numeral: "III",
      word: "Three",
      title: "Kings of Bengal",
      years: "1757–1790",
      id: "part-three-kings-of-bengal",
      words: 13579
    },
    {
      numeral: "IV",
      word: "Four",
      title: "The Poppy",
      years: "1839–1880",
      id: "part-four-the-poppy",
      words: 8589
    },
    {
      numeral: "V",
      word: "Five",
      title: "The Watchman’s Daughter",
      years: "1888–1892",
      id: "12-1888-the-watchmans-daughter",
      words: 13194,
      status: "Standalone expansion in progress"
    },
    {
      numeral: "VI",
      word: "Six",
      title: "The Engine Room",
      years: "1940–2019",
      id: "part-five-the-engine-room",
      words: 8903
    }
  ];

  var bookById = {};
  books.forEach(function (book) {
    bookById[book.id] = book;
  });

  var readingSpeed = 250;
  function formatNumber(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function displayWords(value) {
    return formatNumber(value < 100 ? value : Math.round(value / 100) * 100);
  }

  function readingMinutes(words) {
    return Math.max(1, Math.round(words / readingSpeed));
  }

  function displayReadingTime(minutes) {
    if (minutes < 60) return minutes + " min";
    var hours = Math.floor(minutes / 60);
    var remainder = minutes % 60;
    return hours + " hr" + (remainder ? " " + remainder + " min" : "");
  }

  var readerBookIds = [
    ["part-one-the-venture", "01-1603-the-boy-who-signed", "02-1603-dutch-courage", "06-1603-the-soot-and-the-roof", "03-1612-the-return", "02-1626-the-man-who-came-back-wrong", "04-1629-the-south-land", "05-1635-last-orders"],
    ["part-two-the-gallows-years", "03-1696-the-price-of-a-man", "04-1701-good-for-business"],
    ["part-three-kings-of-bengal", "05-1757-a-soldiers-arithmetic", "06-1770-what-mulvey-saw", "07-1774-too-big-to-sink", "08-1790-forty-seven-days"],
    ["part-four-the-poppy", "09-1839-what-pemberton-called-trade", "10-1858-what-harding-would-not-say", "11-1880-the-hell-ship"],
    ["12-1888-the-watchmans-daughter"],
    ["part-five-the-engine-room", "13-1940-a-wardens-watch", "14-2019-what-the-suit-didnt-see", "part-six-afterlives"]
  ];

  var chapterWords = {
    "01-1603-the-boy-who-signed": 4997,
    "02-1603-dutch-courage": 5274,
    "03-1612-the-return": 4202,
    "02-1626-the-man-who-came-back-wrong": 6814,
    "04-1629-the-south-land": 5330,
    "05-1635-last-orders": 2731,
    "03-1696-the-price-of-a-man": 3124,
    "04-1701-good-for-business": 2615,
    "05-1757-a-soldiers-arithmetic": 3592,
    "06-1770-what-mulvey-saw": 2703,
    "07-1774-too-big-to-sink": 4221,
    "08-1790-forty-seven-days": 2991,
    "09-1839-what-pemberton-called-trade": 3215,
    "10-1858-what-harding-would-not-say": 3223,
    "11-1880-the-hell-ship": 2097,
    "12-1888-the-watchmans-daughter": 13137,
    "13-1940-a-wardens-watch": 5516,
    "part-six-afterlives": 53,
    "14-2019-what-the-suit-didnt-see": 3299
  };

  var readerBookById = {};
  readerBookIds.forEach(function (ids, index) {
    ids.forEach(function (id) {
      readerBookById[id] = books[index];
    });
  });

  var chapterTaglines = {
    "01-1603-the-boy-who-signed": "A murderer asks the room for a rope; the room saves Mara, names Bell — and lets the killer leave.",
    "02-1603-dutch-courage": "The Dragon's lads come home loud, a Dutchman prices the paper, and a thimble is left on the bar.",
    "06-1603-the-soot-and-the-roof": "The escape the tavern never saw: bare feet on wet tiles, and a Dutchman who leaves the choice to her.",
    "03-1612-the-return": "Nine years of the Company come home in a boatswain's coat, and Maggie prices what Tom has become.",
    "02-1626-the-man-who-came-back-wrong": "The one man Amboyna sent home, the wife who lets him be new — and a wager kept for twenty-three years.",
    "04-1629-the-south-land": "Mara finds Rook in a ledger, and makes the Company read the warning it ignored.",
    "05-1635-last-orders": "Tom pays off a last ship, and the pie arrives before the news.",
    "03-1696-the-price-of-a-man": "The month six substitutes hang, a widow declines to sell her quiet lodger.",
    "04-1701-good-for-business": "Kidd hangs twice at low tide; a young writer learns which ledger is never shown.",
    "05-1757-a-soldiers-arithmetic": "Plassey was bought before it was fought. Sergeant Coates goes on record anyway.",
    "06-1770-what-mulvey-saw": "The drought was God's. The famine was the Company's. Mulvey saw the difference.",
    "07-1774-too-big-to-sink": "A tallyman counts the bailout tea out to Boston, and writes one honest warning.",
    "08-1790-forty-seven-days": "Davy Munro is on the list of the loyal, but not on the list of the saved.",
    "09-1839-what-pemberton-called-trade": "Mei hears the word Lintin and understands what Pemberton's trade cost her.",
    "10-1858-what-harding-would-not-say": "A medal is offered if the Cawnpore story holds. Harding repeats the true number.",
    "11-1880-the-hell-ship": "A mate kills a seaman, a captain helps him run, and a witness weighs the telling.",
    "12-1888-the-watchmans-daughter": "Su Zhang, four rules, and the autumn all of Whitechapel walks home counting footsteps.",
    "13-1940-a-wardens-watch": "Twenty-nine thousand bombs in one ledger, and a son inside the fires it counts.",
    "14-2019-what-the-suit-didnt-see": "Albion Reach buys the debt. Hannah decides who owns the meaning."
  };

  function addTagline(link, id) {
    var text = chapterTaglines[id];
    if (!text) return;
    var copy = link.querySelector(".toc-copy") || link;
    if (copy.querySelector(".toc-desc")) return;
    var desc = document.createElement("span");
    desc.className = "toc-desc";
    desc.textContent = text;
    copy.appendChild(desc);
  }

  function routeId() {
    var match = window.location.hash.match(/#\/read\/([^/?]+)/);
    return match ? match[1] : "";
  }

  function linkId(link) {
    var href = link.getAttribute("href") || "";
    var match = href.match(/#\/read\/([^/?]+)/);
    return match ? match[1] : "";
  }

  function updateCover(contents) {
    var cover = contents.querySelector(".cover");
    if (!cover) return;

    var kicker = cover.querySelector(".cover-kicker");
    var subtitle = cover.querySelector(".cover-sub");
    var startButton = cover.querySelector(".btn-primary");

    if (kicker) kicker.textContent = "Six books · 1603–2019";
    if (subtitle) subtitle.textContent = "Five centuries of the East India Company, observed from one Thames-side tavern.";
    if (startButton) startButton.textContent = "Begin with Book One";
  }

  function addBookStats(link, book) {
    var copy = link.querySelector(".toc-copy") || link;
    if (copy.querySelector(".toc-book-stats")) return;

    var stats = document.createElement("span");
    stats.className = "toc-book-stats";
    stats.title = "Estimated at " + readingSpeed + " words per minute";
    stats.innerHTML =
      "<span>" + displayWords(book.words) + " words</span>" +
      "<span aria-hidden=\"true\">·</span>" +
      "<span>≈ " + displayReadingTime(readingMinutes(book.words)) + "</span>";
    copy.appendChild(stats);
  }

  function addChapterStats(link, id) {
    var words = chapterWords[id];
    if (!words) return;

    var copy = link.querySelector(".toc-copy") || link;
    if (copy.querySelector(".toc-chapter-stats")) return;

    var minutes = readingMinutes(words);
    var stats = document.createElement("span");
    stats.className = "toc-chapter-stats";
    stats.title = "Estimated at " + readingSpeed + " words per minute";
    stats.setAttribute(
      "aria-label",
      displayWords(words) + " words. Estimated reading time " + displayReadingTime(minutes) + "."
    );
    stats.innerHTML =
      "<span>" + displayWords(words) + " words</span>" +
      "<span aria-hidden=\"true\">·</span>" +
      "<span>≈ " + displayReadingTime(minutes) + "</span>";
    copy.appendChild(stats);
  }

  function labelBookRow(link, book) {
    var kicker = link.querySelector(".toc-kicker");
    var title = link.querySelector(".toc-title");
    var year = link.querySelector(".toc-year");

    link.classList.add("toc-book-row");
    link.classList.remove("toc-chapter-row");
    link.setAttribute("data-book", book.numeral);
    if (kicker) {
      kicker.textContent = book.numeral === "V"
        ? "Book " + book.word + " · Compact edition"
        : "Book " + book.word;
    }
    if (title) title.textContent = book.title;

    if (!year) {
      year = document.createElement("span");
      year.className = "toc-year";
      var chevron = link.querySelector(".toc-chevron");
      link.insertBefore(year, chevron || null);
    }
    year.textContent = book.years;
    addBookStats(link, book);
  }

  function labelEpilogueRow(link, id) {
    var kicker = link.querySelector(".toc-kicker");
    link.classList.add("toc-chapter-row", "toc-epilogue-row");
    if (kicker) kicker.textContent = "Epilogue";
    addChapterStats(link, id);
  }

  function labelChapterRow(link, id) {
    link.classList.add("toc-chapter-row");
    addChapterStats(link, id);
  }

  function labelMetaRow(link) {
    link.classList.add("toc-meta-row");
  }

  function addReferenceLabel(link) {
    var item = link.closest("li");
    if (!item || item.parentNode.querySelector(".toc-section-label")) return;

    var label = document.createElement("li");
    label.className = "toc-section-label";
    label.textContent = "Reference";
    item.parentNode.insertBefore(label, item);
  }

  function updateContents(contents) {
    updateCover(contents);

    var toc = contents.querySelector(".toc");
    if (!toc) return;
    toc.setAttribute("aria-label", "Six books and their chapters");

    if (!toc.querySelector(".toc-heading")) {
      var heading = document.createElement("header");
      heading.className = "toc-heading";
      heading.innerHTML =
        "<h2>Reading order</h2>" +
        "<p>Choose a book, or continue chapter by chapter.</p>";
      toc.insertBefore(heading, toc.firstChild);
    }

    toc.querySelectorAll("a.toc-row").forEach(function (link) {
      var id = linkId(link);
      if (id === "00-frontmatter" || id === "book-one-character-bible") {
        link.closest("li").hidden = true;
      } else if (bookById[id]) {
        labelBookRow(link, bookById[id]);
      } else if (id === "part-six-afterlives") {
        labelEpilogueRow(link, id);
      } else if (id === "00a-foreword") {
        labelMetaRow(link);
      } else if (id.indexOf("appendix-") === 0) {
        addReferenceLabel(link);
        labelMetaRow(link);
      } else {
        labelChapterRow(link, id);
      }
      addTagline(link, id);
    });
  }

  var watchmansIllustrations = [
    {
      after: "The laundry Su Zhang's mother takes in",
      file: "01-the-copper.jpg",
      alt: "Su, Sau-Ling and Wei containing the leaking wash-copper before dawn.",
      caption: "Before the autumn: Su, Sau-Ling and Wei at work around the family wash-copper."
    },
    {
      after: "The practice is not what the sailors' stories make of it",
      file: "02-two-languages.jpg",
      alt: "Wei correcting Su's raised arm with the folded fan in the blue light before the laundry opens.",
      caption: "Wei teaches the practice in both languages before the laundry opens."
    },
    {
      after: "Kate comes whenever there's mending",
      file: "03-monday-customers.jpg",
      alt: "Long Liz, Su and Kate laughing around the torn bodice at the crowded laundry counter.",
      caption: "Long Liz and Kate were customers before they became names in the newspapers."
    },
    {
      after: "Su's brother Lee, born when she was four",
      file: "05-lees-winter.jpg",
      alt: "Eleven-year-old Su catching Lee hiding a sweet while Wei watches their winter practice.",
      caption: "Lee's winter, before the fever: Su catches her brother hiding a sweet during morning practice."
    },
    {
      after: "He is good with his hands in the way old surgeons are",
      file: "06-a-doctors-hands.jpg",
      alt: "Dr Cray resetting Ned Pike's shoulder at the Prospect while Su watches his hands.",
      caption: "Dr Cray resets a dockworker's shoulder while Su watches the economy of his hands."
    },
    {
      after: "Mind yourself down there, duchess",
      file: "10-kate-goes-hopping.jpg",
      alt: "Kate testing the hidden penny pocket as John, Wei and Su prepare the bundle and forgotten loaf for Kent.",
      caption: "Kate prepares for the Kent hop fields with John, Wei and Su."
    }
  ];

  function watchmansFigure(item) {
    var figure = document.createElement("figure");
    figure.className = "fig watchmans-plate";
    figure.setAttribute("data-watchmans-plate", item.file);

    var image = document.createElement("img");
    image.src = "assets/img/watchmans-daughter/" + item.file;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";

    var caption = document.createElement("figcaption");
    caption.textContent = item.caption;

    figure.appendChild(image);
    figure.appendChild(caption);
    return figure;
  }

  function applyWatchmansIllustrations(reader) {
    var coverPath = "assets/img/watchmans-daughter/00-cover.jpg";
    var hero = reader.querySelector(".hero");
    var heroImage = hero && hero.querySelector("img");
    var heroBackdrop = hero && hero.querySelector(".hero-backdrop");

    if (heroImage && heroImage.getAttribute("src") !== coverPath) {
      heroImage.src = coverPath;
      heroImage.alt = "Su Zhang standing at the threshold of the family laundry between warm lamplight and the cold Limehouse morning.";
    }
    if (heroBackdrop) heroBackdrop.style.backgroundImage = "url(" + coverPath + ")";

    var prose = reader.querySelector(".prose");
    if (!prose) return;

    watchmansIllustrations.forEach(function (item) {
      if (prose.querySelector('[data-watchmans-plate="' + item.file + '"]')) return;

      var paragraph = Array.prototype.find.call(prose.querySelectorAll("p"), function (candidate) {
        return candidate.textContent.indexOf(item.after) !== -1;
      });

      if (paragraph) paragraph.insertAdjacentElement("afterend", watchmansFigure(item));
    });
  }

  var chapterOneIllustrations = [
    {
      after: "dreading the paper tucked inside his coat",
      file: "../tom-maggie-paper.png",
      alt: "Tom studies the Company's paper at the bar while Maggie reads him more closely than he reads it.",
      caption: "The paper looks like a door to Tom. Maggie has buried enough sailors to see its lock."
    },
    {
      after: "But Tom does not stand alone",
      file: "02-the-room-stands.jpg",
      alt: "Silas stands isolated as the dockworkers rise together; Maggie, Mara and Tom watch from the bar.",
      caption: "The room makes its choice — a wall of river-men between the blade and the boy."
    },
    {
      after: "Elias gathers his coins from the table",
      file: "03-the-debt-is-mine.jpg",
      alt: "The room given back to itself: coins gathered from the table while Mara reaches the back stairs.",
      caption: "Afterwards: a candle for the back stairs, coins off the table, and no rope."
    }
  ];

  function chapterOneFigure(item) {
    var figure = document.createElement("figure");
    figure.className = "fig chapter-one-figure";
    figure.setAttribute("data-chapter-one-plate", item.file);

    var image = document.createElement("img");
    image.src = item.file.indexOf("../") === 0
      ? "assets/img/" + item.file.slice(3)
      : "assets/img/chapter-one/" + item.file;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";

    var caption = document.createElement("figcaption");
    caption.textContent = item.caption;

    figure.appendChild(image);
    figure.appendChild(caption);
    return figure;
  }

  function insertChapterOneFigure(prose, item) {
    if (prose.querySelector('[data-chapter-one-plate="' + item.file + '"]')) return;

    var paragraph = Array.prototype.find.call(prose.children, function (candidate) {
      return candidate.tagName === "P" && candidate.textContent.indexOf(item.after) !== -1;
    });
    if (!paragraph) return;
    paragraph.insertAdjacentElement("afterend", chapterOneFigure(item));
  }

  function bookPageScore(node) {
    if (node.tagName === "H2") return 70;
    if (node.tagName === "FIGURE") return 275;
    if (node.tagName === "BLOCKQUOTE") return 110;
    if (node.tagName === "HR") return 45;
    if (node.tagName === "TABLE") return 260;
    if (node.tagName === "PRE") return 180;
    var words = (node.textContent.trim().match(/\S+/g) || []).length;
    if (node.tagName === "UL" || node.tagName === "OL") return words + 90;
    return words + 28;
  }

  function buildBookPages(prose, pageMeta) {
    if (prose.querySelector(".book-spreads")) return;

    var nodes = Array.prototype.slice.call(prose.children);
    var pages = [];
    var page;
    var pageScore = 0;
    var pageLimit = 430;

    function startPage() {
      page = document.createElement("div");
      page.className = "book-page";
      pages.push(page);
      pageScore = 0;
    }

    startPage();
    nodes.forEach(function (node, index) {
      var score = bookPageScore(node);
      var nextScore = nodes[index + 1] ? bookPageScore(nodes[index + 1]) : 0;
      var wouldOverflow = pageScore > 0 && pageScore + score > pageLimit;
      var wouldOrphanHeading = node.tagName === "H2" && pageScore > 0 && pageScore + score + nextScore > pageLimit;

      if (wouldOverflow || wouldOrphanHeading) startPage();
      page.appendChild(node);
      pageScore += score;
    });

    for (var pair = 0; pair + 1 < pages.length; pair += 2) {
      var leftPage = pages[pair];
      var rightPage = pages[pair + 1];
      var leftScore = Array.prototype.reduce.call(leftPage.children, function (total, child) {
        return total + bookPageScore(child);
      }, 0);
      var rightScore = Array.prototype.reduce.call(rightPage.children, function (total, child) {
        return total + bookPageScore(child);
      }, 0);

      while (rightScore < leftScore * .65 && leftPage.children.length > 1) {
        var moved = leftPage.lastElementChild;
        var movedScore = bookPageScore(moved);
        rightPage.insertBefore(moved, rightPage.firstChild);
        leftScore -= movedScore;
        rightScore += movedScore;
      }
    }

    var book = document.createElement("div");
    book.className = "book-spreads";
    pages.forEach(function (currentPage, index) {
      var isLeftPage = index % 2 === 0;
      var footer = document.createElement("span");
      footer.className = "book-page-footer";
      footer.setAttribute("aria-hidden", "true");
      footer.textContent = pageMeta.footer;

      currentPage.setAttribute(
        "data-running-head",
        isLeftPage ? pageMeta.collectionTitle : pageMeta.chapterHead
      );
      currentPage.appendChild(footer);

      if (index % 2 === 0) {
        var spread = document.createElement("section");
        spread.className = "book-spread";
        spread.setAttribute("aria-label", "Reading spread " + (Math.floor(index / 2) + 1));
        book.appendChild(spread);
      }

      currentPage.classList.add(isLeftPage ? "book-page--left" : "book-page--right");
      book.lastElementChild.appendChild(currentPage);
    });

    if (pages.length % 2 !== 0) {
      var blank = document.createElement("div");
      blank.className = "book-page book-page--right book-page--blank";
      blank.setAttribute("aria-hidden", "true");
      book.lastElementChild.appendChild(blank);
    }

    prose.appendChild(book);
  }

  function applyChapterOneArtwork(reader) {
    var heroPath = "assets/img/chapter-one/01-rain-at-wapping.jpg";
    var hero = reader.querySelector(".hero");
    var heroImage = hero && hero.querySelector("img");

    if (heroImage && heroImage.getAttribute("src") !== heroPath) {
      heroImage.src = heroPath;
      heroImage.alt = "Wapping Wall in three days of rain, with warm tavern windows beside the dark Thames in 1603.";
    }

    var prose = reader.querySelector(".prose");
    if (!prose) return;
    chapterOneIllustrations.forEach(function (item) {
      insertChapterOneFigure(prose, item);
    });
  }

  function applyBookLayout(reader, id) {
    var book = readerBookById[id];
    if (!book) return;

    var head = reader.querySelector(".chapter-head");
    var kicker = head && head.querySelector(".chapter-kicker");
    var title = head && head.querySelector(".chapter-title");
    var year = head && head.querySelector(".chapter-year");
    var kickerText = kicker ? kicker.textContent.trim() : "";
    var titleText = title ? title.textContent.trim() : book.title;
    var yearText = year ? year.textContent.trim() : "";
    var chapterHead = [kickerText, titleText].filter(Boolean).join(" · ");
    var footerPeriod = yearText || book.years;

    var prose = reader.querySelector(".prose");
    if (!prose) return;
    reader.classList.add("reader--book-layout");
    buildBookPages(prose, {
      collectionTitle: "The Front-Row Seat",
      chapterHead: chapterHead,
      footer: "Book " + book.word + " · " + book.title + " · " + footerPeriod
    });
  }

  function updateReader(reader, id) {
    // The Wapping Twelve ledger is reachable only from Book One's own pages:
    // drop any prev/next card that would surface it in the linear reading flow.
    reader.querySelectorAll(".chapter-nav a").forEach(function (card) {
      if (linkId(card) === "book-one-character-bible") card.remove();
    });

    var head = reader.querySelector(".chapter-head");
    if (!head) return;

    var kicker = head.querySelector(".chapter-kicker");
    var title = head.querySelector(".chapter-title");
    var book = bookById[id];

    if (book) {
      if (kicker) {
        kicker.textContent = id === "12-1888-the-watchmans-daughter"
          ? "Book Five · Compact Edition"
          : "Book " + book.word;
      }
      if (title) title.textContent = book.title;

      document.title = book.title + " — The Front-Row Seat";
    }

    if (id === "part-six-afterlives") {
      if (kicker) kicker.textContent = "Book Six · Epilogue";
      document.title = "Afterlives — The Front-Row Seat";
    }

    if (id === "12-1888-the-watchmans-daughter") {
      applyWatchmansIllustrations(reader);
    }

    if (id === "01-1603-the-boy-who-signed") {
      applyChapterOneArtwork(reader);
    }

    applyBookLayout(reader, id);
  }

  var pending = false;
  var observer;
  function enhance() {
    pending = false;
    if (observer) observer.disconnect();

    try {
      var contents = document.querySelector("main.contents");
      if (contents) updateContents(contents);

      var reader = document.querySelector("article.reader");
      if (reader) updateReader(reader, routeId());
    } finally {
      if (observer) {
        observer.observe(document.getElementById("root"), { childList: true, subtree: true });
      }
    }
  }

  function scheduleEnhancement() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(enhance);
  }

  observer = new MutationObserver(scheduleEnhancement);
  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
  window.addEventListener("hashchange", scheduleEnhancement);
  window.addEventListener("DOMContentLoaded", scheduleEnhancement);
  scheduleEnhancement();
})();
