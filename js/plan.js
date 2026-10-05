import { PROGRAM, ORDER, SUPPS, SLOTS, TARGETS } from './data.js';
import { suppList, kcalTarget } from './logic.js';
import { ctx, persist, changed, replace } from './state.js';
import { $, $$, esc, icon, I, toast, sheet, closeSheet } from './ui.js';
import { targets } from './food.js';

const root = () => $('#v-plan');
const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const row = (a, b) => `<div class="plan-row"><span>${a}</span><b>${b}</b></div>`;

/* Hard sets per muscle per week at full volume, counted from PROGRAM by hand
   and kept beside it - the why text below quotes these. */
const VOLUME = [
  ['Back (rows + pulldowns)', 12], ['Quads', 11], ['Hamstrings', '9 + RDL'], ['Chest', '8 + shoulder press'],
  ['Side + rear delts', 8], ['Biceps / triceps', '4–5 each + compounds'], ['Calves', 6], ['Abs / core', 11], ['Neck, forearms', '2× a week']
];

export function renderPlan() {
  const T = targets(), list = suppList(ctx.S);
  root().innerHTML = `
  <div class="card rise" style="--i:0"><div class="plan-sec"><h3>Your numbers</h3>
    ${row('Calories', T.k.toLocaleString('en-US') + ' kcal')}
    ${row('Protein', T.p + ' g')}
    ${row('Carbs', '~' + T.c + ' g')}
    ${row('Fat', '~' + T.f + ' g')}
    ${row('Water', TARGETS.waterMl / 1000 + ' L')}
    ${row('Steps', TARGETS.steps)}
    ${row('Sleep', '7–9 h')}
    <details class="more"><summary>Why these numbers</summary>
      <p class="why"><b>Calories at maintenance, not a deficit.</b> You want to hold or gain, never lose. Coming back from a layoff with some fat to lose, maintenance is enough to build muscle and lose fat at the same time: recomposition works best in exactly that situation <cite>(Barakat 2020)</cite>. Your InBody put your resting burn at 1,857 kcal; with four sessions a week and 8–10k steps that lands around 2,800–3,000. The plan starts at ${T.k.toLocaleString('en-US')} and the Body tab's check-in adjusts it from your real trend.</p>
      <p class="why"><b>Protein ~1.9 g/kg.</b> Muscle gain plateaus around 1.6 g/kg, with the upper end of the confidence interval at 2.2 <cite>(Morton 2018)</cite>. 190 g sits safely inside that range and helps with fullness. Spread it over the meals. The total for the day matters more than exact timing <cite>(Schoenfeld 2013)</cite>.</p>
      <p class="why"><b>Fat ~25% of calories</b> keeps hormones and fat-soluble vitamins (your D3) covered. <b>Carbs are the rest</b>, and they fuel the training volume.</p>
      <p class="why"><b>Sleep.</b> On the same reduced-calorie diet, 5.5 h of sleep instead of 8.5 h shifted the weight lost away from fat and toward muscle <cite>(Nedeltcheva 2010)</cite>.</p>
    </details></div></div>

  <div class="card rise" style="--i:1"><div class="plan-sec"><h3>Training · Upper / Lower ×2</h3>
    ${ORDER.map(d => row(PROGRAM[d].name + ' · ' + PROGRAM[d].tag, PROGRAM[d].ex.length + ' exercises')).join('')}
    ${row('Reps in reserve', '1–3 (3 in ramp weeks)')}
    ${row('Rest · big lifts', '2–3 min')}
    ${row('Inside a superset', 'walk straight over')}
    ${row('After a pair', '75–90 s')}
    ${row('Progress', 'top of range → +1 step')}
    ${row('Ramp', 'weeks 1–2, one set fewer')}
    ${row('Incline walk', '2–3 × 20–30 min')}
    <details class="more"><summary>Weekly hard sets per muscle</summary>
      ${VOLUME.map(([a, b]) => row(a, b)).join('')}
    </details>
    <details class="more"><summary>Why this split</summary>
      <p class="why"><b>Each muscle twice a week.</b> At the same total volume, hitting a muscle twice a week builds more muscle than once <cite>(Schoenfeld 2016)</cite>. Upper/Lower does that in four sessions.</p>
      <p class="why"><b>8–14 hard sets per muscle per week.</b> 10+ sets a week grew more muscle than fewer than 5 <cite>(Schoenfeld 2017)</cite>, and gains keep rising with volume up to around 20 sets, with diminishing returns <cite>(Pelland 2024)</cite>. Coming back from time off, the lower half is plenty.</p>
      <p class="why"><b>Stop 1–3 reps short.</b> Growth is about the same as training to failure, with much less fatigue <cite>(Refalo 2023)</cite>.</p>
      <p class="why"><b>Long rests on the big lifts.</b> 3 min built more muscle than 1 min <cite>(Schoenfeld 2016)</cite>. Supersets only pair exercises that do not compete, so you save time without losing reps.</p>
      <p class="why"><b>Muscle memory.</b> In a study with almost your exact timeline (7 weeks of training, 7 weeks off, 7 weeks back) people grew more muscle the second time around <cite>(Seaborne 2018)</cite>. In mice, the extra nuclei muscle gains from training stay through a layoff <cite>(Bruusgaard 2010)</cite>. The ramp weeks protect you from the soreness spike while you rebuild.</p>
      <p class="why"><b>Incline walking, not running.</b> Cardio cut into strength and size gains mainly when it was running, and when it was frequent and long; cycling interfered far less <cite>(Wilson 2012)</cite>. Low-intensity walking is lighter on the legs than either, so it is the safe choice. It still helps with visceral fat, which was level 10 on your scan.</p>
    </details></div></div>

  <div class="card rise" style="--i:2"><div class="plan-sec"><h3>Supplements</h3>
    ${list.map((x, i) => `<button class="opt" data-sedit="${i}"><span class="grow"><span class="t">${esc(x.n)}</span>
      <span class="meal-s" style="display:block">${esc(x.dose)} · ${SLOTS.find(s => s.id === x.slot).t} · ${x.days.length === 7 ? 'daily' : x.days.map(d => DAYN[d]).join(' ')}${x.load ? ' · first 14 days' : ''}</span></span>${icon(I.edit)}</button>`).join('')}
    <div style="display:flex;gap:8px;margin-top:10px"><button class="btn quiet" data-sadd>${icon(I.plus)} Add</button><button class="btn ghost" data-sreset>Reset list</button></div>
    <details class="more"><summary>What the research says</summary>
      <p class="why"><b>Creatine.</b> The best-supported supplement for strength and muscle. 3–5 g a day keeps your muscles full. Larger athletes may need 5–10 g. Loading at 20 g/day fills them in under a week; 5 g/day takes 3–4 weeks <cite>(Hultman 1996; Kreider 2017, ISSN)</cite>. The plan: 10 g a day (5 + 5) for 14 days, then 5 g. Expect +1–2 kg of water in the muscle. That is not fat. Tell your doctor you take it, because it raises blood creatinine on lab tests.</p>
      <p class="why"><b>Vitamin D3.</b> 10,000 IU is a treatment dose. Doctors use it daily for short courses or less often over longer ones. Above 4,000 IU a day long-term should be checked with a 25(OH)D blood test. Taken with a meal that has fat, absorption was ~32% higher <cite>(Dawson-Hughes 2015)</cite>. Follow your doctor on the days.</p>
      <p class="why"><b>Zinc + magnesium.</b> They compete for absorption at high doses, so morning and night is the right split. Zinc goes with food to avoid nausea.</p>
      <p class="why"><b>L-carnitine.</b> It only raised muscle carnitine when taken with a lot of carbs, over 24 weeks <cite>(Wall 2011)</cite>. That is why it moves to the last meal. Fat-loss evidence in people who train is weak.</p>
      <p class="why"><b>Caffeine.</b> Up to ~400 mg a day is fine for healthy adults. Stop by 4 pm: caffeine taken even 6 h before bed cut sleep by about an hour <cite>(Drake 2013)</cite>.</p>
    </details></div></div>

  <div class="card rise" style="--i:3"><div class="plan-sec"><h3>Cooking · twice a week</h3>
    ${row('Chicken breast', '1.4 kg · oven 200 °C · 25 min')}
    ${row('Beef mince', '1.3 kg · one pan, brown + season')}
    ${row('Rice', '1 kg dry → ~2.6 kg cooked')}
    ${row('Eggs', 'fresh each morning')}
    ${row('Frozen veg', 'microwave 3 min per box')}
    <p class="why">Weigh it cooked. That is what the numbers use. Box single portions while warm. They keep 3–4 days in the fridge; freeze anything for later. Eating out: protein first, one carb, no mayo sauces, stop at 80% full.</p>
    ${ctx.S.settings.mealDefaults ? '<button class="btn ghost" data-mreset style="margin-top:6px">Reset meals to the plan</button>' : ''}
  </div></div>

  <div class="card rise" style="--i:4"><div class="plan-sec"><h3>Check-in rule</h3>
    <p class="why" style="margin-top:0">Every 2–3 weeks the Body tab reads your trend. Losing more than 0.2 kg/week → add 150 kcal of rice. Gaining more than 0.5 kg/week <i>and</i> the waist is growing → take 150 out. Anything in between is the plan working, even if the scale barely moves while the waist comes in and the lifts go up.</p>
  </div></div>

  <div class="card rise" style="--i:5"><div class="plan-sec"><h3>Data</h3>
    <button class="btn" data-backup>Save a backup</button>
    <button class="btn ghost" data-restore style="margin-top:8px">Restore from a backup</button>
    <div id="restorePanel" style="display:none;margin-top:12px">
      <button class="btn ghost" data-pick>Choose a backup file</button>
      <span class="lbl">Or paste one</span>
      <textarea id="pasteBox" class="inp" style="width:100%;height:88px;text-align:left;font-size:12px;line-height:1.4" placeholder='{"workouts":...}'></textarea>
      <button class="btn" data-dorestore style="margin-top:8px">Restore</button>
    </div>
    <input type="file" id="restoreFile" accept="application/json,.json,text/plain" hidden>
    <p class="why">One small file with every session, meal, supplement tick and measurement. Nothing leaves the phone unless you send it somewhere yourself.</p>
  </div></div>

  <div class="card rise" style="--i:6"><details class="more" style="border:none;padding:0"><summary>Sources</summary><div style="margin-top:8px">
    ${[
      ['Barakat 2020', 'Body recomposition: can trained individuals build muscle and lose fat at the same time? Strength Cond J 42(5).'],
      ['Morton 2018', 'Protein supplementation and resistance-training gains: meta-analysis. Br J Sports Med 52:376.'],
      ['Schoenfeld 2013', 'The effect of protein timing on muscle strength and hypertrophy: meta-analysis. JISSN 10:53.'],
      ['Schoenfeld 2016a', 'Effects of resistance training frequency on hypertrophy: meta-analysis. Sports Med 46:1689.'],
      ['Schoenfeld 2016b', 'Longer inter-set rest periods enhance muscle strength and hypertrophy. J Strength Cond Res 30:1805.'],
      ['Schoenfeld 2017', 'Dose-response between weekly set volume and muscle mass. J Sports Sci 35:1073.'],
      ['Pelland 2024', 'The resistance training dose-response: meta-regressions on volume and frequency. SportRxiv.'],
      ['Refalo 2023', 'Proximity-to-failure and hypertrophy: meta-analysis. Sports Med 53:649.'],
      ['Bruusgaard 2010', 'Myonuclei acquired by overload exercise precede hypertrophy and are not lost on detraining (mice). PNAS 107:15111.'],
      ['Seaborne 2018', 'Human skeletal muscle possesses an epigenetic memory of hypertrophy. Sci Rep 8:1898.'],
      ['Wilson 2012', 'Concurrent training: meta-analysis examining interference of aerobic and resistance exercise. J Strength Cond Res 26:2293.'],
      ['Nedeltcheva 2010', 'Insufficient sleep undermines dietary efforts to reduce adiposity. Ann Intern Med 153:435.'],
      ['Hultman 1996', 'Muscle creatine loading in men. J Appl Physiol 81:232.'],
      ['Kreider 2017', 'ISSN position stand: safety and efficacy of creatine supplementation. JISSN 14:18.'],
      ['Dawson-Hughes 2015', 'Dietary fat increases vitamin D-3 absorption. J Acad Nutr Diet 115:225.'],
      ['Wall 2011', 'Chronic oral L-carnitine with carbohydrate increases muscle carnitine content. J Physiol 589:963.'],
      ['Drake 2013', 'Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med 9:1195.']
    ].map(([a, b]) => `<div class="src"><b>${a}</b> · ${b}</div>`).join('')}
  </div></details></div>`;
}

