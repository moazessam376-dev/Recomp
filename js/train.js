import { PROGRAM, ORDER, RAMP_WEEKS } from './data.js';
import { wkey, lastFor, suggest, setsFor, programWeek, isDone, logged, sessionStats, EX, daysBetween } from './logic.js';
import { ctx, persist, changed } from './state.js';
import { $, $$, esc, ck, icon, I, buzz, toast, sheet, closeSheet, animate, count, reduced } from './ui.js';

const root = () => $('#v-train');
const open = new Set();
let pop = null;           // the set whose check just turned on, for its animation

const reps = x => (x.lo === x.hi ? x.lo : x.lo + '–' + x.hi) + (x.unit === 'm' ? ' m' : x.unit ? ' / ' + x.unit : '');
const kg = v => (Math.round(v * 100) / 100).toString();

function workout(day, make) {
  const k = wkey(ctx.today, day), S = ctx.S;
  if (!S.workouts[k] && make) S.workouts[k] = { day, date: ctx.today, e: {} };
  return S.workouts[k];
}

export function renderTrain() {
  const S = ctx.S, day = ctx.selDay, P = PROGRAM[day], key = wkey(ctx.today, day);
  const cur = (S.workouts[key] || {}).e || {};
  const week = programWeek(S, ctx.today), ramp = week < RAMP_WEEKS;
  const idx = ORDER.indexOf(day);

  let total = 0, done = 0;
  P.ex.forEach(x => { const n = setsFor(x, week, ctx.full); total += n; done += Math.min(n, (cur[x.id] || []).filter(isDone).length); });

  const seg = `<div class="seg rise" style="--i:0"><span class="ind" style="transform:translateX(${idx * 100}%)"></span>
    ${ORDER.map(d => {
      const w = S.workouts[wkey(ctx.today, d)];
      return `<button data-day="${d}" class="${d === day ? 'sel' : ''}${w && logged(w) ? ' did' : ''}"><i class="dot"></i>
        <span class="l">${d}</span><span class="n">${PROGRAM[d].tag}</span></button>`;
    }).join('')}</div>`;

  const banner = ramp ? `<div class="banner rise" style="--i:1"><div><b>Ramp week ${week + 1} of ${RAMP_WEEKS}.</b>
      ${ctx.full ? 'Showing full sets.' : 'One set fewer on everything.'} Leave about 3 reps in the tank while the soreness settles.</div>
      <button class="chip" data-full>${ctx.full ? 'Ramp sets' : 'Full sets'}</button></div>` : '';

  const prog = `<div class="sess-prog rise" style="--i:2"><span class="eyebrow">${P.name} · ${P.tag}</span>
    <div class="track"><div class="fill${done && done >= total ? ' hit' : ''}" data-bar="sess:${key}" data-to="${total ? done / total : 0}"></div></div>
    <span class="num small muted">${done}/${total}</span></div>`;

  let html = '', i = 0, num = 0;
  const list = P.ex;
  while (i < list.length) {
    const g = list[i].ss;
    if (g) {
      const grp = []; while (i < list.length && list[i].ss === g) grp.push(list[i++]);
      html += `<div class="block ss"><div class="ss-tag">${icon(I.swap)} Superset · alternate, rest after the pair</div>${grp.map(x => item(x, ++num)).join('')}</div>`;
    } else html += `<div class="block">${item(list[i++], ++num)}</div>`;
  }

  const anyDone = done > 0;
  root().innerHTML = seg + banner + prog +
    `<div class="card tight rise" style="--i:3">${html}</div>
     <button class="btn${anyDone ? '' : ' ghost'} rise" style="--i:4" data-finish ${anyDone ? '' : 'disabled'}>${anyDone ? 'Finish session' : 'Log a set to start'}</button>
     <p class="why rise" style="--i:5">Tap ✓ on a set to log it. Empty boxes take the suggested numbers, and the rest timer starts on its own.</p>`;
  pop = null;
  animate(root());

  function item(x, n) {
    const ns = setsFor(x, week, ctx.full);
    const arr = cur[x.id] || [];
    const dn = arr.filter(isDone).length;
    const L = lastFor(S, x.id, key), sg = suggest(x, L);
    const neckBW = x.neck && ramp;
    const C = 2 * Math.PI * 12, r = Math.min(1, dn / ns);
    let hint;
    if (neckBW) hint = 'Bodyweight only in weeks 1–2. Slow and controlled.';
    else if (!L) hint = x.bw ? `Aim for ${reps(x)} reps.` : `First time: pick a weight you could lift for ~3 more reps than the target.`;
    else {
      const when = daysBetween(L.date, ctx.today);
      const last = L.sets.map(v => (v.w ? kg(v.w) : 'BW') + '×' + (v.r || '–')).join('  ');
      hint = `<span class="faint">Last${when ? ' · ' + (when === 1 ? 'yesterday' : when + ' days ago') : ''}</span> ${esc(last)}<br>` +
        (sg.up ? `<span class="up">↑ Every set hit ${x.hi}. Go up to <b>${sg.w} kg</b>, aim ${x.lo}+.</span>`
               : `Today: <b>${sg.w ? sg.w + ' kg' : 'same load'}</b>, beat ${sg.r} reps.`);
    }
    const sets = Array.from({ length: ns }, (_, s) => {
      const v = arr[s] || {}, d = isDone(v);
      /* Later sets default to the set before them in this session: you
         usually keep the weight you just used, not last week's. */
      const prev = s > 0 ? arr[s - 1] : null;
      const pw = prev && prev.w ? prev.w : sg.w, pr = prev && prev.r ? prev.r : sg.r;
      const ph = neckBW || x.bw ? (prev && prev.w ? prev.w : 'BW') : (pw || 'kg');
      return `<div class="set${d ? ' done' : ''}"><span class="set-n">${s + 1}</span>
        <input class="inp" inputmode="decimal" placeholder="${ph}" data-day="${ctx.selDay}" data-id="${x.id}" data-s="${s}" data-f="w" value="${esc(v.w || '')}">
        <span class="set-x">×</span>
        <input class="inp" inputmode="numeric" placeholder="${pr || x.lo}" data-day="${ctx.selDay}" data-id="${x.id}" data-s="${s}" data-f="r" value="${esc(v.r || '')}">
        <button data-tick="${x.id}" data-s="${s}" aria-label="Log set ${s + 1}">${ck(d, 'sage', pop && pop.id === x.id && pop.s === s)}</button></div>`;
    }).join('');
    return `<div class="ex${open.has(x.id) ? ' open' : ''}" data-ex="${x.id}">
      <button class="ex-head" data-toggle="${x.id}"><span class="ex-idx num">${String(n).padStart(2, '0')}</span>
        <span class="ex-name">${esc(x.n)}<em>${ns} × ${reps(x)}${sg.up && !neckBW ? ' · <span class="up">↑ ' + sg.w + ' kg</span>' : ''}</em></span>
        <span class="mini${dn >= ns ? ' full' : ''}"><svg viewBox="0 0 30 30"><circle class="bg" cx="15" cy="15" r="12"/>
          <circle class="fg" cx="15" cy="15" r="12" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - r)}"/></svg><span>${dn}/${ns}</span></span>
      </button>
      <div class="ex-body"><div><div class="ex-inner">
        <div class="form-row"><button class="thumb" data-form="${x.id}" aria-label="Form photos"><img src="img/ex/${x.id}-0.jpg" alt="" loading="lazy"></button>
          <div class="hint grow">${hint}</div></div>
        ${sets}
        <div class="ex-tools"><button class="chip" data-form="${x.id}">Form &amp; cues</button>${L ? `<button class="chip" data-fill="${x.id}">Fill from last</button>` : ''}</div>
      </div></div></div></div>`;
  }
}

