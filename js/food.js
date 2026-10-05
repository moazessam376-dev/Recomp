import { MEALS, TARGETS, FOODS, RICE_SLOTS, SWAP_BY } from './data.js';
import { FOOD, planTotals, mealItems, dayFood, dayTotals, kcalTarget, sum, macros, swapGrams, swapOptions, fmtQty } from './logic.js';
import { ctx, persist, changed } from './state.js';
import { $, $$, esc, ck, icon, I, buzz, toast, sheet, closeSheet, sheetBody, animate, ring, bar, count } from './ui.js';

const root = () => $('#v-food');
let pop = null;

/* Calories, carbs and fat come from what the plan's meals add up to, so a
   fully ticked day lands on every target. Protein is a floor: the plan carries
   ~10 g over it on purpose. */
export function targets() {
  const pl = planTotals({ ...ctx.S, meals: {} }, ''), r5 = n => Math.round(n / 5) * 5;
  return { k: kcalTarget(ctx.S), p: TARGETS.p, c: r5(pl.c), f: r5(pl.f) };
}
function today() {
  const S = ctx.S, d = ctx.today;
  S.meals[d] = S.meals[d] || { eat: {}, sw: {}, add: [] };
  const o = S.meals[d]; o.eat = o.eat || {}; o.sw = o.sw || {}; o.add = o.add || [];
  return o;
}
const r0 = n => Math.round(n);

export function renderFood() {
  const S = ctx.S, d = dayFood(S, ctx.today), T = targets(), tot = dayTotals(S, ctx.today), e = tot.eaten, pl = tot.planned;

  const hero = `<div class="hero rise" style="--i:0"><div class="food-hero">
      ${ring('food-k', e.k / T.k, `<b>${count('fk', e.k)}</b><i>of ${T.k.toLocaleString('en-US')}</i>`, { cls: 'big', width: 9, color: e.k > T.k * 1.06 ? 'var(--clay)' : 'var(--brass)' })}
      <div class="bars">
        ${macroBar('Protein', 'p', e.p, T.p, pl.p)}
        ${macroBar('Carbs', 'c', e.c, T.c, pl.c)}
        ${macroBar('Fat', 'f', e.f, T.f, pl.f)}
      </div></div>
      <p class="why" style="margin-top:12px">Faint bar = where today lands if you eat everything planned.</p></div>`;

  const meals = MEALS.map((m, i) => {
    const on = !!(d.eat || {})[m.id], items = mealItems(S, ctx.today, m.id), s = sum(items);
    const sw = (d.sw || {})[m.id] || {};
    return `<div class="card meal${on ? ' on' : ''} rise" style="--i:${i + 1}">
      <button class="meal-head" data-eat="${m.id}">${ck(on, 'sage', pop === m.id)}
        <span class="grow"><span class="meal-t">${esc(m.t)}</span><span class="meal-s" style="display:block">${esc(m.hint)}</span></span>
        <span class="meal-k"><b>${r0(s.k)}</b>${r0(s.p)} g P</span></button>
      <div class="items">${items.map((it, n) => `<button class="item${sw[n] ? ' sw' : ''}" data-item="${m.id}:${n}"><b>${fmtQty(it.f, it.g)}</b>${esc(short(it.f))}</button>`).join('')}</div>
    </div>`;
  }).join('');

  const extras = (d.add || []).map((x, i) => {
    const m = x.f ? macros(x.f, x.g) : { k: +x.k || 0, p: +x.p || 0 };
    return `<div class="extra"><span class="grow"><span style="font-size:14px">${esc(x.f ? fmtQty(x.f, x.g) + ' ' + short(x.f) : x.n || 'Quick add')}</span>
      <span class="meal-s" style="display:block">${r0(m.k)} kcal · ${r0(m.p)} g protein</span></span>
      <button class="icon-btn" data-del="${i}" aria-label="Remove">${icon(I.x)}</button></div>`;
  }).join('');

  root().innerHTML = hero + meals +
    `<div class="card rise" style="--i:7"><div class="card-head"><h2>Extras</h2><span class="eyebrow">Anything off-plan</span></div>
      ${extras || '<div class="empty" style="padding:6px 0 14px">Nothing extra today.</div>'}
      <button class="btn quiet" data-addfood>${icon(I.plus)} Add food</button></div>
     <p class="why rise" style="--i:8">Tap a food to swap it or change the amount. A swap keeps the protein (or the carbs) the same, so the day still adds up.</p>`;
  pop = null;
  animate(root());
}
function macroBar(l, k, v, t, ghost) {
  return `<div class="bar"><div class="bar-top"><span class="eyebrow">${l}</span><span class="v">${r0(v)}<span> / ${t} g</span></span></div>${bar('food-' + k, v / t, ghost / t)}</div>`;
}
const short = fid => FOOD[fid] ? FOOD[fid].s : fid;
const name = fid => FOOD[fid] ? FOOD[fid].n.split(',')[0].replace(/ \(.*\)/, '').toLowerCase() : fid;

