/* Lightweight homepage previews. Full applications open only when requested. */
(function () {
  'use strict';
  var root = document.querySelector('#project-grid');
  if (!root || typeof CONFIG === 'undefined') return;
  var projects = CONFIG.projectExplorer || [];
  var escape = function (value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  var categories = {explore:'Explore', create:'Create', learn:'Learn'};
  function pathway(p) { return p.id === 'world' ? 'explore' : p.category === 'learn' ? 'learn' : 'create'; }
  function preview(p) {
    if (p.preview === 'world') return '<figure class="px-preview px-world"><img id="px-town-view" src="/johansson-town/assets/images/title/title-day-portrait.webp" width="540" height="960" loading="lazy" decoding="async" alt="Johansson World’s seaside street, shops and ferry in daylight"><div class="px-scene-title"><span>OKINAWA · 1997</span><b>A little island life.</b></div><div class="px-day-switch" role="group" aria-label="Town artwork lighting"><button type="button" data-town-light="day" aria-pressed="true">Day</button><button type="button" data-town-light="night" aria-pressed="false">Night</button></div><figcaption id="px-town-caption">Town artwork · day</figcaption></figure>';
    if (p.preview === 'camera') return '<figure class="px-preview px-camera"><picture><source media="(max-width:760px)" srcset="/camera/card-narrow.webp" width="720" height="660"><img src="/camera/card.webp" width="1200" height="630" loading="lazy" decoding="async" alt="One café photo in five slices, each in a different Look: Natural, Pocket, Manga, Woodblock print and Watercolour, with Fuji’s die-cut sticker waving"></picture></figure>';
    if (p.preview === 'studio') return '<figure class="px-preview px-studio"><img src="/avatar-creator/docs/studio-desktop.png" width="1280" height="800" loading="lazy" decoding="async" alt="Johansson Studio character editor showing a braided character and facial expression options"><figcaption>From the character editor</figcaption></figure>';
    if (p.preview === 'maintenance') return '<div class="px-preview px-maintenance"><div class="px-mini-window"><div class="px-mini-title"><span class="px-mini-mark">M</span><b>Workshop programme</b><span class="px-mini-label">DEMO</span></div><div class="px-mini-metrics"><div><strong>04</strong><span>Assets</span></div><div><strong id="px-preview-due">02</strong><span>Checks due</span></div><div><strong>01</strong><span>Open action</span></div></div><div class="px-mini-task"><span><b>Cooling water pump</b><small>Visual inspection</small></span><button type="button" id="px-complete-preview" aria-label="Try the preview: mark the sample pump inspection complete">Mark complete</button></div><p class="px-preview-note" id="px-preview-feedback" role="status" aria-live="polite">Try one check here. This preview does not save a record.</p></div></div>';
    if (p.preview === 'course') return '<figure class="px-preview px-course"><div class="px-lesson-tag">SJÖSKOLAN / ELTEKNIK</div><svg viewBox="0 0 440 165" role="img" aria-label="Simple DC circuit illustration with a supply, resistor and current meter"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M62 73V34h110m94 0h108v96H62V95M48 73h28M54 85h16M48 95h28M172 34l8-10 12 20 12-20 12 20 12-20 12 20 12-20 8 10h6"/><circle cx="221" cy="130" r="22" fill="#e9f2ec"/><path d="M212 137l9-18 9 18m-14-6h10"/></g><text x="58" y="56" font-size="15" fill="currentColor">+</text><text x="207" y="75" font-size="16" fill="currentColor">R</text></svg><div class="px-lesson-topics"><span>01 · Understand</span><span>02 · Measure</span><span>03 · Apply</span></div><figcaption>Learn the principle. Practise the measurement.</figcaption></figure>';
    if (p.preview === 'book') return '<figure class="px-preview px-book"><div class="px-book-copy"><span>FOR SHIP & SHORE</span><strong>24 chapters.<br>240 exercises.<br>One reference.</strong></div><img src="/elteknik/files/omslag.jpg?v=20261017" width="640" height="900" loading="lazy" decoding="async" alt="Cover of Elteknik och ellära för sjöfart och industri by Nils Johansson"><figcaption>Swedish textbook · Free sample chapter</figcaption></figure>';
    return '<figure class="px-preview px-stepwise"><span class="px-calculation-label">FROM RANGE TO TEST POINTS</span><div class="px-calculation"><span>01 <b>The range</b><i>0 → 10 kN</i></span><span>02 <b>The points</b><i>5 points · 4 intervals</i></span><span>03 <b>The spacing</b><strong>2.5 kN</strong></span></div><figcaption>Test-point planning example</figcaption></figure>';
  }
  function projectMascot(p) {
    var poses = {world:'johansson-tada',studio:'thuan-dance',camera:'tetsuo-teach',maintenance:'johansson-inspect',course:'tetsuo-teach',book:'tetsuo-think'};
    return '<img class="px-mascot" src="/assets/mascots/'+(poses[p.preview] || 'thuan-peace')+'.webp" width="80" height="112" alt="" loading="lazy" decoding="async">';
  }
  function downloadLink(p) {
    if (!p.downloadUrl) return '';
    return '<a class="px-platform-link" href="'+escape(p.downloadUrl)+'">Linux demo & downloads <span>Linux x86-64 · Steam Deck</span>'+arrow+'</a>';
  }
  root.innerHTML = projects.map(function(p, index) {
    return '<article class="px-card px-card-'+escape(p.id)+'" data-project-category="'+escape(pathway(p))+'" aria-labelledby="project-'+escape(p.id)+'">'+preview(p)+'<div class="px-copy"><div class="px-card-meta"><span>'+escape(categories[pathway(p)])+'</span><span>'+escape(p.status)+'</span></div><div class="px-mascot-title"><div><p class="px-eyebrow">'+escape(p.id === 'camera' ? 'Psst… check this out!' : p.eyebrow)+'</p><h3 id="project-'+escape(p.id)+'">'+(p.titleUrl?'<a href="'+escape(p.titleUrl)+'">'+escape(p.title)+'</a>':escape(p.title))+'</h3></div>'+projectMascot(p)+'</div><p class="px-summary">'+escape(p.summary)+'</p><div class="px-facts"><span>'+escape(p.format)+'</span><span>'+escape(p.language)+'</span></div><details class="px-details"><summary>What can I do here?<span aria-hidden="true">＋</span></summary><div class="px-detail-content"><ul>'+p.features.map(function(f){return '<li>'+escape(f)+'</li>';}).join('')+'</ul><p><b>Start here.</b> '+escape(p.firstTry)+'</p></div></details><div class="px-card-actions"><a class="px-open" href="'+escape(p.url)+'">'+escape(p.action)+arrow+'</a>'+(p.secondaryUrl?'<a class="px-secondary" href="'+escape(p.secondaryUrl)+'">'+escape(p.secondaryAction)+' ↗</a>':'')+'</div>'+downloadLink(p)+(p.id==='course'?'<a class="px-private-course" href="https://sjoskolan-course-review.nils-johansson.chatgpt.site" target="_blank" rel="noopener noreferrer nofollow"><img src="/assets/private-course-link/johansson-whisper.webp" width="32" height="48" alt="" loading="lazy"><span>Private classroom<small>Sign-in required · opens in a new tab</small></span>'+arrow+'</a>':'')+'</div></article>';
  }).join('');
  var filters = document.querySelectorAll('[data-project-filter]');
  filters.forEach(function(button) {
    button.addEventListener('click', function() {
      var selected = button.dataset.projectFilter;
      var count = 0;
      root.dataset.filter = selected;
      root.querySelectorAll('[data-project-category]').forEach(function(card) {
        var show = selected === 'all' || card.dataset.projectCategory === selected;
        card.hidden = !show;
        if (show) count++;
      });
      filters.forEach(function(other) { other.setAttribute('aria-pressed', String(other === button)); });
      document.querySelector('#project-count').textContent = count+' '+(count === 1?'project':'projects')+' to explore';
    });
    var selected = button.dataset.projectFilter;
    button.querySelector('span').textContent = selected === 'all' ? projects.length : projects.filter(function(p){ return pathway(p) === selected; }).length;
  });
  document.querySelectorAll('[data-town-light]').forEach(function(button) {
    button.addEventListener('click', function() {
      var night = button.dataset.townLight === 'night';
      var img = document.querySelector('#px-town-view');
      img.src = '/johansson-town/assets/images/title/title-'+(night?'night':'day')+'-portrait.webp';
      img.alt = night ? 'Johansson World harbour town artwork at night' : 'Johansson World’s seaside street, shops and ferry in daylight';
      document.querySelector('#px-town-caption').textContent = 'Town artwork · '+(night?'night':'day');
      document.querySelectorAll('[data-town-light]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button));});
    });
  });
  var complete = document.querySelector('#px-complete-preview');
  if (complete) complete.addEventListener('click', function() {
    var done = complete.getAttribute('aria-pressed') === 'true';
    complete.setAttribute('aria-pressed',String(!done));
    complete.textContent = done ? 'Mark complete' : '✓ Completed';
    complete.setAttribute('aria-label',done?'Try the preview: mark the sample pump inspection complete':'Reset the sample pump inspection preview');
    document.querySelector('#px-preview-due').textContent = done ? '02' : '01';
    document.querySelector('#px-preview-feedback').textContent = done ? 'Try one check here. This preview does not save a record.' : 'One check complete. Open the demo to try the full checklist.';
  });
  if (complete) complete.setAttribute('aria-pressed','false');
  var channels = document.querySelector('#project-channels');
  if (channels) channels.innerHTML = CONFIG.projects.filter(function(p) {
    return new URL(p.url,location.origin).origin !== location.origin;
  }).map(function(p) {
    var title = p.title === 'JOJO-Engineering Shop'?'Shop':p.title === 'WordPress Blog'?'Blog':p.title;
    return '<a href="'+escape(p.url)+'" target="_blank" rel="noopener noreferrer">'+escape(title)+' <span aria-hidden="true">↗</span><span class="px-sr-only"> (opens in a new tab)</span></a>';
  }).join('');
})();