/* ============ events (bound once, delegated) ============ */
export function bindTrain() {
  const r = root();
  r.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.day) { ctx.selDay = t.dataset.day; renderTrain(); return; }
    if ('full' in t.dataset) { ctx.full = !ctx.full; renderTrain(); return; }
    if (t.dataset.toggle) {
      const id = t.dataset.toggle, el = t.closest('.ex');
      if (open.has(id)) open.delete(id); else open.add(id);
      el.classList.toggle('open', open.has(id));
      return;
    }
    if (t.dataset.form) { showForm(t.dataset.form); return; }
    if (t.dataset.fill) { fillLast(t.dataset.fill); return; }
    if (t.dataset.tick) { tick(t.dataset.tick, +t.dataset.s, t); return; }
    if ('finish' in t.dataset) { finish(); return; }
  });
  /* Each input carries the day it was rendered for. Re-rendering drops a
     focused input, which fires change afterwards - by then selDay may be the
     day just tapped, and the set would land in the wrong session. */
  r.addEventListener('change', e => {
    const el = e.target; if (!el.dataset || !el.dataset.f) return;
    const { day, id, s, f } = el.dataset, W = workout(day, true);
    W.e[id] = W.e[id] || []; W.e[id][s] = W.e[id][s] || { d: 0 };   // typed is not logged
    W.e[id][s][f] = el.value.trim().replace(',', '.');
    persist();
  });
}

