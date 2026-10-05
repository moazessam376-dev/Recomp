/* Pure functions over the saved state. No DOM, no storage - so every rule the
   app applies (progression, ramp weeks, macros, swaps, trend, check-ins) can be
   tested in Node with `node --test`. */
import {
  PROGRAM, ORDER, RAMP_WEEKS, FOODS, MEALS, RICE_SLOTS, SWAP_BY, SWAP_POOL,
  SUPPS, CREATINE_LOAD_DAYS, INBODY_SEED
} from './data.js';

export const FOOD = Object.fromEntries(FOODS.map(f => [f.id, f]));
export const EX = Object.fromEntries(
  Object.entries(PROGRAM).flatMap(([day, d]) => d.ex.map(x => [x.id, { ...x, day }])));

/* ============ dates ============ */
export function iso(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
export function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d);
}
export function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
}
export function weekday(isoDate) { return new Date(isoDate + 'T12:00:00').getDay(); }

/* ============ state shape ============ */
export function blank() {
  return { v: 2, workouts: {}, food: {}, body: {}, meals: {}, supps: {}, water: {}, inbody: INBODY_SEED.slice(), settings: {} };
}

/* The order sets were stored against before ids existed (3-day plan, v0). */
const LEGACY_ORDER = {
  A: ['smith-squat', 'cs-row', 'incline-db-press', 'seated-leg-curl', 'lateral-raise', 'neck-extension', 'wrist-curl', 'lying-leg-raise'],
  B: ['rdl', 'lat-pulldown', 'shoulder-press', 'leg-press', 'hammer-curl', 'neck-flexion', 'farmers-carry', 'cable-crunch'],
  C: ['back-extension', 'hs-incline-press', 'sa-lat-row', 'bulgarian-split', 'rear-delt-flye', 'cable-pushdown', 'neck-side-flexion', 'reverse-curl', 'pallof-press']
};
export const wkey = (date, day) => date + '|' + day;

/* Returns [state, changed]. Old 3-day sessions (days A/B/C) are kept as they
   are: they are history, and the exercise ids they share with the new split
   still feed "last time" and progression. */
export function migrate(d) {
  if (!d || typeof d !== 'object') return [blank(), false];
  let changed = false;
  const out = {};
  for (const k in d.workouts || {}) {
    const v = d.workouts[k] || {};
    if (k.indexOf('|') > -1) { out[k] = v; continue; }
    out[wkey(k, v.day || 'A')] = { day: v.day || 'A', date: k, e: v.e || {} };
    changed = true;
  }
  for (const k in out) {
    const w = out[k], e = w.e || {}, order = LEGACY_ORDER[w.day] || [];
    const fixed = {}; let moved = false;
    for (const slot in e) {
      if (/^\d+$/.test(slot)) { const id = order[+slot]; if (id) fixed[id] = e[slot]; moved = true; }
      else fixed[slot] = e[slot];
    }
    if (moved) { w.e = fixed; changed = true; }
  }
  const s = Object.assign(blank(), d, { workouts: out });
  if (d.v !== 2) { s.v = 2; changed = true; }
  if (!Array.isArray(d.inbody)) { s.inbody = INBODY_SEED.slice(); changed = true; }
  s.settings = Object.assign({}, d.settings);
  return [s, changed];
}

/* ============ training ============ */
/* A set is done when ticked. Sets from the old app carry no `d` flag at all -
   back then anything typed was the log - so only those fall back to their
   numbers (reps alone counts: bodyweight leg raises had no weight). */
export const isDone = x => !!x && ('d' in x ? !!x.d : !!(x.w || x.r));

export function sessions(S) {
  return Object.keys(S.workouts)
    .map(k => Object.assign({ key: k, date: k.slice(0, 10) }, S.workouts[k]))
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}
export function logged(w) { return Object.keys(w.e || {}).some(i => (w.e[i] || []).some(isDone)); }

/* The most recent earlier session that has this exercise in it, from any day -
   so a lift carried over from the 3-day plan keeps its history. */
export function lastFor(S, id, excludeKey) {
  const prev = sessions(S).filter(w => w.key !== excludeKey);
  for (let j = prev.length - 1; j >= 0; j--) {
    const s = (prev[j].e || {})[id];
    if (s && s.some(isDone)) return { sets: s.filter(isDone), date: prev[j].date };
  }
  return null;
}

/* Double progression: work up the rep range at one load; once every set
   reaches the top, go up by the smallest step and start from the bottom. */
export function suggest(ex, last) {
  if (!last) return { w: '', r: ex.lo, up: false, first: true };
  const sets = last.sets.filter(x => x.w || x.r);
  const ws = sets.map(x => parseFloat(x.w)).filter(n => n > 0);
  const w = ws.length ? Math.max(...ws) : 0;
  const top = sets.filter(x => (parseFloat(x.w) || 0) >= w);
  const allTop = top.length >= Math.min(ex.s, sets.length) && top.every(x => (parseInt(x.r) || 0) >= ex.hi);
  if (allTop && ex.inc && w > 0) return { w: round(w + ex.inc), r: ex.lo, up: true };
  const best = Math.max(...top.map(x => parseInt(x.r) || 0), 0);
  return { w: w || '', r: Math.min(ex.hi, Math.max(ex.lo, best + 1)), up: false };
}
const round = n => Math.round(n * 100) / 100;

