import { WAIST0 } from './data.js';
import { trend, weeklyRate, checkIn, waistChange, RICE_STEP, kcalTarget, daysBetween } from './logic.js';
import { ctx, persist, changed } from './state.js';
import { $, esc, toast, buzz, sheet, closeSheet, animate, count } from './ui.js';

const root = () => $('#v-body');
const f1 = v => (v == null ? '—' : (+v).toFixed(1));

export function renderBody() {
  const S = ctx.S, tr = trend(S), last = tr[tr.length - 1], rate = weeklyRate(tr);
  const ws = Object.keys(S.body).sort().filter(d => S.body[d].wa), cw = ws.length ? S.body[ws[ws.length - 1]].wa : null;
  const ib = (S.inbody || []).slice().sort((a, b) => a.d < b.d ? -1 : 1), lib = ib[ib.length - 1], pib = ib[ib.length - 2];

  const hero = `<div class="hero rise" style="--i:0">
    <div class="eyebrow">Trend weight</div>
    <div class="big-figs"><span class="big-v">${last ? count('tw-t', last.t, 1, false) : '—'}<small>kg</small></span>
      <span class="delta num ${rate == null ? '' : rate < -0.2 ? 'upc' : 'down'}" style="padding-bottom:6px">${rate == null ? '' : (rate > 0 ? '+' : '') + rate.toFixed(2) + ' kg/wk'}</span></div>
    <div class="figs">
      <div class="fig"><span class="fig-v">${last ? f1(last.w) : '—'}</span><span class="fig-l">Latest</span></div>
      <div class="fig"><span class="fig-v">${f1(cw)}</span><span class="fig-l">Waist cm</span></div>
      <div class="fig"><span class="fig-v ${cw && cw < WAIST0 ? 'down' : ''}">${cw ? (cw - WAIST0 > 0 ? '+' : '') + (cw - WAIST0).toFixed(1) : '—'}</span><span class="fig-l">Waist vs Aug</span></div>
    </div></div>`;

  const log = `<div class="card rise" style="--i:1"><div class="card-head"><h2>Log today</h2><span class="eyebrow">Morning · after the bathroom</span></div>
    <div class="entry"><div class="field"><label>Weight kg</label><input class="inp" id="iw" inputmode="decimal" placeholder="${last ? f1(last.w) : '100.0'}" value="${S.body[ctx.today] && S.body[ctx.today].w ? S.body[ctx.today].w : ''}"></div>
      <div class="field"><label>Waist cm · navel</label><input class="inp" id="iwa" inputmode="decimal" placeholder="${f1(cw || WAIST0)}" value="${S.body[ctx.today] && S.body[ctx.today].wa ? S.body[ctx.today].wa : ''}"></div></div>
    <button class="btn" data-save>Save</button>
    <p class="why">Weigh daily if you can, waist once a week. Single weigh-ins swing ±1 kg with water, salt and creatine; the trend line smooths that out.</p></div>`;

  const chart = `<div class="card rise" style="--i:2"><div class="card-head"><h2>Weight</h2><span class="eyebrow">Dots = scale · line = trend</span></div>${drawChart(tr)}</div>`;

  const ci = checkIn(S, ctx.today), adj = +S.settings.riceAdj || 0;
  const V = {
    wait: ['Building the trend', `Needs about 2 weeks of weigh-ins before it can say anything. ${tr.length} so far.`],
    hold: ['On track: hold', ci.loading && ci.rate > 0.3 ? 'Weight is up, but creatine loading puts 1–2 kg of water into the muscle in the first weeks. That is not fat. Hold the plan and watch the waist.' : 'Weight is steady or climbing slowly. That is the recomp working. Keep the plan as it is and watch the waist.'],
    add: ['You are losing weight', 'The trend is dropping faster than 0.2 kg a week. You want to hold, so add ~150 kcal of rice (about 60 g cooked at lunch and at dinner).'],
    cut: ['Gaining fast, waist up', 'Weight is climbing over 0.5 kg a week and the waist is up more than 1 cm. Take ~150 kcal of rice back out.']
  }[ci.state];
  const checkin = `<div class="card rise" style="--i:3"><div class="card-head"><h2>Check-in</h2><span class="eyebrow">${kcalTarget(S).toLocaleString('en-US')} kcal now</span></div>
    <div class="verdict ${ci.state}"><span class="dot"></span><div class="grow"><h3>${V[0]}</h3><p class="why" style="margin-top:4px">${V[1]}</p>
    ${ci.wc != null ? `<div class="hint">Waist over 3 weeks: ${(ci.wc > 0 ? '+' : '') + ci.wc.toFixed(1)} cm</div>` : ''}</div></div>
    ${ci.state === 'add' || ci.state === 'cut' ? `<button class="btn" data-adj="${ci.state === 'add' ? 1 : -1}" style="margin-top:12px">${ci.state === 'add' ? 'Add' : 'Remove'} 150 kcal of rice</button>` : ''}
    ${adj ? `<div class="hint" style="margin-top:10px">Rice adjusted ${adj > 0 ? '+' : ''}${Math.round(adj)} g at lunch and at dinner. <button class="link" data-adj="0">Reset</button></div>` : ''}</div>`;

  const scan = lib ? `<div class="card rise" style="--i:4"><div class="card-head"><h2>InBody</h2><span class="eyebrow">${lib.d}</span></div>
    <div class="ib-grid">
      ${ibCell('Weight', lib.w, pib && pib.w, 'kg', 0)}
      ${ibCell('Muscle', lib.smm, pib && pib.smm, 'kg', 1)}
      ${ibCell('Body fat', lib.pbf, pib && pib.pbf, '%', -1)}
      ${ibCell('Fat mass', lib.bfm, pib && pib.bfm, 'kg', -1)}
      ${ibCell('Visceral', lib.vf, pib && pib.vf, '', -1)}
      ${ibCell('Waist', lib.waist, pib && pib.waist, 'cm', -1)}
    </div>
    ${lib.d === '2026-08-11' ? '<p class="why">Since this scan: ~7 weeks off and about +7.5 kg, likely mostly fat, water and glycogen. A new scan now would give a true starting line. Same machine, morning, before food.</p>' : ''}
    <button class="btn ghost" data-scan>Add an InBody scan</button></div>` : '';

  const ds = Object.keys(S.body).sort().reverse().slice(0, 14);
  const hist = `<div class="card rise" style="--i:5"><div class="card-head"><h2>History</h2></div>
    ${ds.length ? ds.map(d => { const b = S.body[d]; return `<div class="hist"><span>${d}</span><span>${b.w ? f1(b.w) + ' kg' : '—'}${b.wa ? '   ' + f1(b.wa) + ' cm' : ''}</span></div>`; }).join('')
      : '<div class="empty">No measurements yet.<br>Weigh in tomorrow morning to start the line.</div>'}</div>`;

  root().innerHTML = hero + log + chart + checkin + scan + hist;
  animate(root());
}
function ibCell(l, v, p, u, good) {
  if (v == null) return `<div class="ib"><b>—</b><span>${l}</span></div>`;
  let d = '';
  if (p != null) {
    const x = v - p, cls = !good || Math.abs(x) < .05 ? 'faint' : (x * good > 0 ? 'down' : 'upc');
    d = `<i class="${cls}">${x > 0 ? '+' : ''}${x.toFixed(1)}</i>`;
  }
  return `<div class="ib"><b>${(+v).toFixed(v % 1 ? 1 : 0)}<small class="faint" style="font-size:10px"> ${u}</small>${d}</b><span>${l}</span></div>`;
}