export function bindPlan() {
  const r = root();
  r.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.sedit) return suppSheet(+t.dataset.sedit);
    if ('sadd' in t.dataset) return suppSheet(-1);
    if ('sreset' in t.dataset) { if (confirm('Put the supplement list back to the default?')) { delete ctx.S.settings.supps; persist(); changed('supps'); } return; }
    if ('mreset' in t.dataset) { delete ctx.S.settings.mealDefaults; persist(); changed('food'); toast('Meals back to the plan'); return; }
    if ('backup' in t.dataset) return backup();
    if ('restore' in t.dataset) { const p = $('#restorePanel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; return; }
    if ('pick' in t.dataset) return $('#restoreFile').click();
    if ('dorestore' in t.dataset) return applyRestore($('#pasteBox').value);
  });
  r.addEventListener('change', async e => {
    if (e.target.id !== 'restoreFile') return;
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (f) applyRestore(await f.text());
  });
}

function suppSheet(i) {
  const list = suppList(ctx.S).map(x => ({ ...x, days: x.days.slice() }));
  const x = i >= 0 ? list[i] : { id: 's' + Date.now(), n: '', dose: '', slot: 'am', days: [0, 1, 2, 3, 4, 5, 6], note: '' };
  const draw = b => {
    b.innerHTML = `<label class="lbl" style="margin-top:0">Name</label><input class="inp txt" id="sn" value="${esc(x.n)}">
      <label class="lbl">Dose</label><input class="inp txt" id="sdo" value="${esc(x.dose)}">
      <label class="lbl">When</label><div class="chips">${SLOTS.map(s => `<button class="chip${x.slot === s.id ? ' on' : ''}" data-slot="${s.id}">${s.t}</button>`).join('')}</div>
      <label class="lbl">Days</label><div class="days7">${DAYN.map((d, k) => `<button class="chip${x.days.includes(k) ? ' on' : ''}" data-dw="${k}">${d.slice(0, 2)}</button>`).join('')}</div>
      <label class="lbl">Note</label><textarea class="inp txt" id="snote" style="height:70px">${esc(x.note || '')}</textarea>
      <button class="btn" data-ssave style="margin-top:14px">Save</button>
      ${i >= 0 ? '<button class="btn ghost" data-sdel style="margin-top:8px">Remove</button>' : ''}`;
    const keep = () => { x.n = $('#sn', b).value; x.dose = $('#sdo', b).value; x.note = $('#snote', b).value; };
    $$('[data-slot]', b).forEach(c => c.onclick = () => { keep(); x.slot = c.dataset.slot; draw(b); });
    $$('[data-dw]', b).forEach(c => c.onclick = () => { keep(); const k = +c.dataset.dw; x.days = x.days.includes(k) ? x.days.filter(d => d !== k) : x.days.concat(k).sort(); draw(b); });
    $('[data-ssave]', b).onclick = () => {
      keep(); if (!x.n.trim()) { toast('Give it a name'); return; }
      if (!x.days.length) { toast('Pick at least one day'); return; }
      if (i >= 0) list[i] = x; else list.push(x);
      ctx.S.settings.supps = list; persist(); closeSheet(); changed('supps'); toast('Saved');
    };
    const del = $('[data-sdel]', b);
    if (del) del.onclick = () => { list.splice(i, 1); ctx.S.settings.supps = list; persist(); closeSheet(); changed('supps'); };
  };
  sheet(i >= 0 ? 'Edit supplement' : 'Add supplement', '', draw);
}