export function e1rm(w, r) { w = parseFloat(w); r = parseInt(r); return w > 0 && r > 0 ? w * (1 + r / 30) : 0; }

export function isNewProgram(day) { return ORDER.includes(day); }
export function programStart(S) {
  const first = sessions(S).find(w => isNewProgram(w.day) && logged(w));
  return first ? first.date : null;
}
/* 0-based week of the new program, counted from its first logged session. */
export function programWeek(S, today) {
  const st = programStart(S);
  return st ? Math.floor(daysBetween(st, today) / 7) : 0;
}
export function setsFor(ex, week, full) {
  return !full && week < RAMP_WEEKS ? Math.max(1, ex.s - 1) : ex.s;
}

export function nextDay(S, today) {
  const ss = sessions(S).filter(w => isNewProgram(w.day) && logged(w));
  const t = ss.filter(w => w.date === today);
  if (t.length) return t[t.length - 1].day;
  if (!ss.length) return ORDER[0];
  return ORDER[(ORDER.indexOf(ss[ss.length - 1].day) + 1) % ORDER.length];
}

export function sessionStats(S, key) {
  const w = S.workouts[key]; if (!w) return { sets: 0, vol: 0, prs: [] };
  let sets = 0, vol = 0; const prs = [];
  for (const id in w.e || {}) {
    const done = (w.e[id] || []).filter(isDone);
    sets += done.length;
    vol += done.reduce((a, x) => a + (parseFloat(x.w) || 0) * (parseInt(x.r) || 0), 0);
    const best = Math.max(0, ...done.map(x => e1rm(x.w, x.r)));
    if (!best) continue;
    const before = Math.max(0, ...sessions(S).filter(s => s.date < w.date)
      .flatMap(s => ((s.e || {})[id] || []).filter(isDone).map(x => e1rm(x.w, x.r))));
    if (before && best > before) prs.push(id);
  }
  return { sets, vol: Math.round(vol), prs };
}

/* ============ food ============ */
export function macros(fid, g) {
  const f = FOOD[fid]; if (!f) return { k: 0, p: 0, c: 0, f: 0 };
  const m = g / 100;
  return { k: f.k * m, p: f.p * m, c: f.c * m, f: f.f * m };
}
const add = (a, b) => ({ k: a.k + b.k, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f });
const ZERO = { k: 0, p: 0, c: 0, f: 0 };
export const sum = items => items.reduce((a, i) => add(a, i.f ? macros(i.f, i.g) : { k: +i.k || 0, p: +i.p || 0, c: +i.c || 0, f: +i.fat || 0 }), ZERO);

/* A meal's items for a date: the plan default, then any saved default
   (`settings.mealDefaults`), then the check-in rice adjustment, then that
   day's own swaps. */
export function mealItems(S, date, mid) {
  const m = MEALS.find(x => x.id === mid); if (!m) return [];
  const st = S.settings || {};
  let items = ((st.mealDefaults || {})[mid] || m.items).map(i => ({ ...i }));
  const adj = +st.riceAdj || 0;
  if (adj && RICE_SLOTS.includes(mid)) {
    const r = items.find(i => FOOD[i.f] && FOOD[i.f].grp === 'carb');
    if (r) r.g = Math.max(0, r.g + adj * (FOOD.rice.c / FOOD[r.f].c));
  }
  const sw = (((S.meals || {})[date] || {}).sw || {})[mid];
  if (sw) items = items.map((i, n) => sw[n] ? { ...sw[n] } : i);
  return items;
}
export function dayFood(S, date) { return (S.meals || {})[date] || { eat: {}, sw: {}, add: [] }; }

export function dayTotals(S, date) {
  const d = dayFood(S, date);
  const eaten = MEALS.filter(m => (d.eat || {})[m.id]).reduce((a, m) => add(a, sum(mealItems(S, date, m.id))), ZERO);
  const extra = sum(d.add || []);
  return { eaten: add(eaten, extra), planned: add(planTotals(S, date), extra) };
}
export function planTotals(S, date) {
  return MEALS.reduce((a, m) => add(a, sum(mealItems(S, date, m.id))), ZERO);
}
/* The calorie target is whatever the default plan adds up to, so ticking every
   meal always lands on target and a check-in that adds rice moves both. */
export function kcalTarget(S) { return Math.round(planTotals({ ...S, meals: {} }, '').k / 10) * 10; }

