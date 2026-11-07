// Nodal solver adapted from the owner's existing multimetersimulator/model.mjs. See tools/reference.
export function solve(net, extra = [], override = null) {
  const edges = [...net.edges, ...extra];
  const parent = Object.fromEntries(net.nodes.map(n => [n,n]));
  const root = n => parent[n] === n ? n : (parent[n] = root(parent[n]));
  for (const [a,b,r] of edges) if (r === 0) parent[root(a)] = root(b);
  const nodes = [...new Set(net.nodes.map(root))];
  const resistors = edges.filter(e => e[2] > 0).map(([a,b,r]) => [root(a),root(b),r]);
  const fixed = {};
  for (const [n,v] of Object.entries(override ?? net.fixed)) {
    const r = root(n);
    if (r in fixed && Math.abs(fixed[r]-v) > 1e-9) throw new Error('Conflicting ideal voltage sources');
    fixed[r] = v;
  }
  const reachable = new Set(Object.keys(fixed));
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a,b] of resistors) {
      if (reachable.has(a) && !reachable.has(b)) { reachable.add(b); changed = true; }
      if (reachable.has(b) && !reachable.has(a)) { reachable.add(a); changed = true; }
    }
  }
  const unknown = nodes.filter(n => reachable.has(n) && !(n in fixed));
  const idx = new Map(unknown.map((n,i) => [n,i]));
  const A = unknown.map(() => unknown.map(() => 0));
  const z = unknown.map(() => 0);
  for (const [a,b,r] of resistors) {
    if (a === b) continue;
    const g = 1/r;
    for (const [n,m] of [[a,b],[b,a]]) if (idx.has(n)) {
      const i = idx.get(n); A[i][i] += g;
      if (idx.has(m)) A[i][idx.get(m)] -= g;
      else if (m in fixed) z[i] += g*fixed[m];
    }
  }
  for (let col=0; col<z.length; col++) {
    let pivot = col;
    for (let row=col+1; row<z.length; row++) if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
    [A[col],A[pivot]] = [A[pivot],A[col]]; [z[col],z[pivot]] = [z[pivot],z[col]];
    if (Math.abs(A[col][col]) < 1e-15) throw new Error('Singular network');
    const divisor = A[col][col];
    for (let j=col; j<z.length; j++) A[col][j] /= divisor;
    z[col] /= divisor;
    for (let row=0; row<z.length; row++) if (row !== col) {
      const f = A[row][col];
      for (let j=col; j<z.length; j++) A[row][j] -= f*A[col][j];
      z[row] -= f*z[col];
    }
  }
  const voltages = {...fixed};
  unknown.forEach((n,i) => { voltages[n] = z[i]; });
  return { voltage: Object.fromEntries(net.nodes.map(n => [n, voltages[root(n)] ?? null])), root };
}
export function resistance(net, a, b) {
  const base = solve(net, [], {});
  if (base.root(a) === base.root(b)) return 0;
  const result = solve(net, [], {[a]:1,[b]:0});
  let current = 0;
  for (const [x,y,r] of net.edges) if (r > 0) {
    if (result.root(x) === result.root(a) && result.voltage[y] !== null) current += (1-result.voltage[y])/r;
    if (result.root(y) === result.root(a) && result.voltage[x] !== null) current += (1-result.voltage[x])/r;
  }
  return current > 1e-14 ? 1/current : Infinity;
}