function tick(id, s, btn) {
  const row = btn.closest('.set');
  const [wi, ri] = $$('.inp', row);
  const day = wi.dataset.day, W = workout(day, true);
  W.e[id] = W.e[id] || [];
  const v = W.e[id][s] = W.e[id][s] || {};
  if (isDone(v)) { v.d = 0; persist(); changed('train'); return; }
  const w = wi.value.trim() || (wi.placeholder !== 'kg' && wi.placeholder !== 'BW' ? wi.placeholder : '');
  const rr = ri.value.trim() || ri.placeholder;
  v.w = w.replace(',', '.'); v.r = rr; v.d = 1; v.t = Date.now();
  buzz(12); unlockAudio();
  pop = { id, s };
  persist(); changed('train');   // re-renders Train (with the pop) and Today
  const x = EX[id], week = programWeek(ctx.S, ctx.today);
  const doneN = W.e[id].filter(isDone).length, ns = setsFor(x, week, ctx.full);
  // Superset: after the first exercise, walk straight to its partner.
  const list = PROGRAM[day].ex, i = list.findIndex(e => e.id === id);
  const partner = x.ss && list[i + 1] && list[i + 1].ss === x.ss ? list[i + 1] : null;
  if (partner) startRest(x.rest, 'Now: ' + partner.n.split(' (')[0]);
  else if (doneN >= ns) {
    const next = list.slice(i + 1).find(e => (W.e[e.id] || []).filter(isDone).length < setsFor(e, week, ctx.full));
    startRest(x.rest, next ? 'Next: ' + next.n.split(' (')[0] : 'Last set done');
  } else startRest(x.rest, 'Rest · set ' + (doneN + 1) + ' next');
}

function fillLast(id) {
  const L = lastFor(ctx.S, id, wkey(ctx.today, ctx.selDay)); if (!L) return;
  const W = workout(ctx.selDay, true), arr = W.e[id] = W.e[id] || [];
  L.sets.forEach((v, s) => { arr[s] = Object.assign({ d: 0 }, arr[s], { w: v.w, r: v.r }); });
  persist(); open.add(id); renderTrain(); toast('Filled from last session');
}

/* ============ form sheet ============ */
function showForm(id) {
  const x = EX[id];
  sheet(esc(x.n), `<div class="demo" data-demo><img src="img/ex/${id}-0.jpg" alt="${esc(x.n)}, start"><img class="b" src="img/ex/${id}-1.jpg" alt="${esc(x.n)}, finish">
      <span class="lbl">Start ⇄ finish · tap to ${reduced() ? 'flip' : 'pause'}</span></div>
    <div class="eyebrow" style="margin-bottom:6px">${esc(x.m)}</div>
    <div class="hint" style="margin-bottom:10px">${x.s} × ${reps(x)} · rest ${x.rest >= 60 ? Math.round(x.rest / 60 * 10) / 10 + ' min' : 'walk straight to the partner'}</div>
    <ol class="cues">${x.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
    <p class="credit">Photos from free-exercise-db (public domain). They show the movement; your cues above win where they differ.</p>`,
  body => {
    const d = $('[data-demo]', body);
    // With reduced motion there is no crossfade: a tap flips start and finish instead.
    d.onclick = () => d.classList.toggle(reduced() ? 'end' : 'paused');
  });
}