export function toggleMeal(mid) {
  const d = today(); d.eat[mid] = !d.eat[mid];
  if (d.eat[mid]) { buzz(10); pop = mid; }
  persist(); changed('food');
}

export function bindFood() {
  root().addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.eat) { toggleMeal(t.dataset.eat); return; }
    if (t.dataset.item) { const [m, n] = t.dataset.item.split(':'); itemSheet(m, +n); return; }
    if (t.dataset.del) { today().add.splice(+t.dataset.del, 1); persist(); changed('food'); return; }
    if ('addfood' in t.dataset) { addSheet(); return; }
  });
}

/* ============ swap / amount sheet ============ */
function itemSheet(mid, n) {
  const base = mealItems(ctx.S, ctx.today, mid)[n];
  if (!base || !FOOD[base.f]) { toast('That food is no longer in the list'); return; }
  const meal = MEALS.find(m => m.id === mid);
  let pick = { f: base.f, g: base.g };
  const opts = [FOOD[base.f], ...swapOptions(base.f)];
  const step = fid => FOOD[fid].u ? FOOD[fid].u.g : 10;
  const draw = () => {
    const m = macros(pick.f, pick.g), swapped = !!((dayFood(ctx.S, ctx.today).sw || {})[mid] || {})[n];
    const b = sheetBody(`
      <div class="eyebrow">${esc(meal.t)} · ${esc(FOOD[pick.f].n)}</div>
      <div class="stepper"><button data-dec>−</button><input class="inp" id="gramIn" inputmode="decimal" value="${Math.round(pick.g)}"><button data-inc>+</button></div>
      <div class="hint" style="margin:-6px 0 12px;text-align:center">${fmtQty(pick.f, pick.g)} · <b>${r0(m.k)} kcal</b> · ${r0(m.p)} P · ${r0(m.c)} C · ${r0(m.f)} F</div>
      <div style="display:flex;gap:8px"><button class="btn" data-today>Use today</button><button class="btn ghost" data-always>Always use</button></div>
      ${swapped ? '<button class="btn ghost" data-reset style="margin-top:8px">Back to the plan</button>' : ''}
      <span class="lbl" style="margin-top:18px">Swap for · same ${{ p: 'protein', c: 'carbs', f: 'fat', k: 'calories' }[SWAP_BY[FOOD[base.f].grp] || 'k']}</span>
      ${opts.map(f => {
        const g = f.id === base.f ? base.g : swapGrams(base.f, base.g, f.id), mm = macros(f.id, g);
        return `<button class="opt${f.id === pick.f ? ' sel' : ''}" data-opt="${f.id}" data-g="${g}"><span class="grow"><span class="t">${esc(f.n)}</span></span>
          <span class="r">${fmtQty(f.id, g)}<br>${r0(mm.k)} kcal · ${r0(mm.p)} P</span></button>`;
      }).join('')}`);
    $('[data-dec]', b).onclick = () => { pick.g = Math.max(0, pick.g - step(pick.f)); buzz(5); draw(); };
    $('[data-inc]', b).onclick = () => { pick.g += step(pick.f); buzz(5); draw(); };
    $('#gramIn', b).onchange = e => { const v = parseFloat(e.target.value); if (v >= 0) { pick.g = v; draw(); } };
    $$('[data-opt]', b).forEach(o => o.onclick = () => { pick = { f: o.dataset.opt, g: +o.dataset.g }; buzz(6); draw(); });
    $('[data-today]', b).onclick = () => {
      const d = today(); d.sw[mid] = d.sw[mid] || {}; d.sw[mid][n] = { ...pick };
      persist(); closeSheet(); changed('food'); toast('Swapped for today');
    };
    $('[data-always]', b).onclick = () => {
      const st = ctx.S.settings, items = mealItems({ ...ctx.S, meals: {} }, '', mid);
      items[n] = { ...pick };
      const saved = items.map(i => ({ ...i }));
      /* mealItems adds the check-in rice adjustment on top of the saved
         default, so take it back out here or it would be counted twice. */
      const adj = +st.riceAdj || 0, c = saved.find(i => FOOD[i.f] && FOOD[i.f].grp === 'carb');
      if (adj && c && RICE_SLOTS.includes(mid)) c.g = Math.max(0, c.g - adj * (FOOD.rice.c / FOOD[c.f].c));
      st.mealDefaults = st.mealDefaults || {}; st.mealDefaults[mid] = saved;
      const d = today(); if (d.sw[mid]) delete d.sw[mid][n];
      persist(); closeSheet(); changed('food'); toast('Saved as your default');
    };
    const rs = $('[data-reset]', b);
    if (rs) rs.onclick = () => { const d = today(); delete d.sw[mid][n]; persist(); closeSheet(); changed('food'); };
  };
  sheet('Change ' + esc(name(base.f)), '', () => draw());
}

