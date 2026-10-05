import { iso, nextDay, programWeek, wkey } from './logic.js';
import { RAMP_WEEKS } from './data.js';
import { ctx, boot, persist, onChange } from './state.js';
import { $, $$, closeSheet } from './ui.js';
import { renderToday, bindToday } from './today.js';
import { renderTrain, bindTrain } from './train.js';
import { renderFood, bindFood } from './food.js';
import { renderBody, bindBody } from './body.js';
import { renderPlan, bindPlan } from './plan.js';

const VIEWS = ['today', 'train', 'food', 'body', 'plan'];
const RENDER = { today: renderToday, train: renderTrain, food: renderFood, body: renderBody, plan: renderPlan };
let cur = 'today';

function renderHead() {
  const dt = new Date(), h = dt.getHours();
  $('#datestr').textContent = dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  $('#greet').textContent = (h < 5 ? 'Late one' : h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening') + ', Moaaz';
  const w = programWeek(ctx.S, ctx.today);
  $('#weektag').textContent = 'Week ' + (w + 1) + (w < RAMP_WEEKS ? ' · ramp' : '');
}
function renderAll() { renderHead(); VIEWS.forEach(v => RENDER[v]()); }

/* Only what a change touches is re-rendered; the rest catch up when shown. */
const AFFECTS = { train: ['today', 'train'], food: ['today', 'food', 'body', 'plan'], body: ['body'], supps: ['today', 'plan'], all: VIEWS };
onChange(what => {
  (AFFECTS[what] || VIEWS).forEach(v => RENDER[v]());
  renderHead();
});

function show(v, opts = {}) {
  if (!VIEWS.includes(v)) v = 'today';
  const from = VIEWS.indexOf(cur), to = VIEWS.indexOf(v);
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.v === v));
  $('#navind').style.transform = `translateX(${to * 100}%)`;
  $$('.view').forEach(x => x.classList.remove('on', 'enter'));
  const el = $('#v-' + v);
  if (opts.render !== false) RENDER[v]();
  el.style.setProperty('--dx', (to >= from ? 14 : -14) + 'px');
  el.classList.add('on');
  void el.offsetWidth;            // restart the entrance animation
  el.classList.add('enter');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('enter'), 900);
  $('main').scrollTop = 0;
  cur = v;
  try { sessionStorage.setItem('recomp:tab', v); } catch (e) {}
}

/* `today` is read once at load, but a phone keeps the app alive for days. A set
   logged after midnight must not land on yesterday's date. */
function checkRollover() {
  const now = iso(new Date());
  if (now === ctx.today) return;
  /* ...but a session still running past midnight stays on the day it began.
     Otherwise unlocking the phone at 00:02 mid-rest would split it in two. */
  const W = ctx.S.workouts[wkey(ctx.today, ctx.selDay)];
  const last = W && !W.fin ? Math.max(0, ...Object.values(W.e || {}).flat().map(v => (v && v.t) || 0)) : 0;
  if (last && Date.now() - last < 3 * 36e5) return;
  ctx.today = now;
  ctx.selDay = nextDay(ctx.S, now);
  renderAll();
}

(async function start() {
  await boot();
  ctx.selDay = nextDay(ctx.S, ctx.today);
  bindToday(day => { ctx.selDay = day; show('train'); });
  bindTrain(); bindFood(); bindBody(); bindPlan();
  $$('.tab').forEach(b => b.onclick = () => { if (b.dataset.v !== cur) show(b.dataset.v); else $('main').scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#scrim').onclick = closeSheet;
  renderAll();
  let first = 'today';
  try { first = sessionStorage.getItem('recomp:tab') || 'today'; } catch (e) {}
  cur = first; show(first, { render: false });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkRollover(); });
  window.addEventListener('focus', checkRollover);
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
