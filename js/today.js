import { PROGRAM, MEALS, SLOTS, TARGETS } from './data.js';
import { wkey, logged, sessions, nextDay, programWeek, setsFor, suppsFor, suppProgress, dayTotals, dayFood, mealItems, sum, addDays, weekday, FOOD, label, loadingUntil } from './logic.js';
import { ctx, persist, changed } from './state.js';
import { $, esc, ck, icon, I, buzz, animate, ring, count } from './ui.js';
import { targets, toggleMeal } from './food.js';

const root = () => $('#v-today');
let pop = null;
const openNote = new Set();
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function renderToday() {
  const S = ctx.S, t = ctx.today;

  /* --- session --- */
  const nd = nextDay(S, t), P = PROGRAM[nd], W = S.workouts[wkey(t, nd)];
  const didToday = W && logged(W), week = programWeek(S, t);
  const nSets = P.ex.reduce((a, x) => a + setsFor(x, week, ctx.full), 0);
  const trained = new Set(sessions(S).filter(logged).map(w => w.date));
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const thisWeek = days.filter(d => trained.has(d)).length;
  const session = `<div class="hero rise" style="--i:0">
    <div class="next${didToday ? ' done' : ''}"><span class="day-badge">${nd}</span>
      <div class="grow"><div class="eyebrow">${didToday ? 'Logged today' : 'Next session'}</div>
        <h2 style="font-size:20px;margin-top:2px">${P.name}</h2>
        <div class="hint">${P.tag} · ${nSets} sets · ~55 min</div></div>
      <button class="btn sm" data-go="${nd}">${didToday ? 'Open' : 'Start'}</button></div>
    <div class="week">${days.map(d => `<div class="wd${trained.has(d) ? ' on' : ''}${d === t ? ' today' : ''}"><span>${DOW[weekday(d)]}</span><i></i></div>`).join('')}</div>
    <div class="hint" style="margin-top:10px">${thisWeek} of 4 sessions in the last 7 days</div></div>`;

  /* --- rings --- */
  const T = targets(), e = dayTotals(S, t).eaten, water = (S.water || {})[t] || 0;
  const rings = `<div class="card rise" style="--i:1"><div class="rings">
      <div class="ringbox">${ring('t-p', e.p / T.p, `<b>${count('tp', e.p)}</b><i>/ ${T.p} g</i>`, { color: e.p >= T.p * .95 ? 'var(--sage)' : 'var(--brass)' })}<span class="ring-l">Protein</span></div>
      <div class="ringbox">${ring('t-k', e.k / T.k, `<b>${count('tk', e.k)}</b><i>/ ${T.k}</i>`)}<span class="ring-l">Calories</span></div>
      <div class="ringbox"><button data-water="250" aria-label="Add 250 ml water">${ring('t-w', water / TARGETS.waterMl, `<b>${count('tw', water / 1000, 1)}</b><i>/ ${TARGETS.waterMl / 1000} L</i>`, { color: 'var(--sky)' })}</button><span class="ring-l">Water</span></div>
    </div>
    <div class="water-btns"><button class="chip" data-water="250">+ 250 ml</button><button class="chip" data-water="500">+ 500 ml</button><button class="chip" data-water="-250">− 250</button></div></div>`;

  /* --- next meal --- */
  const fd = dayFood(S, t), nextMeal = MEALS.find(m => !(fd.eat || {})[m.id]);
  let meal = '';
  if (nextMeal) {
    const items = mealItems(S, t, nextMeal.id), s = sum(items);
    meal = `<div class="card rise" style="--i:2"><div class="card-head"><h2>Next up: ${esc(nextMeal.t)}</h2><span class="eyebrow">${Math.round(s.k)} kcal · ${Math.round(s.p)} g P</span></div>
      <div class="hint" style="margin-bottom:12px">${items.map(i => esc(label(i.f, i.g))).join(' · ')}</div>
      <button class="btn quiet" data-ate="${nextMeal.id}">${icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>')} Ate it</button></div>`;
  } else {
    meal = `<div class="card rise" style="--i:2"><div class="row">${ck(true, 'sage')}<div><h2>All meals in</h2><div class="hint">${Math.round(e.p)} g protein today.</div></div></div></div>`;
  }

  /* --- supplements --- */
  const list = suppsFor(S, t), taken = (S.supps || {})[t] || {}, pr = suppProgress(S, t);
  const until = loadingUntil(S);
  const supps = `<div class="card rise" style="--i:3"><div class="card-head"><h2>Supplements</h2><span class="eyebrow">${pr.done}/${pr.total}</span></div>
    ${SLOTS.map(sl => {
      const xs = list.filter(x => x.slot === sl.id); if (!xs.length) return '';
      return `<div class="slot"><div class="slot-head"><span class="eyebrow" style="color:var(--brass)">${sl.t}</span><span class="eyebrow">${sl.sub}</span></div>
        ${xs.map(x => `<button class="supp${taken[x.id] ? ' on' : ''}${x.training && !taken[x.id] && !trained.has(t) ? ' skip' : ''}" data-supp="${x.id}">
            ${ck(!!taken[x.id], '', pop === x.id)}
            <span class="grow"><span class="t">${esc(x.n)}${x.id === 'd3' ? '<span class="confirm">confirm days</span>' : ''}</span>
            <span class="s" style="display:block">${esc(x.dose)}${x.load && until ? ' · until ' + until.slice(5).replace('-', '/') : ''}${x.training ? ' · training days' : ''}</span></span>
            <span class="icon-btn" data-note="${x.id}" role="button" aria-label="Why">${icon(I.info)}</span></button>
          <div class="supp-note${openNote.has(x.id) ? ' open' : ''}">${esc(x.note)}</div>`).join('')}</div>`;
    }).join('')}</div>`;

  root().innerHTML = session + rings + meal + supps;
  pop = null;
  animate(root());
}

export function bindToday(go) {
  root().addEventListener('click', e => {
    const n = e.target.closest('[data-note]');
    if (n) { e.stopPropagation(); const id = n.dataset.note; openNote.has(id) ? openNote.delete(id) : openNote.add(id); n.closest('.supp').nextElementSibling.classList.toggle('open'); return; }
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.go) { go(t.dataset.go); return; }
    if (t.dataset.water) {
      const S = ctx.S; S.water = S.water || {};
      S.water[ctx.today] = Math.max(0, (S.water[ctx.today] || 0) + +t.dataset.water);
      buzz(6); persist(); renderToday(); return;
    }
    if (t.dataset.ate) { toggleMeal(t.dataset.ate); return; }
    if (t.dataset.supp) {
      const S = ctx.S, id = t.dataset.supp; S.supps = S.supps || {};
      const d = S.supps[ctx.today] = S.supps[ctx.today] || {};
      if (d[id]) delete d[id]; else { d[id] = Date.now(); pop = id; buzz(10); }
      if (id.startsWith('creatine') && !S.settings.creatineStart) S.settings.creatineStart = ctx.today;
      persist(); renderToday(); return;
    }
  });
}
