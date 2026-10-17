import {createDesktopInput, profileSettings} from './controller.mjs';
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
  panel.innerHTML = `<section class="console-shell"><header class="console-header"><div><p class="console-eyebrow">JOHANSSON WORLD <span>LINUX EDITION</span></p><h1 id="desktopHeading">Take a moment.</h1></div><button data-action="resume" class="console-close">Back to island <kbd>B</kbd></button></header><div id="desktopContent" class="console-content"></div><footer class="console-footer"><div><p id="desktopStatus" role="status" aria-live="polite">Progress stays on this device when the game updates.</p><span id="desktopScrollHint" hidden>More below · D-pad ↓</span></div><div><kbd>↑ ↓</kbd> Choose <kbd>A</kbd> Select <kbd>B</kbd> Back <kbd>Start</kbd> Resume</div></footer></section>`;
  document.body.append(panel);
  const content = panel.querySelector('#desktopContent'), heading = panel.querySelector('#desktopHeading');
  const status = panel.querySelector('#desktopStatus');
  const scrollHint = panel.querySelector('#desktopScrollHint');
  function updateScrollHint() { scrollHint.hidden = content.scrollHeight <= content.clientHeight + content.scrollTop + 4; }
  content.addEventListener('scroll', updateScrollHint);
  new ResizeObserver(() => requestAnimationFrame(updateScrollHint)).observe(content);
  const menuButton = document.createElement('button');
  menuButton.id = 'desktopOpenMenu'; menuButton.innerHTML = '<kbd>Start</kbd> Menu';
  menuButton.setAttribute('aria-controls', 'desktopMenu'); menuButton.setAttribute('aria-expanded', 'false');
  document.body.append(menuButton);
  const hints = document.createElement('div'); hints.id = 'deckHints'; hints.hidden = true;
  hints.innerHTML = '<span><kbd>LS</kbd> Move</span><span><kbd>RS</kbd> Look</span><span><kbd>A</kbd> Interact</span><span><kbd>View</kbd> Town book</span>';
  document.body.append(hints);
  const playing = () => !!document.getElementById('start')?.classList.contains('hidden');
  const note = text => {status.textContent = text;};
  let page = 'pause', focusBefore, held = [], nextRepeat = 0, lastDirection = '', capture = null, updateAction = 'check', updateLabel = 'Check for updates', updateBusy = false, wasPlaying = false, lastPad = '', lostPad = false;
  const labels = ['A · Interact / confirm', 'B · Back', 'X · Drink', 'Y · Inventory', 'LB · Run', 'RB · Jump', 'LT · Inspect zoom', 'RT · Zoom', 'View · Town book', 'Start · Pause menu', 'L3 · Hide HUD', 'R3 · Centre view', 'D-pad up · Pocket camera', 'D-pad down', 'D-pad left', 'D-pad right'];
  const button = (action, text, description = '') => `<button data-action="${action}"><span>${text}</span>${description ? `<small>${description}</small>` : ''}</button>`;
  function saveSettings() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CAMERA_KEY, JSON.stringify(camera));
    window.dispatchEvent(new Event('johansson-controller-settings'));
    input.suspend();
    held = input.read(navigator.getGamepads?.() || [], camera.deadzone).held;
  }
  function showPage(name, focus = true) {
    page = name; capture = null;
    panel.querySelector('.console-close').innerHTML = (playing() ? 'Resume' : 'Back to title') + ' <kbd>Start</kbd>';
    heading.textContent = {pause: playing() ? 'Take a moment.' : 'Your island awaits.', help: 'Make yourself at home.', controls: 'Make it feel right.', display: 'Your view of the island.', updates: 'Keep the island with you.'}[name];
    if (name === 'pause') {
      content.innerHTML = `<nav class="console-nav" aria-label="Pause menu">${button('resume', playing() ? 'Resume the island' : 'Back to title', 'Return to your game')}${button('help', 'How to play', 'Movement, camera and your first steps')}${button('controls', 'Controls & camera', 'Tune sticks and customise buttons')}${button('save', 'Save progress')}${button('town', 'Town book', 'Places, people and your bag')}${button('festival', 'Harbour Festival')}${button('display', 'Display & performance')}${button('updates', 'Updates')}${button('quit', 'Save & quit to Steam')}</nav><aside class="console-postcard"><img src="../johansson-town/assets/images/title/title-day-landscape.webp" alt="The island harbour in daylight"><div><p class="console-eyebrow">A LITTLE ISLAND LIFE · 1997</p><h2>No hurry. Look around.</h2><p>Use the left stick to walk and the right stick to look. An <kbd>A</kbd> prompt appears when there’s something to do.</p><p><kbd>Start</kbd> always brings you here.</p><p id="desktopControllerStatus" class="console-device"></p></div></aside>`;
    } else if (name === 'help') {
      content.innerHTML = `<div class="console-page"><p class="console-intro">Walk down to the harbour, stop by a shop, or say hello to a neighbour. Follow your curiosity.</p><div class="console-guide"><article><span class="stick-symbol">L</span><h2>Find your feet</h2><p>Left stick to walk. Hold <kbd>LB</kbd> to run. <kbd>RB</kbd> jumps.</p></article><article><span class="stick-symbol">R</span><h2>Take a look</h2><p>Right stick turns the camera. Click <kbd>R3</kbd> to level it. Hold <kbd>RT</kbd> to zoom.</p></article><article><span class="stick-symbol">A</span><h2>See what happens</h2><p>Walk up to a person, door or object. Press <kbd>A</kbd> when its prompt appears.</p></article></div><div class="console-help-row"><p><kbd>Y</kbd> Inventory · <kbd>View</kbd> Town book · <kbd>↑</kbd> Pocket camera · <kbd>L3</kbd> Hide HUD</p><p>In menus: D-pad or left stick chooses, <kbd>A</kbd> selects, <kbd>B</kbd> goes back. <kbd>Start</kbd> opens and closes this menu.</p></div><div class="console-actions">${button('controls', 'Customise controls')}${button('resume', 'Let’s explore', 'Settings are always a Start press away')}</div></div>`;
    } else if (name === 'controls') {
      const pads = Array.from(navigator.getGamepads?.() || []).filter(p => p?.connected);
      const active = input.read(pads).pad;
      const range = (name, label, min, max, step, unit) => `<label class="console-setting"><span>${label}<output data-value="${name}">${name === 'deadzone' ? Math.round(camera[name] * 100) : camera[name]}${unit}</output></span><input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${camera[name]}"></label>`;
      content.innerHTML = `<div class="console-page"><p class="console-intro" id="desktopControllerStatus"></p><div class="console-settings-grid"><div><h2>Sticks & camera</h2><label class="console-setting">Controller<select name="controller"><option value="">Auto-detect</option></select></label>${range('sensitivity', 'Look sensitivity', .3, 2.5, .1, '×')}${range('deadzone', 'Stick dead zone', .05, .35, .01, '%')}${range('fov', 'Field of view', 45, 85, 1, '°')}<label class="console-check"><input type="checkbox" name="invertY" ${camera.invertY ? 'checked' : ''}> Invert vertical look</label><label class="console-check"><input type="checkbox" name="bob" ${camera.bob ? 'checked' : ''}> Walking camera motion</label><div class="console-stick-test" aria-label="Live stick test"><span>MOVE <i id="moveTest"></i><output id="moveReadout"></output></span><span>LOOK <i id="lookTest"></i><output id="lookReadout"></output></span></div><p class="console-small">Move each stick to check it. Raise the dead zone if the view drifts.</p>${button('swap', 'Swap left / right sticks')}<div id="axisSettings"></div></div><div><h2>Button assignments</h2><p class="console-small">Select an action, then press the button you want to use. Escape cancels.</p><div class="console-bindings">${[0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].map(i => `<button data-bind="${i}"><span>${labels[i]}</span><kbd>${profile.bindings[i]}</kbd></button>`).join('')}</div>${button('reset', 'Restore default controls')}</div></div></div>`;
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
      content.innerHTML = `<div class="console-page"><p class="console-intro">The island fills the screen. Menus keep readable text and their own scrolling area.</p>${button('hud', document.documentElement.classList.contains('desktop-hide-hud') ? 'Show HUD' : 'Hide HUD', 'L3 changes this while you play')}${button('performance', 'Show performance & memory')}<p class="console-small">Keyboard: F10 or Escape for the menu · F8 for HUD · F11 for full screen.</p></div>`;
    } else if (name === 'updates') {
      content.innerHTML = `<div class="console-page"><p class="console-intro">Linux edition ${desktop.version}</p><p>You can play offline. Checking for updates needs a connection. Updates keep your progress and retain the previous installation.</p>${button('update', updateLabel)}</div>`;
      content.querySelector('[data-action=update]').disabled = updateBusy;
    }
    if (name !== 'pause') content.querySelector('.console-page').prepend(Object.assign(document.createElement('button'), {textContent: '‹ Back to pause menu', className: 'console-back', onclick: () => showPage('pause')}));
    if (focus) (name === 'pause' ? content.querySelector('button') : content.querySelector('.console-back'))?.focus();
    content.scrollTop = 0; requestAnimationFrame(updateScrollHint);
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
      if (focusBefore?.isConnected) focusBefore.focus();
    }
    menuButton.setAttribute('aria-expanded', String(on));
  }
  function toggleHUD() {
    const hidden = document.documentElement.classList.toggle('desktop-hide-hud');
    localStorage.setItem('johansson-desktop-hide-hud', String(hidden));
    note(hidden ? 'HUD hidden. Click L3 or press F8 to restore it.' : 'HUD visible.');
  }
  document.documentElement.classList.toggle('desktop-hide-hud', localStorage.getItem('johansson-desktop-hide-hud') === 'true');
  menuButton.onclick = () => openMenu(panel.hidden);
  document.querySelector('#title .title-guide')?.addEventListener('click', event => {event.preventDefault(); event.stopImmediatePropagation(); openMenu(true, 'help');}, true);
  async function act(action) {
    try {
      if (action === 'resume') return openMenu(false);
      if (['help', 'controls', 'display', 'updates'].includes(action)) return showPage(action);
      if (action === 'save') {await desktop.save(); note('Progress saved to disk.');}
      if (action === 'quit') {await desktop.quit();}
      if (action === 'town') {if (!playing()) {note('Start exploring to open the town book.'); return;} openMenu(false); document.getElementById('directoryButton')?.click();}
      if (action === 'festival') {if (!playing()) {note('Start exploring to visit the festival.'); return;} openMenu(false); window.dispatchEvent(new Event('johansson-festival-menu'));}
      if (action === 'hud') {toggleHUD(); showPage('display');}
      if (action === 'swap') {[profile.moveAxes, profile.lookAxes] = [profile.lookAxes, profile.moveAxes]; saveSettings(); showPage('controls'); note('Movement and look sticks swapped.');}
      if (action === 'reset') {profile = profileSettings({}); camera = {...cameraDefaults}; saveSettings(); showPage('controls'); note('Default controls restored.');}
      if (action === 'performance') {const metrics = await desktop.performance(), d = document.documentElement.dataset; note(`${d.renderFps || '—'} FPS · longest recent frame ${d.frameWorst || '—'} ms · ${d.drawCalls || '—'} draw calls · ` + metrics.map(m => `${m.type} ${m.workingSetMiB} MiB`).join(', '));}
      if (action === 'update' && !updateBusy) {
        updateBusy = true; content.querySelector('[data-action=update]').disabled = true;
        if (updateAction === 'restart') await desktop.restartUpdate();
        else if (updateAction === 'install') {note('Downloading and verifying…'); const result = await desktop.installUpdate(); if (result.ready) {updateAction = 'restart'; updateLabel = 'Save & restart into ' + result.version; note('Update verified. Your saves are retained.');}}
        else {note('Checking release information…'); const result = await desktop.checkUpdate(); if (result.available && result.canInstall) {updateAction = 'install'; updateLabel = 'Download update ' + result.next; note('Update available.');} else note(result.available ? 'Run the Linux installer to enable in-game updates.' : 'This is the current release.');}
        updateBusy = false; if (page === 'updates') showPage('updates');
      }
    } catch (error) {updateBusy = false; if (page === 'updates') showPage('updates'); note(error.message || 'Could not finish. Please try again.');}
  }
  panel.addEventListener('click', event => {
    const binding = event.target.closest('[data-bind]');
    if (binding) {capture = {index: Number(binding.dataset.bind), ready: false, before: []}; note(`Release all buttons, then press a button for ${labels[capture.index]}. Escape cancels.`); return;}
    const action = event.target.closest('[data-action]')?.dataset.action; if (action) act(action);
  });
  panel.addEventListener('input', event => {
    const el = event.target;
    if (el.dataset.axes) {profile[el.dataset.axes][Number(el.dataset.index)] = Number(el.value);}
    else if (el.name === 'controller') {profile.controller = el.value;}
    else if (el.name in camera) {camera[el.name] = el.type === 'checkbox' ? el.checked : Number(el.value); const output = panel.querySelector(`[data-value="${el.name}"]`); if (output) output.textContent = el.name === 'deadzone' ? Math.round(camera.deadzone * 100) + '%' : camera[el.name] + (el.name === 'fov' ? '°' : '×');}
    saveSettings();
  });
  const focusables = root => [...root.querySelectorAll('button,input,select,summary,a[href]')].filter(el => !el.disabled && !el.hidden && el.getClientRects().length);
  function navigate(root, direction) {
    const items = focusables(root), selected = document.activeElement, index = items.indexOf(selected);
    if (!items.length) return;
    if ((direction === 'left' || direction === 'right') && index >= 0) {
      const sign = direction === 'right' ? 1 : -1;
      if (selected.type === 'range') {selected.stepUp(sign); selected.dispatchEvent(new Event('input', {bubbles: true})); return;}
      if (selected.tagName === 'SELECT') {selected.selectedIndex = Math.max(0, Math.min(selected.options.length - 1, selected.selectedIndex + sign)); selected.dispatchEvent(new Event('input', {bubbles: true})); return;}
    }
    const next = items[index < 0 ? 0 : (index + (direction === 'up' || direction === 'left' ? -1 : 1) + items.length) % items.length];
    next.focus(); next.scrollIntoView({block: 'nearest'});
  }
  function back() {if (capture) {capture = null; note('Button assignment cancelled.');} else if (page !== 'pause') showPage('pause'); else openMenu(false);}
  document.addEventListener('keydown', event => {
    if (event.code === 'F10' || event.code === 'Escape' && panel.hidden) {event.preventDefault(); event.stopImmediatePropagation(); openMenu(panel.hidden); return;}
    if (event.code === 'F8') {event.preventDefault(); toggleHUD(); return;}
    if (panel.hidden) return;
    if (event.code === 'Escape') {event.preventDefault(); event.stopImmediatePropagation(); back(); return;}
    if (event.key === 'Tab') {event.preventDefault(); navigate(panel, event.shiftKey ? 'up' : 'down');}
    if (event.key.startsWith('Arrow') && !['range', 'text'].includes(event.target.type)) {event.preventDefault(); navigate(panel, event.key.slice(5).toLowerCase());}
    // Keep game shortcuts from acting underneath the pause menu.
    event.stopImmediatePropagation();
  }, true);
  window.addEventListener('johansson-offline-link', () => {openMenu(); note('That link needs the internet. The installed island is available offline.');});
  window.addEventListener('johansson-save-failed', () => {openMenu(); note('Could not save to disk. Try Save progress again before quitting.');});
  window.addEventListener('blur', () => {held = []; input.suspend(); if (playing()) openMenu();});
  function poll(now) {
    let pads = []; try {pads = navigator.getGamepads?.() || [];} catch {}
    const frame = input.read(pads, camera.deadzone), buttons = frame.held, edge = i => buttons[i] && !held[i];
    const isPlaying = playing();
    if (isPlaying && !wasPlaying && !localStorage.getItem('johansson-desktop-introduction-seen')) openMenu(true, 'help');
    wasPlaying = isPlaying;
    if (!frame.connected && lastPad && isPlaying && !lostPad) {lostPad = true; openMenu(true, 'controls'); note('Controller disconnected. Reconnect it, or use the keyboard.');}
    if (frame.connected) {lastPad = frame.pad.id; lostPad = false;}
    const device = document.getElementById('desktopControllerStatus');
    if (device) device.textContent = frame.connected ? frame.pad.id + (frame.pad.mapping === 'standard' ? ' · Connected' : ' · Custom mapping: check the live sticks below') : 'No controller detected. Press a button to wake it. Keyboard and mouse remain available.';
    hints.hidden = !isPlaying || !panel.hidden;
    menuButton.hidden = !panel.hidden;
    menuButton.classList.toggle('during-play', isPlaying);
    if (page === 'controls' && !panel.hidden) for (const name of ['move', 'look']) {
      const test = document.getElementById(name + 'Test'); if (test) test.style.transform = `translate(${frame[name].x * 22}px, ${frame[name].y * 22}px)`;
      const output = document.getElementById(name + 'Readout'); if (output) output.textContent = `${frame[name].x.toFixed(2)}, ${frame[name].y.toFixed(2)}`;
    }
    if (capture) {
      const raw = Array.from(frame.pad?.buttons || [], b => b.pressed || b.value > .55);
      if (!raw.some(Boolean)) capture.ready = true;
      const pressed = raw.findIndex((down, i) => down && !capture.before[i]); capture.before = raw;
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
      else if (isPlaying && panel.hidden && edge(10)) toggleHUD();
      else if (!panel.hidden || !isPlaying) {
        const root = !panel.hidden ? panel : document.querySelector('#titleSlots:not(.hidden)') || document.getElementById('title');
        const direction = buttons[12] || frame.move.y < -.55 ? 'up' : buttons[13] || frame.move.y > .55 ? 'down' : buttons[14] || frame.move.x < -.55 ? 'left' : buttons[15] || frame.move.x > .55 ? 'right' : '';
        if (direction && (direction !== lastDirection || now >= nextRepeat)) {navigate(root, direction); nextRepeat = now + (direction !== lastDirection ? 360 : 130);}
        lastDirection = direction;
        if (edge(0)) {const items = focusables(root), selected = document.activeElement; if (!items.includes(selected)) {const first = !panel.hidden ? items[0] : document.getElementById('enter'); first?.focus(); if (first && !first.disabled) first.click();} else if (selected.type === 'checkbox') {selected.checked = !selected.checked; selected.dispatchEvent(new Event('input', {bubbles: true}));} else if (selected.type !== 'range' && selected.tagName !== 'SELECT') selected.click();}
      }
    }
    held = buttons; requestAnimationFrame(poll);
  }
  // The game already exposes its audit state. This summary also covers the
  // desktop menus for automated controller and layout acceptance.
  const snapshot = () => ({playing: playing(), menu: !panel.hidden, page, controller: lastPad || null, capture: capture?.index ?? null, hudHidden: document.documentElement.classList.contains('desktop-hide-hud')});
  window.johanssonDesktopUI = {snapshot, open: name => openMenu(true, name || 'pause')};
  const gameText = window.render_game_to_text;
  window.render_game_to_text = () => JSON.stringify({coordinates: 'Game world: x east, y up, z south; sticks: x right, y down', desktop: snapshot(), game: gameText?.() || null});
  showPage('pause', false);
  requestAnimationFrame(poll);
}