function drawChart(tr) {
  if (tr.length < 2) return '<div class="empty">Two weigh-ins draw the line.</div>';
  const p = tr.slice(-45), W = 320, H = 150, pad = 18;
  const vals = p.flatMap(x => [x.w, x.t]), mn = Math.min(...vals) - .3, mx = Math.max(...vals) + .3, rg = mx - mn || 1;
  const span = Math.max(1, daysBetween(p[0].d, p[p.length - 1].d));
  const X = d => pad + daysBetween(p[0].d, d) / span * (W - pad * 2), Y = w => H - 16 - (w - mn) / rg * (H - 30);
  const line = p.map((x, i) => `${i ? 'L' : 'M'}${X(x.d).toFixed(1)},${Y(x.t).toFixed(1)}`).join(' ');
  let len = 0; for (let i = 1; i < p.length; i++) len += Math.hypot(X(p[i].d) - X(p[i - 1].d), Y(p[i].t) - Y(p[i - 1].t));
  const grid = [0, .5, 1].map(f => { const v = mn + rg * f, y = Y(v); return `<line class="grid" x1="${pad}" x2="${W - pad}" y1="${y}" y2="${y}"/><text x="${W - pad + 3}" y="${y + 3}">${v.toFixed(1)}</text>`; }).join('');
  const lt = p[p.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${grid}
    ${p.map(x => `<circle class="pt" cx="${X(x.d).toFixed(1)}" cy="${Y(x.w).toFixed(1)}" r="2"/>`).join('')}
    <path class="tl draw" d="${line}" style="--len:${Math.ceil(len)}"/>
    <circle cx="${X(lt.d)}" cy="${Y(lt.t)}" r="4" fill="var(--brass)"/>
    <text x="${pad}" y="${H - 2}">${p[0].d.slice(5)}</text><text x="${W - pad}" y="${H - 2}" text-anchor="end">${lt.d.slice(5)}</text></svg>`;
}

export function bindBody() {
  root().addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if ('save' in t.dataset) {
      const w = parseFloat($('#iw').value.replace(',', '.')), wa = parseFloat($('#iwa').value.replace(',', '.'));
      if (!(w > 0) && !(wa > 0)) { toast('Enter a number first'); return; }
      if ((w && (w < 40 || w > 250)) || (wa && (wa < 50 || wa > 200))) { toast('That number looks off'); return; }
      ctx.S.body[ctx.today] = Object.assign({}, ctx.S.body[ctx.today], w > 0 ? { w } : {}, wa > 0 ? { wa } : {});
      buzz(10); persist(); changed('body'); toast('Saved'); return;
    }
    if (t.dataset.adj != null) {
      const st = ctx.S.settings, v = +t.dataset.adj;
      st.riceAdj = v === 0 ? 0 : (+st.riceAdj || 0) + v * RICE_STEP / 2;
      persist(); changed('food'); toast(v === 0 ? 'Rice back to the plan' : 'Plan updated: ' + kcalTarget(ctx.S) + ' kcal'); return;
    }
    if ('scan' in t.dataset) { scanSheet(); return; }
  });
}

function scanSheet() {
  const F = [['w', 'Weight kg'], ['smm', 'Skeletal muscle kg'], ['bfm', 'Body fat mass kg'], ['pbf', 'Body fat %'], ['vf', 'Visceral level'], ['waist', 'Waist cm']];
  sheet('Add InBody scan', `<div class="field"><label>Date</label><input class="inp txt" id="sd" type="date" value="${ctx.today}"></div>
    <div class="ib-grid" style="grid-template-columns:1fr 1fr;margin-top:10px">${F.map(([k, l]) => `<div class="field"><label>${l}</label><input class="inp" data-k="${k}" inputmode="decimal"></div>`).join('')}</div>
    <button class="btn" data-sv style="margin-top:14px">Save scan</button>`, b => {
    $('[data-sv]', b).onclick = () => {
      const o = { d: $('#sd', b).value || ctx.today };
      b.querySelectorAll('[data-k]').forEach(i => { const v = parseFloat(i.value.replace(',', '.')); if (v > 0) o[i.dataset.k] = v; });
      if (Object.keys(o).length < 2) { toast('Enter at least one number'); return; }
      ctx.S.inbody = (ctx.S.inbody || []).filter(x => x.d !== o.d).concat(o);
      persist(); closeSheet(); changed('body'); toast('Scan saved');
    };
  });
}