/* ============ finish ============ */
function finish() {
  const key = wkey(ctx.today, ctx.selDay), W = ctx.S.workouts[key]; if (!W) return;
  W.fin = Date.now(); persist();
  const st = sessionStats(ctx.S, key);
  const ts = Object.values(W.e).flat().filter(v => v && v.t).map(v => v.t);
  const mins = ts.length > 1 ? Math.round((Math.max(...ts) - Math.min(...ts)) / 6e4) + 2 : null;
  const dots = Array.from({ length: 10 }, (_, i) => {
    const a = i / 10 * Math.PI * 2;
    return `<i class="spark-dot" style="--x:${Math.cos(a) * 60}px;--y:${Math.sin(a) * 60}px"></i>`;
  }).join('');
  sheet('Session logged', `<div class="summary">
      <div class="burst"><svg viewBox="0 0 84 84"><circle class="c" cx="42" cy="42" r="38"/><path class="k" d="M26 43l11 11 21-23"/></svg>${dots}</div>
      <div class="eyebrow">${PROGRAM[ctx.selDay].name} · ${PROGRAM[ctx.selDay].tag}</div>
      <div class="big">${count('vol:' + key, st.vol)}<span class="small muted"> kg</span></div>
      <div class="eyebrow" style="margin-bottom:16px">Total volume</div>
      <div class="figs" style="text-align:left">
        <div class="fig"><span class="fig-v">${st.sets}</span><span class="fig-l">Sets</span></div>
        <div class="fig"><span class="fig-v">${mins ? mins + ' min' : '—'}</span><span class="fig-l">Duration</span></div>
        <div class="fig"><span class="fig-v">${st.prs.length}</span><span class="fig-l">Best ever</span></div>
      </div>
      ${st.prs.length ? `<p class="why" style="text-align:left">New best estimated 1-rep max on ${st.prs.map(id => esc(EX[id].n)).join(', ')}.</p>` : ''}
      <p class="why" style="text-align:left">Eat the next meal within a couple of hours, and get the protein in. Total daily protein matters more than exact timing.</p>
      <button class="btn" data-close style="margin-top:14px">Done</button></div>`,
  body => { animate(body); $('[data-close]', body).onclick = () => { closeSheet(); document.querySelector('.tab[data-v="today"]').click(); }; });
  stopRest();
  changed('train');
}

/* ============ rest timer ============ */
let T = null, iv = null, ac = null, wake = null;
function unlockAudio() {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {}
}
function beep() {
  if (!ac) return;
  try {
    [0, .18, .36].forEach((d, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = i === 2 ? 1175 : 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ac.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + d + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d + .15);
      o.connect(g).connect(ac.destination); o.start(ac.currentTime + d); o.stop(ac.currentTime + d + .16);
    });
  } catch (e) {}
}
async function keepAwake(on) {
  try {
    if (on && !wake && navigator.wakeLock) wake = await navigator.wakeLock.request('screen');
    if (!on && wake) { await wake.release(); wake = null; }
  } catch (e) { wake = null; }
}
function startRest(sec, label) {
  T = { end: Date.now() + sec * 1000, total: sec, label, rang: false };
  const el = $('#timer'); el.classList.remove('ding'); el.classList.add('show'); document.body.classList.add('resting');
  keepAwake(true);
  clearInterval(iv); iv = setInterval(drawRest, 250); drawRest();
}
function stopRest() {
  clearInterval(iv); iv = null; T = null;
  $('#timer').classList.remove('show', 'ding'); document.body.classList.remove('resting'); keepAwake(false);
}
function drawRest() {
  if (!T) return;
  const el = $('#timer'), left = Math.max(0, T.end - Date.now()), s = Math.ceil(left / 1000);
  const C = 2 * Math.PI * 15, r = T.total ? left / (T.total * 1000) : 0;
  if (!el.firstChild) {
    el.innerHTML = `<div class="tr"><svg viewBox="0 0 38 38"><circle class="bg" cx="19" cy="19" r="15"/><circle class="fg" cx="19" cy="19" r="15" stroke-dasharray="${C}"/></svg></div>
      <div><span class="tt num"></span><span class="tl"></span></div>
      <button class="chip" data-add>+15</button><button class="chip" data-skip>${s ? 'Skip' : 'OK'}</button>`;
    $('[data-add]', el).onclick = () => { if (T) { T.end = Math.max(T.end, Date.now()) + 15000; T.total += 15; T.rang = false; el.classList.remove('ding'); } };
    $('[data-skip]', el).onclick = stopRest;
  }
  $('.fg', el).style.strokeDashoffset = C * (1 - r);
  $('.tt', el).textContent = s ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : 'Go';
  $('.tl', el).textContent = T.label;
  $('[data-skip]', el).textContent = s ? 'Skip' : 'OK';
  if (!s && !T.rang) {
    T.rang = true; el.classList.add('ding'); buzz([60, 80, 60]); beep();
    setTimeout(() => { if (T && T.rang && T.end <= Date.now()) stopRest(); }, 6000);
  }
}