/* ============ add food sheet ============ */
function addSheet() {
  let q = '', sel = null, g = 100;
  const recent = [...new Set(Object.values(ctx.S.meals || {}).flatMap(d => (d.add || []).filter(x => x.f).map(x => x.f)))].slice(-6).reverse();
  const draw = () => {
    const list = FOODS.filter(f => !q || f.n.toLowerCase().includes(q.toLowerCase()));
    const b = sheetBody(`
      <input class="inp search" id="fq" placeholder="Search foods" value="${esc(q)}" autocomplete="off">
      ${recent.length && !q ? `<div class="chips" style="margin:2px 0 8px">${recent.map(f => `<button class="chip" data-pick="${f}">${esc(name(f))}</button>`).join('')}</div>` : ''}
      ${sel ? `<div class="card" style="background:var(--sunk);margin:6px 0 10px"><div class="eyebrow">${esc(FOOD[sel].n)}</div>
          <div class="stepper"><button data-dec>−</button><input class="inp" id="ag" inputmode="decimal" value="${Math.round(g)}"><button data-inc>+</button></div>
          <div class="hint" style="margin:-6px 0 12px;text-align:center">${fmtQty(sel, g)} · <b>${r0(macros(sel, g).k)} kcal</b> · ${r0(macros(sel, g).p)} g protein</div>
          <button class="btn" data-add>Add</button></div>` : ''}
      ${list.map(f => `<button class="opt${f.id === sel ? ' sel' : ''}" data-pick="${f.id}"><span class="grow"><span class="t">${esc(f.n)}</span></span>
        <span class="r">${f.u ? '1 ' + f.u.n + ' · ' + r0(f.k * f.u.g / 100) : r0(f.k) + ' / 100 g'}</span></button>`).join('')}
      <span class="lbl" style="margin-top:18px">Or quick add</span>
      <div class="entry"><div class="field"><label>What</label><input class="inp txt" id="qn" placeholder="e.g. koshary"></div></div>
      <div class="entry"><div class="field"><label>kcal</label><input class="inp" id="qk" inputmode="numeric"></div>
        <div class="field"><label>Protein g</label><input class="inp" id="qp" inputmode="numeric"></div></div>
      <button class="btn ghost" data-quick>Add quick entry</button>`);
    const fq = $('#fq', b);
    fq.oninput = e => { q = e.target.value; const pos = e.target.selectionStart; draw(); const n = $('#fq'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-pick]', b).forEach(o => o.onclick = () => { sel = o.dataset.pick; g = FOOD[sel].u ? FOOD[sel].u.g : 100; buzz(5); draw(); $('#sheet .sheet-body').scrollTop = 0; });
    if (sel) {
      const st = FOOD[sel].u ? FOOD[sel].u.g : 10;
      $('[data-dec]', b).onclick = () => { g = Math.max(st, g - st); draw(); };
      $('[data-inc]', b).onclick = () => { g += st; draw(); };
      $('#ag', b).onchange = e => { const v = parseFloat(e.target.value); if (v > 0) { g = v; draw(); } };
      $('[data-add]', b).onclick = () => { today().add.push({ f: sel, g }); persist(); closeSheet(); changed('food'); toast('Added'); buzz(10); };
    }
    $('[data-quick]', b).onclick = () => {
      const k = parseFloat($('#qk', b).value), p = parseFloat($('#qp', b).value) || 0;
      if (!(k > 0)) { toast('Enter the calories'); return; }
      today().add.push({ n: $('#qn', b).value.trim() || 'Quick add', k, p }); persist(); closeSheet(); changed('food'); toast('Added');
    };
  };
  sheet('Add food', '', () => draw());
}
