
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
function yg() {
  let e = (0, C.useRef)(null),
    t = (0, C.useRef)(null),
    n = (0, C.useRef)(null),
    r = hm(),
    [i, a] = (0, C.useState)(`thuan`),
    [o, s] = (0, C.useState)(!1),
    [c, l] = (0, C.useState)(!0),
    u = (0, C.useRef)({ id: -1, x: 0, y: 0, ox: 0, oy: 0 }),
    [d, f] = (0, C.useState)({ x: 0, y: 0, active: !1 }),
    p = (0, C.useRef)({ id: -1, x: 0, y: 0 }),
    [m, h] = (0, C.useState)({ x: 0, y: 0, active: !1 });
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
  let g = (e) => {
      let t = e.currentTarget.getBoundingClientRect();
      ((u.current = {
        id: e.pointerId,
        x: 0,
        y: 0,
        ox: t.left + t.width / 2,
        oy: t.top + t.height / 2,
      }),
        e.currentTarget.setPointerCapture(e.pointerId),
        f({ x: 0, y: 0, active: !0 }));
      _(e);
    },
    _ = (e) => {
      if (u.current.id !== e.pointerId) return;
      let t = (e.clientX - u.current.ox) / 48,
        r = (e.clientY - u.current.oy) / 48,
        i = Math.hypot(t, r) || 1,
        a = i > 1 ? t / i : t,
        o = i > 1 ? r / i : r;
      (f({ x: a, y: o, active: !0 }), n.current?.setTouchMove(a, -o));
    },
    v = () => {
      ((u.current.id = -1),
        f({ x: 0, y: 0, active: !1 }),
        n.current?.setTouchMove(0, 0));
    },
    y = (e) => {
      ((p.current = { id: e.pointerId, x: e.clientX, y: e.clientY }),
        e.currentTarget.setPointerCapture(e.pointerId),
        h({ x: 0, y: 0, active: !0 }));
    },
    b = (e) => {
      if (p.current.id !== e.pointerId) return;
      let t = e.clientX - p.current.x,
        r = e.clientY - p.current.y;
      ((p.current.x = e.clientX),
        (p.current.y = e.clientY),
        n.current?.setTouchLook(t * 2.15, r * 2.15),
        h((e) => ({
          x: Math.max(-1, Math.min(1, e.x + t / 48)),
          y: Math.max(-1, Math.min(1, e.y + r / 48)),
          active: !0,
        })));
    },
    x = () => {
      ((p.current.id = -1), h({ x: 0, y: 0, active: !1 }));
    },
    S = r.phase === `playing`,
    w = r.phase === `playing` || r.phase === `paused`;
  return (0, $.jsxs)(`div`, {
    className: `relative h-dvh w-full overflow-hidden bg-ink text-paper`,
    children: [
      (0, $.jsx)(`canvas`, {
        ref: e,
        className: `absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing`,
        onContextMenu: (e) => e.preventDefault(),
        onClick: () => {
          hm.getState().phase === `playing` &&
            (n.current?.requestLock(), l(!1));
        },
      }),
      S && r.reaction && (0,$.jsx)('p', {className:'storage-speech', 'aria-live':'polite', children:r.reaction}),
      S && r.guestPrompt && !r.reaction && (0,$.jsx)('p', {className:'storage-speech', 'aria-live':'polite', children:r.guestPrompt}),
      S && r.autoRestocking && (0,$.jsx)('button', {className:'storage-handover',onClick:()=>n.current?.takeControl(),children:'Thuan is restocking · Take control'}),
      i === 'error' && (0,$.jsxs)('div', {className:'storage-error',role:'alert',children:[
        (0,$.jsx)('p',{children:'This browser could not start the 3D stockroom. Open it in a browser with WebGL enabled, then reload.'}),
        (0,$.jsx)('button',{onClick:()=>window.location.reload(),children:'Reload game'})
      ]}),
      w &&
        (0, $.jsxs)(`div`, {
          className: `pointer-events-none absolute inset-0 z-10 p-3 sm:p-5`,
          children: [
            (0, $.jsx)(`div`, {
              className: `flex items-start justify-between gap-3`,
              children: (0, $.jsxs)(`div`, {
                className: `storage-checklist flex max-w-[min(100%,18rem)] flex-col gap-2`,
                children: [
                  (0, $.jsxs)(`div`, {
                    className: `hud-chip font-mono text-sm`,
                    children: [
                      (0, $.jsx)(D, {
                        className: `size-4 text-rose`,
                        strokeWidth: 2,
                      }),
                      (0, $.jsx)(`span`, { children: hg(r.time) }),
                    ],
                  }),
                  (0, $.jsxs)(`div`, {
                    className: `hud-chip font-mono text-sm`,
                    children: [
                      (0, $.jsx)(k, {
                        className: `size-4 text-rose`,
                        strokeWidth: 2,
                      }),
                      (0, $.jsxs)(`span`, {
                        children: [r.collected, `/`, r.total],
                      }),
                    ],
                  }),
                  (0, $.jsxs)(`div`, {
                    className: `hud-chip text-xs tracking-wide uppercase`,
                    children: [
                      (0, $.jsx)(O, {
                        className: `size-3.5 text-rose`,
                        strokeWidth: 2,
                      }),
                      r.zone,
                    ],
                  }),
                  (0, $.jsx)(`ul`, {
                    className: `flex w-full flex-col gap-1 rounded-[20px] border border-paper/12 bg-ink/72 p-3 backdrop-blur-md`,
                    children: r.list.map((e) =>
                      (0, $.jsxs)(
                        `li`,
                        {
                          className: `flex items-center gap-2 text-sm ${e.taken ? `text-muted line-through` : `text-paper`}`,
                          children: [
                            (0, $.jsx)(E, {
                              className: `size-3.5 ${e.taken ? `text-harbour` : `text-paper/25`}`,
                              strokeWidth: 2.4,
                            }),
                            e.name,
                          ],
                        },
                        e.id,
                      ),
                    ),
                  }),
                ],
              }),
            }),
            S &&
              !o &&
              c &&
              !r.pointerLocked &&
              !r.readyToStock &&
              (0, $.jsx)(`p`, {
                className: `pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-paper/10 bg-ink/55 px-3 py-1 text-xs tracking-wide text-paper-dim uppercase`,
                children: `Click to look · WASD to walk`,
              }),
            r.readyToStock && !r.autoRestocking &&
              (0, $.jsx)(`p`, {
                className: `storage-objective absolute bottom-6 left-1/2 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-rose/30 bg-ink/80 px-4 py-2 text-center text-sm text-paper`,
                children: `List complete. Return to the pink shop curtain.`,
              }),
          ],
        }),
      (0, $.jsx)(`canvas`, {
        ref: t,
        width: 176,
        height: 176,
        className: `pointer-events-none absolute top-3 right-3 z-20 size-[120px] rounded-full sm:top-5 sm:right-5 sm:size-[168px] ${w ? `` : `hidden`}`,
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
                    children: `Shift to run · walk up to marked goods to collect`,
                  }),
                  (0, $.jsx)(`li`, {
                    children: `Touch: Move and Look pads · hold Run to hurry`,
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
      S &&
        (0, $.jsx)(`button`, {
          type: `button`,
          "aria-label": `Pause`,
          className: `absolute top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-20 hidden size-11 -translate-x-1/2 items-center justify-center rounded-2xl border border-paper/12 bg-ink/70 text-paper sm:flex`,
          onClick: () => n.current?.pause(),
          children: (0, $.jsx)(A, { className: `size-4` }),
        }),
      o &&
        S &&
        (0, $.jsxs)($.Fragment, {
          children: [
            (0, $.jsx)(`div`, {
              className: `absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-20 size-[112px] touch-none rounded-full border border-paper/15 bg-ink/40`,
              onPointerDown: g,
              onPointerMove: _,
              onPointerUp: v,
              onPointerCancel: v,
              onLostPointerCapture: v,
              "aria-label": "Move",
              role: "group",
              children: (0, $.jsx)(`div`, {
                className: `absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/85`,
                style: {
                  transform: `translate(calc(-50% + ${d.x * 28}px), calc(-50% + ${d.y * 28}px))`,
                  opacity: d.active ? 1 : 0.7,
                },
              }),
            }),
            (0, $.jsx)(`div`, {
              className: `absolute right-5 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-20 size-[112px] touch-none rounded-full border border-paper/15 bg-ink/40`,
              onPointerDown: y,
              onPointerMove: b,
              onPointerUp: x,
              onPointerCancel: x,
              onLostPointerCapture: x,
              "aria-label": "Look",
              role: "group",
              children: (0, $.jsx)(`div`, {
                className: `absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/70`,
                style: {
                  transform: `translate(calc(-50% + ${m.x * 28}px), calc(-50% + ${m.y * 28}px))`,
                  opacity: m.active ? 1 : 0.7,
                },
              }),
            }),
            (0, $.jsx)(`button`, {
              type: `button`,
              className: `absolute right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 h-12 min-w-20 rounded-2xl border border-paper/15 bg-ink/55 px-4 text-sm font-semibold`,
              onPointerDown: (event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); n.current?.setTouchSprint(!0); },
              onPointerUp: () => n.current?.setTouchSprint(!1),
              onPointerCancel: () => n.current?.setTouchSprint(!1),
              onLostPointerCapture: () => n.current?.setTouchSprint(!1),
              style: {touchAction:"none",userSelect:"none"},
              children: `Run`,
            }),
            (0, $.jsx)(`button`, {
              type: `button`,
              className: `absolute top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-paper/12 bg-ink/70 px-3 py-2 text-sm`,
              onClick: () => n.current?.pause(),
              children: `Pause`,
            }),
          ],
        }),
    ],
  });
}
(0, M.createRoot)(document.getElementById(`root`)).render(
  (0, $.jsx)(C.StrictMode, { children: (0, $.jsx)(yg, {}) }),
);