/* Grams of `to` that carry the same amount of the macro the slot is built on. */
export function swapGrams(fromId, g, toId) {
  const a = FOOD[fromId], b = FOOD[toId]; if (!a || !b) return g;
  const by = SWAP_BY[a.grp] || 'k';
  const need = a[by] * g / 100;
  if (!b[by]) return g;
  let out = need / b[by] * 100;
  if (b.u) out = Math.max(1, Math.round(out / b.u.g)) * b.u.g;
  else out = Math.round(out / 5) * 5;
  return out;
}
export function swapOptions(fid) {
  const f = FOOD[fid]; if (!f) return [];
  const pool = SWAP_POOL[f.grp] || [f.grp];
  return FOODS.filter(x => x.id !== fid && pool.includes(x.grp));
}
const plural = u => ({ tsp: 'tsp', tbsp: 'tbsp', loaf: 'loaves' }[u] || u + 's');
/* "4 eggs", "3 slices toast", "200 g chicken breast". */
export function label(fid, g) { const f = FOOD[fid]; return (fmtQty(fid, g) + ' ' + (f ? f.s : fid)).trim(); }
export function fmtQty(fid, g) {
  const f = FOOD[fid];
  if (f && f.u) {
    const n = Math.round(g / f.u.g * 10) / 10;
    if (Math.abs(n - Math.round(n)) < .05) { const k = Math.round(n); return k + ' ' + (k === 1 ? f.u.n : plural(f.u.n)); }
  }
  return Math.round(g) + ' g';
}

/* ============ supplements ============ */
export function suppList(S) { return (S.settings && S.settings.supps) || SUPPS; }
/* Loading runs 14 days from the first creatine tick. Until that first tick it
   has not started, so the loading dose is shown (and the clock not running). */
export function loadingUntil(S) {
  const st = S.settings || {};
  return st.creatineStart ? addDays(st.creatineStart, CREATINE_LOAD_DAYS) : null;
}
export function suppsFor(S, date) {
  const dow = weekday(date), until = loadingUntil(S) || addDays(date, 1);
  return suppList(S).filter(x => x.days.includes(dow) && (!x.load || (until && date < until)));
}
/* Pre-training items only count once there is a session logged that day. */
export function suppProgress(S, date) {
  const list = suppsFor(S, date), taken = (S.supps || {})[date] || {};
  const trained = sessions(S).some(w => w.date === date && logged(w));
  const counted = list.filter(x => !x.training || trained || taken[x.id]);
  return { done: counted.filter(x => taken[x.id]).length, total: counted.length };
}

/* ============ body ============ */
/* Exponentially smoothed weight (10% per day, as in The Hacker's Diet): the
   daily number swings with water and salt; the trend is what moved. */
export function trend(S) {
  const pts = Object.keys(S.body).sort().filter(d => S.body[d].w).map(d => ({ d, w: S.body[d].w }));
  let t = null, prev = null;
  return pts.map(p => {
    if (t === null) t = p.w;
    else { const gap = Math.max(1, daysBetween(prev, p.d)); const a = 1 - Math.pow(0.9, gap); t = t + a * (p.w - t); }
    prev = p.d;
    return { d: p.d, w: p.w, t };
  });
}
/* kg per week, least-squares over the trend in the last `days` days. */
export function weeklyRate(tr, days = 21) {
  if (tr.length < 2) return null;
  const end = tr[tr.length - 1].d, pts = tr.filter(p => daysBetween(p.d, end) <= days);
  if (pts.length < 8 || daysBetween(pts[0].d, end) < 14) return null;
  const xs = pts.map(p => daysBetween(pts[0].d, p.d)), ys = pts.map(p => p.t);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  let nu = 0, de = 0;
  xs.forEach((x, i) => { nu += (x - mx) * (ys[i] - my); de += (x - mx) ** 2; });
  return de ? nu / de * 7 : null;
}
export function waistChange(S, days = 21) {
  const ds = Object.keys(S.body).sort().filter(d => S.body[d].wa);
  if (ds.length < 2) return null;
  const end = ds[ds.length - 1], start = ds.find(d => daysBetween(d, end) <= days);
  if (!start || start === end) return null;
  return S.body[end].wa - S.body[start].wa;
}
/* The goal is to hold or gain slowly while the waist comes in - never to lose.
   Each verdict moves the plan by ~150 kcal of rice (115 g cooked). */
export const RICE_STEP = 115;
/* Creatine loading puts 1-2 kg of water into muscle in the first weeks. That
   is not fat, so no cut is suggested until a week after loading ends. Waist
   must grow by more than 1 cm - smaller changes are tape noise. */
export function checkIn(S, today) {
  const rate = weeklyRate(trend(S)), wc = waistChange(S), until = loadingUntil(S);
  const loading = !!(until && today && today < addDays(until, 7));
  if (rate === null) return { state: 'wait', rate, wc, loading };
  if (rate < -0.2) return { state: 'add', rate, wc, loading };
  if (rate > 0.5 && !loading && wc !== null && wc > 1) return { state: 'cut', rate, wc, loading };
  return { state: 'hold', rate, wc, loading };
}
