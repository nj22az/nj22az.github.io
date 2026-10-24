'use strict';
(function () {
  var KEY = 'minato-farm-v1';
  // grow = seconds to ripen, seed = cost, sell = price per harvest, img = Johansson World asset
  var CROPS = {
    rice:    { name: 'Rice',    img: 'island-onigiri.webp',  grow: 20, seed: 5,  sell: 12 },
    noodle:  { name: 'Wheat',   img: 'island-ramen.webp',    grow: 30, seed: 8,  sell: 20 },
    cabbage: { name: 'Cabbage', img: 'island-gyoza.webp',    grow: 45, seed: 12, sell: 32 },
    pumpkin: { name: 'Pumpkin', img: 'island-curry.webp',    grow: 60, seed: 18, sell: 50 },
    milk:    { name: 'Milk',    img: 'island-icecream.webp', grow: 90, seed: 30, sell: 90 }
  };
  var PLOTS = 9, UNLOCK_COST = [0, 0, 0, 0, 0, 100, 200, 400, 800];
  var state = load();
  var sel = 'rice';
  var el = { plots: document.getElementById('plots'), stats: document.getElementById('stats'),
             msg: document.getElementById('msg'), tools: document.getElementById('tools') };

  function fresh() {
    var p = [];
    for (var i = 0; i < PLOTS; i++) p.push({ open: i < 5, crop: null, at: 0 });
    return { coins: 30, harvested: 0, plots: p };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.plots && s.plots.length === PLOTS) return s;
    } catch (e) {}
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function say(t) { el.msg.textContent = t; }
  function progress(p) { return Math.min(1, (Date.now() - p.at) / (CROPS[p.crop].grow * 1000)); }

  function tap(i) {
    var p = state.plots[i], c;
    if (!p.open) {
      if (state.coins < UNLOCK_COST[i]) return say('Need ' + UNLOCK_COST[i] + ' coins to clear this field.');
      state.coins -= UNLOCK_COST[i]; p.open = true; say('Field cleared.');
    } else if (!p.crop) {
      c = CROPS[sel];
      if (state.coins < c.seed) return say('Not enough coins for ' + c.name + ' (' + c.seed + ').');
      state.coins -= c.seed; p.crop = sel; p.at = Date.now(); say('Planted ' + c.name + '.');
    } else if (progress(p) >= 1) {
      c = CROPS[p.crop]; state.coins += c.sell; state.harvested++; p.crop = null;
      say('Harvested ' + c.name + ' (+' + c.sell + ').');
    } else say(CROPS[p.crop].name + ' is still growing.');
    save(); render();
  }

  function render() {
    el.stats.textContent = state.coins + ' coins · ' + state.harvested + ' harvested';
    state.plots.forEach(function (p, i) {
      var b = el.plots.children[i];
      if (!b) {
        b = document.createElement('button');
        b.className = 'plot';
        b.addEventListener('click', function () { tap(i); });
        el.plots.appendChild(b);
      }
      var html = '', cls = 'plot';
      if (!p.open) { cls += ' locked'; html = '<span>Clear: ' + UNLOCK_COST[i] + '</span>'; }
      else if (p.crop) {
        var pr = progress(p), ready = pr >= 1;
        cls += ready ? ' ready' : ' growing';
        html = '<img src="assets/' + CROPS[p.crop].img + '" alt="' + CROPS[p.crop].name + '">' +
               '<span>' + (ready ? 'Harvest' : Math.ceil((1 - pr) * CROPS[p.crop].grow) + 's') + '</span>' +
               '<i style="width:' + Math.round(pr * 100) + '%"></i>';
      } else html = '<span>Plant</span>';
      b.className = cls; b.innerHTML = html;
      b.setAttribute('aria-label', 'Field ' + (i + 1));
    });
    Array.prototype.forEach.call(el.tools.children, function (b) {
      var c = CROPS[b.dataset.seed];
      b.classList.toggle('sel', b.dataset.seed === sel);
      b.querySelector('small').textContent = c.seed + ' → ' + c.sell;
    });
  }

  el.tools.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { sel = b.dataset.seed; say('Seed: ' + CROPS[sel].name); render(); }
  });
  render();
  say('Pick a seed, tap a field to plant, tap again when ready.');
  setInterval(render, 1000);
})();
