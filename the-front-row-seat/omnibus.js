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
      title: "A Warden’s Watch",
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

  function bookCard(book) {
    var status = book.status
      ? '<span class="omnibus-book-status">' + book.status + "</span>"
      : "";

    return (
      '<a class="omnibus-book" data-book="' + book.numeral + '" href="#/read/' + book.id + '">' +
        '<span class="omnibus-book-number">Book ' + book.word + "</span>" +
        '<span class="omnibus-book-years">' + book.years + "</span>" +
        "<strong>" + book.title + "</strong>" +
        status +
      "</a>"
    );
  }

  function addOmnibusIntro(contents) {
    var cover = contents.querySelector(".cover");
    if (!cover) return;

    var kicker = cover.querySelector(".cover-kicker");
    var subtitle = cover.querySelector(".cover-sub");
    var startButton = cover.querySelector(".btn-primary");

    if (kicker) kicker.textContent = "A Six-Book Historical Omnibus";
    if (subtitle) subtitle.textContent = "Six self-contained books. Five centuries. One riverside witness.";
    if (startButton) startButton.textContent = "Begin Book One";

    if (contents.querySelector(".omnibus-intro")) return;

    var section = document.createElement("section");
    section.className = "omnibus-intro";
    section.setAttribute("aria-labelledby", "omnibus-heading");
    section.innerHTML =
      '<p class="omnibus-eyebrow">The omnibus</p>' +
      '<h2 id="omnibus-heading">Six complete books. One connected history.</h2>' +
      '<p class="omnibus-summary">This live reading edition is the compact canon for a cycle of six historical novels. Each book is designed to stand on its own; read together, they form <em>The Front-Row Seat</em> omnibus.</p>' +
      '<div class="omnibus-grid" aria-label="The six books">' + books.map(bookCard).join("") + "</div>" +
      '<p class="omnibus-development">The standalone editions are being expanded one book at a time. Titles may evolve during development; <em>The Watchman’s Daughter</em> is the current novel in progress.</p>';

    cover.insertAdjacentElement("afterend", section);
  }

  function labelBookRow(link, book) {
    var kicker = link.querySelector(".toc-kicker");
    var title = link.querySelector(".toc-title");
    var year = link.querySelector(".toc-year");

    link.classList.add("toc-book-row");
    link.setAttribute("data-book", book.numeral);
    if (kicker) kicker.textContent = "Book " + book.word;
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
    link.classList.add("toc-epilogue-row");
    if (kicker) kicker.textContent = "Epilogue";
  }

  function updateContents(contents) {
    addOmnibusIntro(contents);

    var toc = contents.querySelector(".toc");
    if (!toc) return;
    toc.setAttribute("aria-label", "Six books and their chapters");

    if (!toc.querySelector(".toc-heading")) {
      var heading = document.createElement("header");
      heading.className = "toc-heading";
      heading.innerHTML =
        '<p class="omnibus-eyebrow">Compact reading edition</p>' +
        "<h2>The six books</h2>" +
        "<p>Choose a book, or read straight through from Book One.</p>";
      toc.insertBefore(heading, toc.firstChild);
    }

    toc.querySelectorAll("a.toc-row").forEach(function (link) {
      var id = linkId(link);
      if (bookById[id]) labelBookRow(link, bookById[id]);
      if (id === "part-six-afterlives") labelEpilogueRow(link);
    });
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

      if (!head.querySelector(".reader-book-note")) {
        var note = document.createElement("p");
        note.className = "reader-book-note";
        note.textContent = id === "12-1888-the-watchmans-daughter"
          ? "This is the compact canonical version. The self-contained Su Zhang novel is now being expanded from it."
          : "This book stands on its own and also forms part of The Front-Row Seat omnibus.";
        head.appendChild(note);
      }

      document.title = book.title + " — The Front-Row Seat";
    }

    if (id === "part-six-afterlives") {
      if (kicker) kicker.textContent = "Book Six · Epilogue";
      document.title = "Afterlives — The Front-Row Seat";
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
