import {createInputMode} from './input-mode.mjs';
import {moveMenuFocus,menuControls} from './menu-navigation.mjs';
import {icon, residentPortrait, controlDiagram} from './icons.mjs';
import {createDesktopInput, profileSettings, buttonGlyph, buttonPrompt, physicalGlyph, controllerFamily} from './controller.mjs';
if (window.johanssonDesktop && location.pathname.startsWith('/johansson-town/')) initialise();
function initialise() {
  const desktop = window.johanssonDesktop;
  const PROFILE_KEY = 'johansson-desktop-controller-v1', CAMERA_KEY = 'johansson-town-camera-v1';
  const cameraDefaults = {sensitivity: 1, deadzone: .16, fov: 65, invertY: false, bob: true};
  const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) || fallback;} catch {return fallback;}};
  let profile = profileSettings(read(PROFILE_KEY, {}));
  let camera = {...cameraDefaults, ...read(CAMERA_KEY, {})};
  const input = createDesktopInput(() => profile);
  window.johanssonDesktopInput = input;
  document.documentElement.classList.add('linux-console');
  const panel = document.createElement('div');
  panel.id = 'desktopMenu'; panel.hidden = true; panel.role = 'dialog';
  panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'desktopHeading');
  panel.innerHTML = `<section class="console-shell"><header class="console-header"><div><p class="console-eyebrow">JOHANSSON WORLD <span>ISLAND GUIDE</span></p><h1 id="desktopHeading">Paused</h1></div><button data-action="resume" class="console-close"><kbd data-glyph="9">☰</kbd> Resume</button></header><nav id="desktopTabs" aria-label="Pause sections"><span><kbd data-physical="4">L1</kbd></span><button data-tab="pause">${icon("island")}<span>Island</span></button><button data-tab="people">${icon("people")}<span>People</span></button><button data-tab="settings">${icon("settings")}<span>Settings</span></button><span><kbd data-physical="5">R1</kbd></span></nav><div id="desktopContent" class="console-content"></div><div id="desktopSelection" class="console-selection" aria-live="polite"></div><footer class="console-footer"><div><p id="desktopStatus" role="status" aria-live="polite">Progress stays on this device.</p><span id="desktopScrollHint" hidden>More below · ↓</span></div><div><kbd data-glyph="0">A</kbd> Select <kbd data-glyph="1">B</kbd> Back <span id="desktopSaveHint"><kbd data-physical="2">X</kbd> Save</span></div></footer></section>`;
  document.body.append(panel);
  const inputMode=createInputMode(mode=>{document.documentElement.dataset.inputMode=mode;});
  document.addEventListener('pointermove',event=>inputMode.pointer(event),true);
  document.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse')inputMode.click();},true);
  document.addEventListener('keydown',()=>inputMode.keyboard(),true);
  const content = panel.querySelector('#desktopContent'), heading = panel.querySelector('#desktopHeading');
  const status = panel.querySelector('#desktopStatus');
  const scrollHint = panel.querySelector('#desktopScrollHint');
  function updateScrollHint(){const bottom=content.getBoundingClientRect().bottom;scrollHint.hidden=![...content.querySelectorAll('button,input,select,summary,p')].some(el=>el.getClientRects().length&&el.getBoundingClientRect().bottom>bottom+2);}
  content.addEventListener('scroll', updateScrollHint);
  new ResizeObserver(() => requestAnimationFrame(updateScrollHint)).observe(content);
  const menuButton = document.createElement('button');
  menuButton.id = 'desktopOpenMenu'; menuButton.innerHTML = '<kbd data-glyph="9">☰</kbd> Pause';
  menuButton.setAttribute('aria-controls', 'desktopMenu'); menuButton.setAttribute('aria-expanded', 'false');
  document.body.append(menuButton);
  const hints = document.createElement('div'); hints.id = 'deckHints'; hints.hidden = true;
  hints.innerHTML = '<span><kbd data-glyph="3">Y</kbd> Bag</span><span><kbd data-glyph="8">▣</kbd> Town book</span><span id="desktopOtherActions" hidden><kbd>← →</kbd> Other actions</span><span id="desktopBackAction" hidden></span>';
  document.body.append(hints);
  const modalHints=document.createElement('p');modalHints.id='desktopModalHints';modalHints.hidden=true;modalHints.innerHTML='<kbd data-glyph="0">A</kbd> <span id="desktopModalConfirm">Select</span> <kbd data-glyph="1">B</kbd> Back';
  document.getElementById('activityActions')?.before(modalHints);
  const identityBadge=document.createElement('div');identityBadge.id='desktopIdentity';identityBadge.hidden=true;document.body.append(identityBadge);
  const playing = () => !!document.getElementById('start')?.classList.contains('hidden');
  const note = text => {status.textContent = text;};
  let page = 'pause', focusBefore, rawHeld=[], held = [], nextRepeat = 0, lastDirection = '', capture = null, updateAction = 'check', updateLabel = 'Check for updates', updateBusy = false, wasPlaying = false, lastPad = '', lastPadKey = '', lostPad = false;
  const labels = ['Interact / confirm', 'Back / stand / exit', 'Use held drink', 'Bag', 'Run', 'Jump', 'Inspect zoom out', 'Look closely / zoom', 'Town book', 'Pause menu', 'Hide HUD', 'Centre view', 'Pocket camera', 'Unused', 'Previous action', 'Next action'];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const button = (action, text, description = '') => `<button data-action="${action}" data-description="${escape(description)}"><span class="console-tile-icon">${icon(action)}</span><span class="console-button-label">${text}</span></button>`;
  function saveSettings() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CAMERA_KEY, JSON.stringify(camera));
    window.dispatchEvent(new Event('johansson-controller-settings'));syncGlyphs();
    input.suspend();
    held = input.read(navigator.getGamepads?.() || [], camera.deadzone).held;
  }
  function describeSelection(target){
    const description=target?.closest('[data-description]')?.dataset.description;
    const selection=panel.querySelector('#desktopSelection');
    selection.textContent=description||(['pause','settings'].includes(page)?'Choose an icon with the stick or D-pad.':'');
    selection.hidden=!selection.textContent;
  }
  content.addEventListener('focusin',event=>describeSelection(event.target));
  content.addEventListener('pointerover',event=>{if(event.target.closest('button'))describeSelection(event.target);});
  const focusMemory=new Map();
  const groupFor=name=>['controls','display','updates','quit'].includes(name)?'settings':name==='help'?'pause':name;
  let detectedId='',promptFamily='';
  function glyph(action){return buttonGlyph(action,profile,detectedId);}
  function syncGlyphs(){document.querySelectorAll('[data-glyph],[data-physical]').forEach(el=>{
    const physical=el.hasAttribute('data-physical'),index=Number(physical?el.dataset.physical:el.dataset.glyph);
    if(el.tagName.toLowerCase()==='text')el.textContent=promptFamily==='positions'&&physical&&index<4?['↓','→','←','↑'][index]:physical?physicalGlyph(index,profile,detectedId):glyph(index);
    else el.innerHTML=buttonPrompt(index,profile,detectedId,physical);
  });}

  new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches('[data-glyph],[data-physical]')||node.querySelector('[data-glyph],[data-physical]')))))syncGlyphs();
  }).observe(document.body,{childList:true,subtree:true});
  function showPage(name, focus = true) {
    const selected=document.activeElement;
    if(content.contains(selected))focusMemory.set(page,selected.dataset.action?'[data-action="'+selected.dataset.action+'"]':selected.dataset.person?'[data-person="'+selected.dataset.person+'"]':selected.name?'[name="'+selected.name+'"]':'');
    page = name; capture = null;describeSelection(null);
    panel.querySelector('.console-close').innerHTML = '<kbd data-glyph="9">☰</kbd> '+(playing()?'Resume':'Close');
    const group=groupFor(name);panel.dataset.page=name;
    panel.querySelectorAll('[data-tab]').forEach(el=>el.setAttribute('aria-current',el.dataset.tab===group?'page':'false'));
    heading.textContent = {pause:'A little island life',help:'How to play',controls:'Controls & camera',display:'Display',updates:'Updates',people:'People & homes',settings:'Settings',quit:'Save & quit?'}[name]||'Johansson World';
    if (name === 'pause') {
      const active=window.johanssonLinuxWorld?.active||'Johansson';
      content.innerHTML = `<nav class="console-nav console-launcher" aria-label="Island menu">${button('resume',playing()?'Explore':'Back to title','Return to the island, exactly where you left off.')}${button('town','Town book','Find places, check the map and discover things to do.')}${button('bag','Bag','See your items, food and drinks.')}${button('home','Go home','Return to your own room and bed.')}${button('save','Save','Keep your island progress on this device.')}${button('help','How to play','Learn the sticks, buttons and everyday island life.')}</nav><aside class="console-postcard"><img class="console-island-photo" src="../johansson-town/assets/images/title/title-day-landscape.webp" alt="Minato harbour"><div class="console-passport">${residentPortrait(active)}<div><p class="console-eyebrow">YOUR DAY, YOUR WAY</p><h2>${escape(active)}</h2><p>Who will you meet today?</p></div></div><p class="console-postcard-tip">${icon('talk')} Walk up. Say hello. See what happens.</p></aside>`;
      for(const action of ['town','bag','home','save'])content.querySelector('[data-action='+action+']').disabled=!playing();
    } else if(name==='settings'){
      content.innerHTML=`<div class="console-page"><nav class="console-nav console-launcher console-settings-launcher" aria-label="Settings">${button('controls','Controls','Tune your camera, choose a layout or reassign any button.')}${button('display','Display','Screen, HUD and performance information.')}${button('updates','Updates','Check for a new island adventure.')}${button('quit','Save & quit','Save your day and return to Steam. You will be asked to confirm.')}</nav></div>`;
    } else if(name==='quit'){
      content.innerHTML=`<div class="console-page"><p class="console-intro">Your progress will be saved before the game closes.</p><div class="console-actions">${button('quit-confirm','Save & quit')}${button('settings','Keep playing')}</div></div>`;
    } else if (name === 'people') {
      const world = window.johanssonLinuxWorld;
      content.innerHTML = `<div class="console-page"><p class="console-intro">Choose whose day to follow. Everyone has a home to return to.</p><div class="console-roster">${world ? world.roster.map(person => `<button data-person="${encodeURIComponent(person.name)}" aria-pressed="${person.name===world.active}" ${world.busy ? 'disabled' : ''}>${residentPortrait(person.name)}<span class="console-resident-name">${escape(person.name)}</span>${person.name === world.active ? '<span class="console-playing">Playing</span>' : ''}<small>${escape(person.name==='Johansson'?'Chief engineer':person.role.split(';')[0])}</small><small>${icon("home")}${escape(person.home.address)}</small></button>`).join('') : '<p>The island is still loading. Come back in a moment.</p>'}</div></div>`;
    } else if (name === 'help') {
      content.innerHTML = `<div class="console-page"><p class="console-intro">Walk down to the harbour, stop by a shop, or say hello to a neighbour. Follow your curiosity.</p>${controlDiagram()}<div class="console-guide"><article>${icon("move")}<span class="stick-symbol">L</span><h2>Find your feet</h2><p>Left stick to walk. Hold <kbd data-glyph="4">R2</kbd> to run. <kbd data-glyph="5">X</kbd> jumps.</p></article><article>${icon("look")}<span class="stick-symbol">R</span><h2>Take a look</h2><p>Right stick turns the camera. Click <kbd data-glyph="11">R3</kbd> to level it. Hold <kbd data-glyph="7">L2</kbd> to look closely.</p></article><article>${icon("talk")}<span class="stick-symbol" data-glyph="0">A</span><h2>See what happens</h2><p>Walk up to a person, door or object. Press <kbd data-glyph="0">A</kbd> when its prompt appears.</p></article></div><div class="console-help-row"><p><kbd data-glyph="3">Y</kbd> Bag · <kbd data-glyph="8">▣</kbd> Town book · <kbd data-glyph="12">↑</kbd> Pocket camera · <kbd data-glyph="10">↓</kbd> Hide HUD</p><p>In menus: D-pad or left stick chooses, <kbd data-glyph="0">A</kbd> selects, <kbd data-glyph="1">B</kbd> goes back. <kbd data-glyph="9">☰</kbd> pauses and resumes. The default on Steam Deck is the ☰ Menu button near ABXY.</p></div><details class="console-full-controls"><summary>Every button & context</summary><dl class="console-control-list">${labels.map((label,i)=>i===13?'':`<div><dt><kbd data-glyph="${i}"></kbd></dt><dd>${label}</dd></div>`).join('')}</dl><p>Left stick walks at analogue speed; right stick looks. Camera: <kbd data-glyph="0">A</kbd> takes a photo; <kbd data-glyph="1">B</kbd> or <kbd data-glyph="12">↑</kbd> lowers it. Inspect: right stick rotates, <kbd data-glyph="6">L1</kbd> zooms out, <kbd data-glyph="7">L2</kbd> zooms in, <kbd data-glyph="11">R3</kbd> resets. Menus: stick / D-pad chooses, <kbd data-glyph="0">A</kbd> selects, <kbd data-glyph="1">B</kbd> returns, <kbd data-physical="4">L1</kbd> / <kbd data-physical="5">R1</kbd> changes pause tabs, <kbd data-physical="2">X</kbd> saves while paused. L3 has no assigned action. Steam / Quick Access and rear paddles are configured in Steam Input.</p></details><div class="console-actions">${button('controls', 'Customise controls')}${button('resume', 'Let’s explore', 'Settings are always a Menu press away')}</div></div>`;
    } else if (name === 'controls') {
      const pads = Array.from(navigator.getGamepads?.() || []).filter(p => p?.connected);
      const active = input.read(pads).pad;
      const range = (name, label, min, max, step, unit) => `<label class="console-setting"><span>${label}<output data-value="${name}">${name === 'deadzone' ? Math.round(camera[name] * 100) : camera[name]}${unit}</output></span><input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${camera[name]}"></label>`;
      content.innerHTML = `<div class="console-page"><p class="console-intro" id="desktopControllerStatus"></p><div class="console-settings-grid"><div>${controlDiagram()}<h2>Sticks & camera</h2><label class="console-setting">Button symbols<select name="glyphs"><option value="auto">Auto-detect</option><option value="deck">Steam Deck</option><option value="xbox">Xbox</option><option value="playstation">PlayStation</option><option value="nintendo">Nintendo</option><option value="positions">Button positions</option></select></label><label class="console-setting">Controller<select name="controller"><option value="">Auto-detect</option></select></label>${range('sensitivity', 'Look sensitivity', .3, 2.5, .1, '×')}${range('deadzone', 'Stick dead zone', .05, .35, .01, '%')}${range('fov', 'Field of view', 45, 85, 1, '°')}<label class="console-check"><input type="checkbox" name="invertY" ${camera.invertY ? 'checked' : ''}> Invert vertical look</label><label class="console-check"><input type="checkbox" name="bob" ${camera.bob ? 'checked' : ''}> Walking camera motion</label><div class="console-stick-test" aria-label="Live stick test"><span>MOVE <i id="moveTest"></i><output id="moveReadout"></output></span><span>LOOK <i id="lookTest"></i><output id="lookReadout"></output></span></div><p class="console-small">Move each stick to check it. Raise the dead zone if the view drifts.</p>${button('swap', 'Swap left / right sticks')}<div id="axisSettings"></div></div><div><h2>Button assignments</h2><p class="console-small">Select an action, then press its new button. Tap Back to cancel; hold Back for one second to assign it. Menu always cancels an assignment.</p><div class="console-bindings">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map(i => `<button data-bind="${i}"><span>${labels[i]}</span><kbd data-glyph="${i}">${escape(glyph(i))}</kbd></button>`).join('')}</div>${button('reset', 'Use island controls')}</div></div></div>`;
      content.querySelector('[name=glyphs]').value=profile.glyphs;
      const select = content.querySelector('[name=controller]');
      for (const p of pads) select.add(new Option(p.id, p.id));
      select.value = profile.controller;
      const count = Math.max(4, active?.axes.length || 4);
      const axes = content.querySelector('#axisSettings');
      for (const [group, label] of [['moveAxes', 'Move'], ['lookAxes', 'Look']]) for (let i = 0; i < 2; i++) {
        const row = document.createElement('label'); row.className = 'console-axis'; row.textContent = `${label} ${i ? 'vertical' : 'horizontal'} axis`;
        const select = document.createElement('select'); select.dataset.axes = group; select.dataset.index = i;
        for (let a = 0; a < count; a++) select.add(new Option(String(a), String(a)));
        select.value = profile[group][i]; row.append(select); axes.append(row);
      }
    } else if (name === 'display') {
      content.innerHTML = `<div class="console-page"><p class="console-intro">The island fills the screen. Menus keep readable text and their own scrolling area.</p>${button('hud', document.documentElement.classList.contains('desktop-hide-hud') ? 'Show HUD' : 'Hide HUD', 'D-pad down changes this with the island controls')}${button('performance', 'Show performance & memory')}<p class="console-small">Keyboard: F10 or Escape for the menu · F8 for HUD · F11 for full screen.</p></div>`;
    } else if (name === 'updates') {
      content.innerHTML = `<div class="console-page"><p class="console-intro">Linux edition ${desktop.version}</p><p>You can play offline. Checking for updates needs a connection. Compatible updates download a smaller file patch. Engine changes use the complete package. Updates keep your progress and retain the previous installation.</p>${button('update', updateLabel)}</div>`;
      content.querySelector('[data-action=update]').disabled = updateBusy;
    }
    content.scrollTop=0;
    if(focus){const remembered=focusMemory.get(name),target=remembered&&content.querySelector(remembered)||content.querySelector('button:not(:disabled),input,select,summary');target?.focus({preventScroll:true});requestAnimationFrame(()=>{if(target?.isConnected)target.scrollIntoView({block:'nearest'});updateScrollHint();});}
    panel.querySelector('#desktopSaveHint').hidden=!playing();syncGlyphs();requestAnimationFrame(updateScrollHint);
  }
  function openMenu(on = true, destination = 'pause') {
    if (on) {
      if (panel.hidden) focusBefore = document.activeElement;
      panel.hidden = false; document.documentElement.dataset.desktopMenu = 'open';
      document.exitPointerLock?.(); window.dispatchEvent(new Event('johansson-desktop-pause'));
      showPage(destination);
    } else {
      panel.hidden = true; capture = null; document.documentElement.dataset.desktopMenu = 'closed';
      input.suspend(); window.dispatchEvent(new Event('johansson-desktop-resume'));
      if (playing()) localStorage.setItem('johansson-desktop-introduction-seen', 'true');
      if (!playing()) document.getElementById('enter')?.focus(); else if (focusBefore?.isConnected) focusBefore.focus();
    }
    menuButton.setAttribute('aria-expanded', String(on));
  }
  function toggleHUD() {
    const hidden = document.documentElement.classList.toggle('desktop-hide-hud');
    localStorage.setItem('johansson-desktop-hide-hud', String(hidden));
    note(hidden ? 'HUD hidden. Press '+glyph(10)+' or F8 to restore it.' : 'HUD visible.');
  }
  document.documentElement.classList.toggle('desktop-hide-hud', localStorage.getItem('johansson-desktop-hide-hud') === 'true');
  menuButton.onclick = () => openMenu(panel.hidden);
  document.querySelector('#title .title-guide')?.addEventListener('click', event => {event.preventDefault(); event.stopImmediatePropagation(); openMenu(true, 'help');}, true);
  async function act(action) {
    try {
      if (action === 'resume') return openMenu(false);
      if (['help', 'controls', 'display', 'updates', 'people','settings','quit'].includes(action)) return showPage(action);
      if (action === 'home') {if (!playing()) {note('Choose your character, then start exploring to visit their home.'); return;} openMenu(false); await window.johanssonLinuxWorld.goHome();}
      if (action === 'save') {await desktop.save(); note('Progress saved to disk.');}
      if (action === 'quit-confirm') {await desktop.quit();}
      if(action==='bag'){if(!playing())return;openMenu(false);document.getElementById('bagButton')?.click();}
      if (action === 'town') {if (!playing()) {note('Start exploring to open the town book.'); return;} openMenu(false); document.getElementById('directoryButton')?.click();}
      if (action === 'festival') {if (!playing()) {note('Start exploring to visit the festival.'); return;} openMenu(false); window.dispatchEvent(new Event('johansson-festival-menu'));}
      if (action === 'hud') {toggleHUD(); showPage('display');}
      if (action === 'swap') {[profile.moveAxes, profile.lookAxes] = [profile.lookAxes, profile.moveAxes]; saveSettings(); showPage('controls'); note('Movement and look sticks swapped.');}
      if (action === 'reset') {profile = profileSettings({}); camera = {...cameraDefaults}; saveSettings(); showPage('controls'); note('Island controls: R2 run · L2 look closely · X jump · Y bag.');;}
      if (action === 'performance') {const metrics = await desktop.performance(), d = document.documentElement.dataset; note(`${d.renderFps || '—'} FPS · longest recent frame ${d.frameWorst || '—'} ms · ${d.drawCalls || '—'} draw calls · ` + metrics.map(m => `${m.type} ${m.workingSetMiB} MiB`).join(', '));}
      if (action === 'update' && !updateBusy) {
        updateBusy = true; content.querySelector('[data-action=update]').disabled = true;
        if (updateAction === 'restart') await desktop.restartUpdate();
        else if (updateAction === 'install') {note('Downloading and verifying…'); const result = await desktop.installUpdate(); if (result.ready) {updateAction = 'restart'; updateLabel = 'Save & restart into ' + result.version; note('Update verified. Your saves are retained.');}}
        else {note('Checking release information…'); const result = await desktop.checkUpdate(); if (result.available && result.canInstall) {updateAction = 'install'; updateLabel = 'Download ' + (result.kind==='patch'?'patch ':'update ') + result.next; note(`${result.kind==='patch'?'File patch':'Full package'} · ${(result.downloadBytes/1048576).toFixed(1)} MiB. Your progress is retained.`);} else note(result.available ? 'Run the Linux installer to enable in-game updates.' : 'This is the current release.');}
        updateBusy = false; if (page === 'updates') showPage('updates');
      }
    } catch (error) {updateBusy = false; if (page === 'updates') showPage('updates'); note(error.message || 'Could not finish. Please try again.');}
  }
  panel.addEventListener('click', event => {
    const tab=event.target.closest('[data-tab]');if(tab){showPage(tab.dataset.tab);return;}
    const person = event.target.closest('[data-person]');
    if (person) {person.disabled = true; const world = window.johanssonLinuxWorld; world.select(decodeURIComponent(person.dataset.person), {started: playing()}).then(() => {if (playing()) openMenu(false); else {showPage('people'); note('Selected '+world.active+'. Start exploring when you are ready.');}}).catch(error => {person.disabled = false; note(error.message);});return;}
    const binding = event.target.closest('[data-bind]');
    if (binding) {capture = {index: Number(binding.dataset.bind), ready: false, before: []}; note(`Release all buttons, then press a button for ${labels[capture.index]}. Tap ${glyph(1)} to cancel; hold it for one second to assign. Menu or Escape cancels.`); return;}
    const action = event.target.closest('[data-action]')?.dataset.action; if (action) act(action);
  });
  panel.addEventListener('input', event => {
    const el = event.target;
    if(el.name==='glyphs'){profile.glyphs=el.value;syncGlyphs();}
    else if (el.dataset.axes) {profile[el.dataset.axes][Number(el.dataset.index)] = Number(el.value);}
    else if (el.name === 'controller') {profile.controller = el.value;}
    else if (el.name in camera) {camera[el.name] = el.type === 'checkbox' ? el.checked : Number(el.value); const output = panel.querySelector(`[data-value="${el.name}"]`); if (output) output.textContent = el.name === 'deadzone' ? Math.round(camera.deadzone * 100) + '%' : camera[el.name] + (el.name === 'fov' ? '°' : '×');}
    saveSettings();
  });
  const focusables=menuControls;
  function navigate(root,direction){moveMenuFocus(root,direction);}
  function back(){if(capture){capture=null;note('Button assignment cancelled.');content.querySelector('[data-bind]:focus')?.focus();}else if(['controls','display','updates','quit'].includes(page))showPage('settings');else if(page==='help')showPage('pause');else openMenu(false);}
  function changeTab(step){const tabs=['pause','people','settings'],at=tabs.indexOf(groupFor(page));showPage(tabs[(at+step+tabs.length)%tabs.length]);}
  document.addEventListener('keydown', event => {
    if(event.repeat&&['F10','Escape'].includes(event.code)){event.preventDefault();return;}
    if (event.code === 'F10' || event.code === 'Escape' && panel.hidden) {event.preventDefault(); event.stopImmediatePropagation(); openMenu(panel.hidden); return;}
    if (event.code === 'F8') {event.preventDefault(); toggleHUD(); return;}
    if (panel.hidden) return;
    if (event.code === 'Escape') {event.preventDefault(); event.stopImmediatePropagation(); back(); return;}
    if (event.key === 'Tab') {event.preventDefault();const items=focusables(panel),at=items.indexOf(document.activeElement);items[(at+(event.shiftKey?-1:1)+items.length)%items.length]?.focus();}
    if (event.key.startsWith('Arrow') && !['range', 'text'].includes(event.target.type)) {event.preventDefault(); navigate(content, event.key.slice(5).toLowerCase());}
    // Keep game shortcuts from acting underneath the pause menu.
    event.stopImmediatePropagation();
  }, true);
  window.addEventListener('johansson-desktop-toggle-hud',toggleHUD);
  window.addEventListener('johansson-offline-link', () => {openMenu(); note('That link needs the internet. The installed island is available offline.');});
  window.addEventListener('johansson-save-failed', () => {openMenu(); note('Could not save to disk. Try Save progress again before quitting.');});
  window.addEventListener('blur', () => {held = []; input.suspend(); if (playing()) openMenu();});
  function controllerLost() {
    input.suspend(); held=[]; rawHeld=[]; nextRepeat=0; lastDirection=''; capture=null;
    if (playing() && !lostPad) {
      lostPad=true; openMenu(true, 'controls');
      note('Controller disconnected. Reconnect it, or use the keyboard.');
    }
  }
  // Native hot-plug events pause immediately, including between slow rendered
  // frames. Polling below also catches Steam Input/device changes without events.
  window.addEventListener('gamepaddisconnected', event => {
    if (lastPadKey === event.gamepad.index + ':' + event.gamepad.id) {
      controllerLost(); lastPadKey='';
    }
  });
  function poll(now) {
    let pads = []; try {pads = navigator.getGamepads?.() || [];} catch {}
    const frame = input.read(pads, camera.deadzone), buttons = frame.held, edge = i => buttons[i] && !held[i];
    const raw=Array.from(frame.pad?.buttons||[],b=>b.pressed||b.value>.55),rawEdge=i=>raw[i]&&!rawHeld[i];
    const key=frame.connected ? frame.pad.index+':'+frame.pad.id : '';
    if (key !== lastPadKey) {
      // Changing to another pad that is in use is not a loss: only a pad that went away pauses.
      if (lastPadKey && !Array.from(pads).some(p => p?.connected && p.index + ':' + p.id === lastPadKey)) controllerLost();
      lastPadKey=key; input.suspend();
      // A held confirm, back or Menu on the returning/replacement controller
      // must be released before it can act. Reconnection never resumes play.
      held=buttons; rawHeld=raw; nextRepeat=0; lastDirection='';
      if (frame.connected && lostPad) {
        note('Controller connected. Release held buttons, then choose when to resume.');
        lostPad=false;
      }
    }
    inputMode.pad(frame,raw.map((down,i)=>down&&!rawHeld[i]));
    detectedId=frame.pad?.id||'';const nextFamily=controllerFamily(detectedId,profile.glyphs);
    if(nextFamily!==promptFamily){promptFamily=nextFamily;document.documentElement.dataset.controllerFamily=nextFamily;syncGlyphs();}

    const isPlaying = playing();
    if (isPlaying && !wasPlaying && !localStorage.getItem('johansson-desktop-introduction-seen')) openMenu(true, 'help');
    wasPlaying = isPlaying;
    if (frame.connected) lastPad = frame.pad.id;
    const device = document.getElementById('desktopControllerStatus');
    if (device) device.textContent = frame.connected ? frame.pad.id + (frame.pad.driverMapping !== undefined ? ' · Connected · Linux driver layout' : frame.pad.mapping === 'standard' ? ' · Connected' : ' · Custom mapping: check the live sticks below') : 'No controller detected. Press a button to wake it. Keyboard and mouse remain available.';
    const activity=document.getElementById('activity'),activityOpen=activity&&!activity.classList.contains('hidden'),bookOpen=!document.getElementById('directory').classList.contains('hidden');
    hints.hidden = !isPlaying || !panel.hidden || activityOpen || bookOpen;
    modalHints.hidden=!isPlaying||!panel.hidden||!activityOpen;
    const confirmText=activity?.classList.contains('listening')||activity?.classList.contains('player-speaking')?'Continue':'Select',confirmLabel=document.getElementById('desktopModalConfirm');if(confirmLabel.textContent!==confirmText)confirmLabel.textContent=confirmText;
    const rail=document.getElementById('contextActions'),shown=rail?[...rail.querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled):[];
    document.getElementById('desktopOtherActions').hidden=shown.length<2;
    const cancel=shown.find(b=>['standButton','exitRoomButton'].includes(b.id)),backHint=document.getElementById('desktopBackAction');backHint.hidden=!cancel;
    if(cancel){const caption=cancel.id==='standButton'?'Stand up':'Exit';const stamp=promptFamily+':'+profile.bindings[1]+caption;if(backHint.dataset.prompt!==stamp){backHint.innerHTML='<kbd data-glyph="1">'+buttonPrompt(1,profile,detectedId)+'</kbd> '+caption;backHint.dataset.prompt=stamp;}}
    shown.forEach(b=>{
      const stamp=promptFamily+':'+profile.bindings[0];let key=b.querySelector('.console-action-key');
      if(!key){key=document.createElement('span');key.className='console-action-key';b.append(key);}
      if(key.dataset.prompt!==stamp){key.innerHTML=buttonPrompt(0,profile,detectedId);key.dataset.prompt=stamp;}
      b.dataset.consoleKey=glyph(0);
    });
    identityBadge.hidden = !isPlaying || !panel.hidden;
    const identityText = 'Playing as '+(window.johanssonLinuxWorld?.active || 'Johansson')+(window.johanssonLinuxWorld?.inBed?' · In bed · '+glyph(0)+' to get up':'');
    if(identityBadge.textContent!==identityText)identityBadge.textContent=identityText;
    menuButton.hidden = !panel.hidden;
    menuButton.classList.toggle('during-play', isPlaying);
    if (page === 'controls' && !panel.hidden) for (const name of ['move', 'look']) {
      const test = document.getElementById(name + 'Test'); if (test) test.style.transform = `translate(${frame[name].x * 22}px, ${frame[name].y * 22}px)`;
      const output = document.getElementById(name + 'Readout'); if (output) output.textContent = `${frame[name].x.toFixed(2)}, ${frame[name].y.toFixed(2)}`;
    }
    if (capture) {
      const raw = Array.from(frame.pad?.buttons || [], b => b.pressed || b.value > .55);
      if (!raw.some(Boolean)) capture.ready = true;
      let pressed = raw.findIndex((down, i) => down && !capture.before[i]);
      const backButton=profile.bindings[1];
      if(capture.ready&&(rawEdge(9)||edge(9))){back();held=buttons;rawHeld=raw;requestAnimationFrame(poll);return;}
      if(capture.ready&&raw[backButton]){capture.backAt??=now;pressed=now-capture.backAt>=1000?backButton:-1;}
      else if(capture.backAt!==undefined){back();held=buttons;rawHeld=raw;requestAnimationFrame(poll);return;}
      capture.before = raw;
      if (capture.ready && pressed >= 0) {
        const index = capture.index, old = profile.bindings[index], conflict = profile.bindings.indexOf(pressed);
        if (conflict >= 0 && conflict !== index) profile.bindings[conflict] = old;
        profile.bindings[index] = pressed; saveSettings(); showPage('controls', false);
        content.querySelector(`[data-bind="${index}"]`)?.focus(); note(`${labels[index]} assigned to button ${pressed}.`);
        held = input.read(pads, camera.deadzone).held; requestAnimationFrame(poll); return;
      }
    } else {
      if (edge(9)) openMenu(panel.hidden);
      else if (!panel.hidden && edge(1)) back();
      else if(!panel.hidden&&rawEdge(4))changeTab(-1);
      else if(!panel.hidden&&rawEdge(5))changeTab(1);
      else if(!panel.hidden&&rawEdge(2)&&isPlaying)act('save');
      else if(panel.hidden&&!isPlaying&&edge(1)&&!document.getElementById('titleSlots')?.classList.contains('hidden')){document.getElementById('titleSlotsClose')?.click();document.getElementById('enter')?.focus();}
      else if (!panel.hidden || !isPlaying) {
        const root = !panel.hidden ? content : document.querySelector('#titleSlots:not(.hidden)') || document.getElementById('title');
        const direction = raw[12] || frame.move.y < -.55 ? 'up' : raw[13] || frame.move.y > .55 ? 'down' : raw[14] || frame.move.x < -.55 ? 'left' : raw[15] || frame.move.x > .55 ? 'right' : '';
        if (direction && (direction !== lastDirection || now >= nextRepeat)) {navigate(root, direction); nextRepeat = now + (direction !== lastDirection ? 360 : 130);}
        lastDirection = direction;
        if (edge(0)) {const items = focusables(root), selected = document.activeElement; if (!items.includes(selected)) {const first = !panel.hidden ? items[0] : document.getElementById('enter'); first?.focus(); if (first && !first.disabled) first.click();} else if (selected.type === 'checkbox') {selected.checked = !selected.checked; selected.dispatchEvent(new Event('input', {bubbles: true}));} else if (selected.type !== 'range' && selected.tagName !== 'SELECT') selected.click();}
      }
    }
    held = buttons; rawHeld=raw; requestAnimationFrame(poll);
  }
  // The game already exposes its audit state. This summary also covers the
  // desktop menus for automated controller and layout acceptance.
  const snapshot = () => ({playing: playing(), menu: !panel.hidden, page, controller: lastPad || null, connected: !!lastPadKey, person: window.johanssonLinuxWorld?.active || null, inBed: !!window.johanssonLinuxWorld?.inBed, capture: capture?.index ?? null, inputMode:inputMode.mode,hudHidden: document.documentElement.classList.contains('desktop-hide-hud')});
  window.johanssonDesktopUI = {snapshot,prompt:action=>buttonPrompt(action,profile,detectedId),refreshPrompts:syncGlyphs,navigate:moveMenuFocus, open: name => openMenu(true, name || 'pause')};
  const gameText = window.render_game_to_text;
  window.render_game_to_text = () => JSON.stringify({coordinates: 'Game world: x east, y up, z south; sticks: x right, y down', desktop: snapshot(), game: gameText?.() || null});
  showPage('pause', false);syncGlyphs();
  requestAnimationFrame(poll);
}
