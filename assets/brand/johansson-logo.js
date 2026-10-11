// <johansson-logo> — the animated Johansson logo, inlined so the page can colour it.
//
//   <script src="/assets/brand/johansson-logo.js" defer></script>
//   <johansson-logo layout="horizontal" style="width:240px"></johansson-logo>
//
// Attributes:
//   layout   horizontal (default) | stacked | mark | wordmark
//   static   show the finished logo without drawing it
//   replay   draw it again on hover and on tap
// Colours follow CSS: --jl-ink (letters) and --jl-accent (mark). Set them to
// currentColor to match the surrounding text.

(function () {
  var base = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, "")) || "/assets/brand/";
  var cache = {};

  function load(layout) {
    if (!cache[layout]) {
      cache[layout] = fetch(base + "johansson-" + layout + "-animated.svg").then(function (r) {
        if (!r.ok) throw new Error("johansson-logo: no layout " + layout);
        return r.text();
      });
    }
    return cache[layout];
  }

  class JohanssonLogo extends HTMLElement {
    static get observedAttributes() { return ["layout"]; }
    connectedCallback() {
      this.style.display = this.style.display || "inline-block";
      if (!this._bound) {
        this._bound = true;
        var replay = this.replay.bind(this);
        this.addEventListener("mouseenter", function () { if (this.hasAttribute("replay")) replay(); });
        this.addEventListener("click", function () { if (this.hasAttribute("replay")) replay(); });
      }
      this.render();
    }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      var self = this;
      load(this.getAttribute("layout") || "horizontal").then(function (svg) {
        self.innerHTML = svg.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ');
        if (self.hasAttribute("static")) self.finish();
      });
    }
    animations() {
      var svg = this.querySelector("svg");
      return svg && svg.getAnimations ? svg.getAnimations({ subtree: true }) : [];
    }
    finish() { this.animations().forEach(function (a) { a.finish(); }); }
    replay() {
      var list = this.animations();
      if (list.some(function (a) { return a.playState === "running"; })) return;
      list.forEach(function (a) { a.currentTime = 0; a.play(); });
    }
  }

  if (!customElements.get("johansson-logo")) customElements.define("johansson-logo", JohanssonLogo);
})();
