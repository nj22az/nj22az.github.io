// Adapted to JavaScript from Anidoodle film.ts. Copyright 2026 Alex Greenshpun. Apache-2.0.
// Changes: types removed; rendering algorithm preserved.
export const validate = (film) => {
  const p = [], { fps, bpm, durationFrames } = film.meta, beat = (60 / bpm) * fps, ids = new Set();
  if (!Number.isInteger(beat)) p.push(`bpm ${bpm} at ${fps} fps gives a ${beat}-frame beat: cuts cannot sit on whole frames`);
  let t = 0;
  [...film.shots].sort((a, b) => a.start - b.start).forEach((s) => {
    if (ids.has(s.id)) p.push(`duplicate shot id '${s.id}'`); ids.add(s.id);
    if (s.start !== t) p.push(`shot '${s.id}' starts at ${s.start}, expected ${t} (gap or overlap)`);
    if (s.end <= s.start) p.push(`shot '${s.id}' has no length`);
    if (Number.isInteger(beat) && s.start % beat) p.push(`shot '${s.id}' cuts off the beat grid (frame ${s.start}, beat = ${beat} frames)`);
    t = s.end;
  });
  if (t !== durationFrames) p.push(`shots end at frame ${t}, film is ${durationFrames}`);
  return p;
};

export const shotAt = (film, frame) => film.shots.find((s) => frame >= s.start && frame < s.end);
export const renderFrame = (film, ctx, frame, env) => {
  const s = shotAt(film, Math.max(0, Math.min(film.meta.durationFrames - 1, Math.round(frame))));
  if (!s) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.clearRect(0, 0, env.W * env.scale, env.H * env.scale);
  s.draw(ctx, frame - s.start, env);
  return s.id;
};
