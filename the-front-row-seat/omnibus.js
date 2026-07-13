(function () {
  "use strict";

  var books = [
    {
      numeral: "I",
      word: "One",
      title: "The Venture",
      years: "1603–1626",
      id: "part-one-the-venture"
    },
    {
      numeral: "II",
      word: "Two",
      title: "The Gallows Years",
      years: "1696–1701",
      id: "part-two-the-gallows-years"
    },
    {
      numeral: "III",
      word: "Three",
      title: "Kings of Bengal",
      years: "1757–1790",
      id: "part-three-kings-of-bengal"
    },
    {
      numeral: "IV",
      word: "Four",
      title: "The Poppy",
      years: "1839–1880",
      id: "part-four-the-poppy"
    },
    {
      numeral: "V",
      word: "Five",
      title: "The Watchman’s Daughter",
      years: "1888–1892",
      id: "12-1888-the-watchmans-daughter",
      status: "Standalone expansion in progress"
    },
    {
      numeral: "VI",
      word: "Six",
      title: "The Engine Room",
      years: "1940–2019",
      id: "part-five-the-engine-room"
    }
  ];

  var bookById = {};
  books.forEach(function (book) {
    bookById[book.id] = book;
  });

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
  }

  function labelEpilogueRow(link) {
    var kicker = link.querySelector(".toc-kicker");
    link.classList.add("toc-chapter-row", "toc-epilogue-row");
    if (kicker) kicker.textContent = "Epilogue";
  }

  function labelChapterRow(link) {
    link.classList.add("toc-chapter-row");
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
      if (id === "00-frontmatter") {
        link.closest("li").hidden = true;
      } else if (bookById[id]) {
        labelBookRow(link, bookById[id]);
      } else if (id === "part-six-afterlives") {
        labelEpilogueRow(link);
      } else if (id === "00a-foreword") {
        labelMetaRow(link);
      } else if (id.indexOf("appendix-") === 0) {
        addReferenceLabel(link);
        labelMetaRow(link);
      } else {
        labelChapterRow(link);
      }
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
      after: "He has a paper in his pocket",
      file: "../tom-maggie-paper.png",
      alt: "Tom studies the Company's paper at the bar while Maggie reads him more closely than he reads it.",
      caption: "The paper looks like a door to Tom. Maggie has buried enough sailors to see its lock."
    },
    {
      after: "Any man who still calls himself a sailor",
      file: "02-the-room-stands.jpg",
      alt: "Silas stands isolated as the dockworkers rise together; Maggie, Mara and Tom watch from the bar.",
      caption: "The room makes its choice—not for Tom, but for the kind of river it drinks beside."
    },
    {
      after: "Maggie comes round the counter then",
      file: "03-the-debt-is-mine.jpg",
      alt: "Maggie returns one coin to the table while the old docker gathers the rest and Mara reaches the back stairs.",
      caption: "A coin, a paper and a witnessed debt: Maggie gives the room's violence a different ending."
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

  function chapterOnePageScore(node) {
    if (node.tagName === "H2") return 70;
    if (node.tagName === "FIGURE") return 275;
    if (node.tagName === "BLOCKQUOTE") return 110;
    if (node.tagName === "HR") return 45;
    var words = (node.textContent.trim().match(/\S+/g) || []).length;
    return words + 28;
  }

  function buildChapterOnePages(prose) {
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
      var score = chapterOnePageScore(node);
      var nextScore = nodes[index + 1] ? chapterOnePageScore(nodes[index + 1]) : 0;
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
        return total + chapterOnePageScore(child);
      }, 0);
      var rightScore = Array.prototype.reduce.call(rightPage.children, function (total, child) {
        return total + chapterOnePageScore(child);
      }, 0);

      while (rightScore < leftScore * .65 && leftPage.children.length > 1) {
        var moved = leftPage.lastElementChild;
        var movedScore = chapterOnePageScore(moved);
        rightPage.insertBefore(moved, rightPage.firstChild);
        leftScore -= movedScore;
        rightScore += movedScore;
      }
    }

    var book = document.createElement("div");
    book.className = "book-spreads";
    pages.forEach(function (currentPage, index) {
      if (index % 2 === 0) {
        var spread = document.createElement("section");
        spread.className = "book-spread";
        spread.setAttribute("aria-label", "Reading spread " + (Math.floor(index / 2) + 1));
        book.appendChild(spread);
      }

      currentPage.classList.add(index % 2 === 0 ? "book-page--left" : "book-page--right");
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

  function applyChapterOneLayout(reader) {
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
    reader.classList.add("reader--book-layout");
    buildChapterOnePages(prose);
  }

  function updateReader(reader, id) {
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
      applyChapterOneLayout(reader);
    }
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
