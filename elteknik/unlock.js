/*
 * Låser upp hela boken i webbläsaren.
 * Filerna ligger krypterade på servern (AES-256-GCM, nyckel via PBKDF2-SHA256).
 * Format: "NJENC1" + salt(16) + iv(12) + chiffertext. Lösenordet finns inte i koden –
 * fel lösenord gör att dekrypteringen misslyckas.
 */
(function () {
  "use strict";

  var FILES = {
    pdf: { url: "files/bok.pdf.enc", name: "Elteknik_och_ellara_Nils_Johansson.pdf", type: "application/pdf" },
    epub: { url: "files/bok.epub.enc", name: "Elteknik_och_ellara_Nils_Johansson.epub", type: "application/epub+zip" }
  };
  var MAGIC = "NJENC1";
  var iterations = 600000;
  var cache = {};

  var form = document.getElementById("unlock");
  var input = document.getElementById("pw");
  var status = document.getElementById("status");

  function mb(bytes) {
    return (bytes / 1048576).toFixed(1).replace(".", ",") + " MB";
  }

  fetch("files/manifest.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      if (!m) return;
      iterations = m.iterations || iterations;
      var s = document.getElementById("sample-size");
      if (s) s.textContent = "PDF · " + m.sample_pages + " sidor · " + mb(m.sample_bytes);
      var meta = document.getElementById("sample-meta");
      if (meta) meta.textContent = "PDF · " + m.sample_pages + " sidor · kapitel 1 med exempel och övningar";
      var pages = document.getElementById("stat-pages");
      if (pages) pages.textContent = m.pages;
      FILES.pdf.label = "PDF · " + mb(m.pdf_bytes);
      FILES.epub.label = "EPUB · " + mb(m.epub_bytes);
    })
    .catch(function () {});

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "status" + (kind ? " " + kind : "");
  }

  function getFile(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    return fetch(FILES[key].url).then(function (r) {
      if (!r.ok) throw new Error("download");
      return r.arrayBuffer();
    }).then(function (buf) {
      cache[key] = buf;
      return buf;
    });
  }

  function decrypt(buf, password) {
    var bytes = new Uint8Array(buf);
    var head = String.fromCharCode.apply(null, bytes.subarray(0, 6));
    if (head !== MAGIC) return Promise.reject(new Error("format"));
    var salt = bytes.subarray(6, 22);
    var iv = bytes.subarray(22, 34);
    var data = bytes.subarray(34);
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
          base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      })
      .then(function (key) {
        return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
      });
  }

  function save(plain, file) {
    var blob = new Blob([plain], { type: file.type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!window.crypto || !crypto.subtle) {
      setStatus("Webbläsaren saknar stöd för att låsa upp filen. Prova en nyare webbläsare.", "error");
      return;
    }
    var key = (e.submitter && e.submitter.getAttribute("data-file")) || "pdf";
    var file = FILES[key];
    var password = input.value;
    var buttons = form.querySelectorAll("button");
    buttons.forEach(function (b) { b.disabled = true; });
    setStatus("Hämtar och låser upp " + (file.label || key.toUpperCase()) + " …", "busy");

    getFile(key)
      .then(function (buf) { return decrypt(buf, password); })
      .then(function (plain) {
        save(plain, file);
        setStatus("Klart – " + file.name + " laddas ner.", "ok");
      })
      .catch(function (err) {
        if (err && err.message === "download") {
          setStatus("Filen kunde inte hämtas. Kontrollera anslutningen och försök igen.", "error");
        } else {
          setStatus("Fel lösenord.", "error");
          input.select();
        }
      })
      .then(function () {
        buttons.forEach(function (b) { b.disabled = false; });
      });
  });
})();