/* ============ backup & restore ============ */
/* The clipboard is not a backup - the next thing you copy overwrites it - and
   an export nothing can read back is not one either. Both halves live here. */
async function backup() {
  const text = JSON.stringify(ctx.S, null, 2), name = 'recomp-' + ctx.today + '.json';
  /* Share sheet first: on iOS it is the only route to Files, Notes or a
     message, and it is one tap with nothing to paste. */
  try {
    const file = new File([text], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Recomp backup' }); toast('Backup saved'); return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Backup downloaded'); return;
  } catch (e) {}
  try { await navigator.clipboard.writeText(text); toast('Copied: paste it somewhere safe'); }
  catch (e) { prompt('Copy this backup:', text); }
}
function applyRestore(raw) {
  if (!raw || !raw.trim()) { toast('Nothing to restore'); return; }
  let d; try { d = JSON.parse(raw); } catch (e) { toast('That is not a backup file'); return; }
  if (!d || typeof d !== 'object' || !('workouts' in d || 'food' in d || 'body' in d)) { toast('That is not a Recomp backup'); return; }
  const n = Object.keys(d.workouts || {}).length;
  if (!confirm('Restore ' + n + ' session' + (n === 1 ? '' : 's') + '?\n\nEverything currently in the app is replaced.')) return;
  replace(d).then(ok => { if (ok) { changed('all'); toast('Backup restored'); } });
}
