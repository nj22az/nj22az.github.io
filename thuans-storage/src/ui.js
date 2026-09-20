
const STORAGE_WON_KEY = 'johansson-town:storage-won';
function storageBridgeParams() {
  try {
    const q = new URLSearchParams(window.location.search);
    return {
      fromTown: q.get('from') === 'johansson-town',
      mode: q.get('mode') === 'auto' ? 'auto' : q.get('mode') === 'play' ? 'play' : null,
      day: Number.isFinite(Number(q.get('day'))) ? Number(q.get('day')) : null,
    };
  } catch {
    return { fromTown: false, mode: null, day: null };
  }
}
function writeStorageWonHandshake({ day, assisted }) {
  try {
    localStorage.setItem(
      STORAGE_WON_KEY,
      JSON.stringify({ day: day ?? Math.floor(Date.now() / 86400000), assisted: !!assisted, t: Date.now() }),
    );
  } catch {}
}
function returnToJohanssonTown() {
  window.location.href = '/johansson-town/';
}
// Touch ownership is per pointer: releasing Look must never stop Move or Run.
function createStorageTouchControls({ move, look, sprint, changed, activity }) {
  let movement = null, looking = null, runPointer = null;
  const publish = () => changed({
    move: movement ? { ...movement } : null,
    look: looking ? { ...looking } : null,
    running: runPointer !== null,
  });
  const endRun = () => { runPointer = null; sprint(false); };
  const update = (event) => {
    if (movement?.id === event.pointerId) {
      const x = (event.clientX - movement.startX) / 44;
      const y = (event.clientY - movement.startY) / 44;
      const length = Math.max(1, Math.hypot(x, y));
      movement.x = x / length; movement.y = y / length;
      move(movement.x, -movement.y);
    } else if (looking?.id === event.pointerId) {
      look((event.clientX - looking.lastX) * 2.15, (event.clientY - looking.lastY) * 2.15);
      looking.lastX = event.clientX; looking.lastY = event.clientY;
      looking.x = Math.max(-1, Math.min(1, (event.clientX - looking.startX) / 44));
      looking.y = Math.max(-1, Math.min(1, (event.clientY - looking.startY) / 44));
    } else return;
    event.preventDefault(); publish();
  };
  return {
    start(event) {
      if (event.pointerType !== 'touch') return;
      const rect = event.currentTarget.getBoundingClientRect();
      const isMove = event.clientX < rect.left + rect.width / 2;
      if ((isMove && movement) || (!isMove && looking)) return;
      const point = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
        ox: event.clientX - rect.left, oy: event.clientY - rect.top,
        lastX: event.clientX, lastY: event.clientY, x: 0, y: 0 };
      if (isMove) { movement = point; move(0, 0); } else looking = point;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault(); activity(); publish();
    },
    update,
    end(event) {
      if (movement?.id === event.pointerId) { movement = null; move(0, 0); endRun(); }
      else if (looking?.id === event.pointerId) looking = null;
      else if (runPointer === event.pointerId) endRun();
      else return;
      publish();
    },
    startRun(event) {
      if (!movement || runPointer !== null) return;
      event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
      runPointer = event.pointerId; sprint(true, event.pointerId); publish();
    },
    reset() { movement = looking = null; move(0, 0); endRun(); publish(); },
  };
}
function storageTouchIndicator(point, label) {
  return point && (0, $.jsx)('div', {
    className: 'storage-stick', 'aria-hidden': true, 'data-stick': label,
    style: { left: point.ox, top: point.oy },
    children: (0, $.jsx)('span', { style: { transform: `translate(${point.x * 26}px, ${point.y * 26}px)` } }),
  });
}
function yg() {
  let e = (0, C.useRef)(null),
    t = (0, C.useRef)(null),
    n = (0, C.useRef)(null),
    r = hm(),
    [i, a] = (0, C.useState)(`thuan`),
    [o, s] = (0, C.useState)(!1),
    [c, l] = (0, C.useState)(!0),
    [panel, setPanel] = (0, C.useState)(null),
    [touch, setTouch] = (0, C.useState)({ move: null, look: null, running: false }),
    gestures = (0, C.useRef)(null);
  if (!gestures.current) gestures.current = createStorageTouchControls({
    move: (x, y) => n.current?.setTouchMove(x, y),
    look: (x, y) => n.current?.setTouchLook(x, y),
    sprint: (held, id) => n.current?.setTouchSprint(held, id),
    changed: setTouch,
    activity: () => { setPanel(null); l(false); },
  });
  (0, C.useEffect)(() => {
    gestures.current.reset(); setPanel(null);
  }, [r.phase]);
  (0, C.useEffect)(() => {
    const reset = () => gestures.current.reset();
    const hide = () => { if (document.hidden) reset(); };
    const end = event => gestures.current.end(event);
    const keyboard = event => {
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) setPanel(null);
    };
    window.addEventListener('blur', reset);
    window.addEventListener('resize', reset);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('keydown', keyboard);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', reset);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('keydown', keyboard);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  (0, C.useEffect)(() => {
    if (r.moving && !r.autoRestocking) setPanel(null);
  }, [r.moving, r.autoRestocking]);
  ((0, C.useEffect)(() => {
    let e = window.matchMedia(`(any-pointer: coarse)`).matches || navigator.maxTouchPoints > 0;
    (s(e), hm.getState().setHud({ isTouch: e }));
  }, []),
    (0, C.useEffect)(() => {
      let r = e.current,
        i = t.current;
      if (!r || !i) return;
      let o = !1;
      return (
        (async () => {
          // Start with the animated stand-in while the original model loads.
          let e = null;
          if (!o)
            try {
              let t = om({
                canvas: r,
                minimap: i,
                gltf: e,
                onHud: (e) => {
                  let t = hm.getState();
                  (t.setHud(e), e.phase === `won` && !e.assisted && t.saveBest(e.time));
                  if (e.phase === `won` && storageBridgeParams().fromTown && !window.__storageWonPosted) {
                    window.__storageWonPosted = true;
                    const bridge = storageBridgeParams();
                    writeStorageWonHandshake({ day: bridge.day, assisted: !!e.assisted });
                    returnToJohanssonTown();
                  }
                },
              });
              if (o) {
                t.dispose();
                return;
              }
              ((n.current = t), a(`ready`));
              const bridge = storageBridgeParams();
              if (bridge.fromTown && bridge.mode === `auto`) {
                queueMicrotask(() => n.current?.autoRestock());
              } else if (bridge.fromTown && bridge.mode === `play`) {
                queueMicrotask(() => n.current?.start());
              }
            } catch (e) {
              console.error(`Stockroom failed to boot`, e);
              a(`error`);
            }
        })(),
        () => {
          ((o = !0), n.current?.dispose(), (n.current = null), a(`thuan`));
        }
      );
    }, []),
    (0, C.useEffect)(() => {
      if (r.phase !== `playing`) {
        l(!0);
        return;
      }
      let e = window.setTimeout(() => l(!1), 4200);
      return () => window.clearTimeout(e);
    }, [r.phase]),
    (0, C.useEffect)(() => {
      let e = (e) => {
        e.code === `Escape` &&
          hm.getState().phase === `playing` &&
          n.current?.pause();
      };
      return (
        window.addEventListener(`keydown`, e),
        () => window.removeEventListener(`keydown`, e)
      );
    }, []));
  const S = r.phase === 'playing';
  const showPanel = name => {
    gestures.current.reset();
    setPanel(current => current === name ? null : name);
  };
  return (0, $.jsxs)(`div`, {
    className: `relative h-dvh w-full overflow-hidden bg-ink text-paper`,
    children: [
      (0, $.jsx)(`canvas`, {
        ref: e,
        className: `absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing`,
        onContextMenu: (e) => e.preventDefault(),
        onPointerDown: event => {
          if (!S) return;
          setPanel(null);
          gestures.current.start(event);
        },
        onPointerMove: event => { if (S) gestures.current.update(event); },
        onPointerUp: event => gestures.current.end(event),
        onPointerCancel: event => gestures.current.end(event),
        onLostPointerCapture: event => gestures.current.end(event),
        onClick: () => {
          hm.getState().phase === `playing` &&
            (n.current?.requestLock(), l(!1));
        },
      }),
      S && !panel && r.reaction && (0,$.jsx)('p', {className:'storage-speech', 'aria-live':'polite', children:r.reaction}),
      S && !panel && r.guestPrompt && !r.reaction && (0,$.jsx)('p', {className:'storage-speech', 'aria-live':'polite', children:r.guestPrompt}),
      S && r.autoRestocking && (0,$.jsx)('button', {className:'storage-handover',onClick:()=>n.current?.takeControl(),children:'Thuan is restocking · Take control'}),
      i === 'error' && (0,$.jsxs)('div', {className:'storage-error',role:'alert',children:[
        (0,$.jsx)('p',{children:'This browser could not start the 3D stockroom. Open it in a browser with WebGL enabled, then reload.'}),
        (0,$.jsx)('button',{onClick:()=>window.location.reload(),children:'Reload game'})
      ]}),
      S && (0, $.jsxs)('nav', {
        className: 'storage-toolbar', 'aria-label': 'Stockroom controls',
        children: [
          (0, $.jsx)('button', { type: 'button', 'aria-label': 'Shopping list',
            'aria-expanded': panel === 'list', 'aria-controls': 'storage-list',
            onClick: () => showPanel('list'), children: `List ${r.collected}/${r.total}` }),
          (0, $.jsx)('button', { type: 'button', 'aria-expanded': panel === 'map',
            'aria-controls': 'storage-map', onClick: () => showPanel('map'), children: 'Map' }),
          (0, $.jsx)('button', { type: 'button', onClick: () => n.current?.pause(), children: 'Pause' }),
        ],
      }),
      S && panel === 'list' && (0, $.jsxs)('section', {
        id: 'storage-list', className: 'storage-details', 'aria-label': 'Shopping list details',
        children: [
          (0, $.jsxs)('header', { children: [
            (0, $.jsx)('strong', {children: `Collected ${r.collected} of ${r.total}`}),
            (0, $.jsx)('button', {type:'button',onClick:()=>setPanel(null),children:'Close'}),
          ] }),
          (0, $.jsx)('p', {className:'storage-meta',children:`${hg(r.time)} · ${r.zone}`}),
          (0, $.jsx)('ul', {children: r.list.map(item => (0, $.jsxs)('li', {
            className: item.taken ? 'storage-taken' : '',
            children: [(0, $.jsx)('span', {'aria-label':item.taken?'Collected':'Still needed',children:item.taken?'✓':'○'}),item.name],
          }, item.id))}),
        ],
      }),
      (0, $.jsxs)('section', {
        id:'storage-map',className:'storage-details storage-map',hidden:!S || panel !== 'map',
        'aria-label':'Stockroom map',
        children:[
          (0,$.jsxs)('header',{children:[
            (0,$.jsx)('strong',{children:r.zone || 'Stockroom'}),
            (0,$.jsx)('button',{type:'button',onClick:()=>setPanel(null),children:'Close'}),
          ]}),
          (0,$.jsx)('canvas',{ref:t,width:176,height:176,'aria-label':'Explored stockroom',role:'img'}),
        ],
      }),
      S && c && !panel && !r.autoRestocking && (0,$.jsx)('p',{
        className:'storage-hint',
        children:o?'Drag left to move · drag right to look':'WASD to walk · drag to look · hold Shift to run',
      }),
      S && r.readyToStock && !r.autoRestocking && !panel && (0,$.jsx)('p',{
        className:'storage-objective',children:'List complete · Return to the pink shop curtain',
      }),
      r.phase === `title` &&
        (0, $.jsx)(`div`, {
          className: `absolute inset-0 z-20 flex items-end justify-center bg-linear-to-t from-ink/95 via-ink/25 to-transparent p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-start sm:bg-linear-to-r sm:from-ink/90 sm:via-ink/40 sm:to-transparent sm:p-8`,
          children: (0, $.jsxs)(`div`, {
            className: `panel-enter stagger-in w-full max-w-md rounded-[32px] border border-paper/12 bg-ink/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8`,
            children: [
              (0, $.jsx)(`p`, {
                className: `text-xs font-semibold tracking-[0.22em] text-rose uppercase`,
                children: `Sakura Shōten · Stockroom shift`,
              }),
              (0, $.jsx)(`h1`, {
                className: `font-display mt-2 text-4xl leading-[1.05] font-semibold tracking-tight text-paper sm:text-5xl`,
                children: `Thuan's Storage`,
              }),
              (0, $.jsx)(`p`, {
                className: `mt-3 text-sm leading-relaxed text-muted sm:text-[0.95rem]`,
                children: `A new layout each shift. Help Thuan find six goods among the shelves, then bring them to the pink shop curtain.`,
              }),
              (0, $.jsxs)(`ul`, {
                className: `storage-help mt-4 space-y-1.5 text-sm text-paper-dim`,
                children: [
                  (0, $.jsx)(`li`, {
                    children: `WASD / arrows to walk · drag to look · scroll to zoom`,
                  }),
                  (0, $.jsx)(`li`, {
                    children: `Hold Shift to run · walk up to marked goods to collect`,
                  }),
                  (0, $.jsx)(`li`, {
                    children: `Touch: drag left to move · drag right to look · hold Run while moving`,
                  }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `mt-6 flex flex-col gap-3`,
                children: [
                  (0, $.jsx)(vg, {
                    className: `w-full`,
                    disabled: i !== `ready`,
                    onClick: () => n.current?.start(),
                    children: i === `ready` ? `Walk with Thuan` : i === `error` ? `3D unavailable` : `Opening stockroom`,
                  }),
                  (0, $.jsx)(vg, {
                    variant: `ghost`,
                    className: `w-full`,
                    disabled: i !== `ready`,
                    onClick: () => n.current?.autoRestock(),
                    children: `Let Thuan restock`,
                  }),
                  (0, $.jsxs)(vg, {
                    variant: `ghost`,
                    className: `w-full`,
                    onClick: () => {
                      let e = !r.muted;
                      (r.setHud({ muted: e }), n.current?.setMuted(e));
                    },
                    children: [
                      r.muted
                        ? (0, $.jsx)(ee, { className: `size-4` })
                        : (0, $.jsx)(j, { className: `size-4` }),
                      r.muted ? `Sound off` : `Sound on`,
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      r.phase === `paused` &&
        (0, $.jsx)(`div`, {
          className: `absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-5 backdrop-blur-[2px]`,
          children: (0, $.jsxs)(`div`, {
            className: `panel-enter w-full max-w-sm rounded-[28px] border border-paper/12 bg-ink-soft p-6`,
            children: [
              (0, $.jsx)(`p`, {
                className: `font-display text-3xl font-semibold`,
                children: `Paused`,
              }),
              (0, $.jsx)(`p`, {
                className: `mt-2 text-sm text-muted`,
                children: `The stockroom will wait.`,
              }),
              (0, $.jsxs)(`div`, {
                className: `mt-6 flex flex-col gap-3`,
                children: [
                  (0, $.jsx)(vg, {
                    onClick: () => n.current?.resume(),
                    children: `Resume`,
                  }),
                  (0, $.jsx)(vg, {
                    variant: `ghost`,
                    onClick: () => n.current?.restart(`same`),
                    children: `Restart`,
                  }),
                ],
              }),
            ],
          }),
        }),
      r.phase === `won` &&
        (0, $.jsx)(`div`, {
          className: `absolute inset-0 z-30 flex items-end justify-center bg-ink/40 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center`,
          children: (0, $.jsxs)(`div`, {
            className: `panel-enter stagger-in w-full max-w-md rounded-[32px] border border-paper/12 bg-ink/88 p-6 backdrop-blur-md sm:p-8`,
            children: [
              (0, $.jsx)(`p`, {
                className: `text-xs font-semibold tracking-[0.22em] text-rose uppercase`,
                children: `Restocked`,
              }),
              (0, $.jsx)(`h2`, {
                className: `font-display mt-2 text-3xl font-semibold sm:text-4xl`,
                children: `Sakura is open`,
              }),
              (0, $.jsx)(`p`, {
                className: `mt-3 text-[0.95rem] leading-relaxed text-paper-dim`,
                children: r.quote || `The till can wait. These boxes cannot.`,
              }),
              (0, $.jsxs)(`dl`, {
                className: `mt-6 grid grid-cols-2 gap-3`,
                children: [
                  (0, $.jsxs)(`div`, {
                    className: `rounded-2xl bg-paper/6 px-4 py-3`,
                    children: [
                      (0, $.jsx)(`dt`, {
                        className: `text-xs tracking-wide text-muted uppercase`,
                        children: `Time`,
                      }),
                      (0, $.jsx)(`dd`, {
                        className: `font-mono mt-1 text-lg`,
                        children: hg(r.time),
                      }),
                    ],
                  }),
                  (0, $.jsxs)(`div`, {
                    className: `rounded-2xl bg-paper/6 px-4 py-3`,
                    children: [
                      (0, $.jsx)(`dt`, {
                        className: `text-xs tracking-wide text-muted uppercase`,
                        children: `Fetched`,
                      }),
                      (0, $.jsxs)(`dd`, {
                        className: `font-mono mt-1 text-lg`,
                        children: [r.collected, `/`, r.total],
                      }),
                    ],
                  }),
                  (0, $.jsxs)(`div`, {
                    className: `col-span-2 rounded-2xl bg-paper/6 px-4 py-3`,
                    children: [
                      (0, $.jsx)(`dt`, {
                        className: `text-xs tracking-wide text-muted uppercase`,
                        children: `Best`,
                      }),
                      (0, $.jsx)(`dd`, {
                        className: `font-mono mt-1 text-lg`,
                        children: r.bestTime == null ? `—` : hg(r.bestTime),
                      }),
                    ],
                  }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `mt-6 flex flex-col gap-3 sm:flex-row`,
                children: [
                  (0, $.jsx)(vg, {
                    className: `flex-1`,
                    onClick: () => n.current?.restart(),
                    children: `New list`,
                  }),
                  (0, $.jsx)(vg, {
                    variant: `ghost`,
                    onClick: () => n.current?.restart(`same`),
                    children: `Same stockroom`,
                  }),
                ],
              }),
            ],
          }),
        }),
      S && storageTouchIndicator(touch.move, 'Move'),
      S && storageTouchIndicator(touch.look, 'Look'),
      S && touch.move && (0,$.jsx)('button', {
        type:'button',className:'storage-run','aria-label':'Hold to run',
        'aria-pressed':touch.running,
        onPointerDown:event=>gestures.current.startRun(event),
        onPointerUp:event=>gestures.current.end(event),
        onPointerCancel:event=>gestures.current.end(event),
        onLostPointerCapture:event=>gestures.current.end(event),
        children:'Run',
      }),
    ],
  });
}
(0, M.createRoot)(document.getElementById(`root`)).render(
  (0, $.jsx)(C.StrictMode, { children: (0, $.jsx)(yg, {}) }),
);
