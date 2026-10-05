import test from 'node:test';
import assert from 'node:assert/strict';
import {
  migrate, blank, suggest, EX, lastFor, wkey, nextDay, programWeek, setsFor,
  sum, mealItems, kcalTarget, planTotals, swapGrams, fmtQty, dayTotals,
  suppsFor, suppProgress, trend, weeklyRate, checkIn, addDays, sessionStats
} from '../js/logic.js';
import { MEALS, PROGRAM } from '../js/data.js';

test('plan defaults land near the targets', () => {
  const t = planTotals(blank(), '2026-10-05');
  assert.ok(t.k > 2800 && t.k < 3000, 'kcal ' + t.k);
  assert.ok(t.p >= 190, 'protein ' + t.p);
  assert.ok(t.f > 65 && t.f < 90, 'fat ' + t.f);
  assert.equal(kcalTarget(blank()), Math.round(t.k / 10) * 10);
});

test('migrate keeps v1 logs and maps positional sets onto ids', () => {
  const [s, changed] = migrate({ workouts: { '2026-09-01': { day: 'A', e: { 0: [{ w: '60', r: '8' }] } } }, food: {}, body: {} });
  assert.ok(changed);
  assert.deepEqual(s.workouts['2026-09-01|A'].e['smith-squat'], [{ w: '60', r: '8' }]);
  assert.equal(s.v, 2);
  assert.ok(s.inbody.length >= 3);
  const [, again] = migrate(s);
  assert.equal(again, false, 'second pass is a no-op');
});

test('old smith squat history feeds the new split', () => {
  const [S] = migrate({ workouts: { '2026-09-01|A': { day: 'A', date: '2026-09-01', e: { 'smith-squat': [{ w: '60', r: '8' }] } } } });
  const L = lastFor(S, 'smith-squat', wkey('2026-10-05', 'LA'));
  assert.equal(L.sets[0].w, '60');
});

test('double progression: stay until every set hits the top, then step up', () => {
  const ex = EX['smith-squat']; // 3 x 6-10, +5
  assert.deepEqual(suggest(ex, { sets: [{ w: '60', r: '10' }, { w: '60', r: '9' }, { w: '60', r: '8' }] }), { w: 60, r: 10, up: false });
  assert.deepEqual(suggest(ex, { sets: [{ w: '60', r: '10' }, { w: '60', r: '10' }, { w: '60', r: '10' }] }), { w: 65, r: 6, up: true });
  assert.equal(suggest(ex, null).first, true);
});

test('a typed but unticked set is not logged; old sets without a flag are', () => {
  const S = blank();
  S.workouts['2026-10-01|UA'] = { day: 'UA', date: '2026-10-01', e: { 'tbar-row': [{ w: '40', r: '10', d: 0 }] } };
  S.workouts['2026-09-01|A'] = { day: 'A', date: '2026-09-01', e: { 'lat-pulldown': [{ w: '50', r: '10' }] } };
  assert.equal(lastFor(S, 'tbar-row', 'x'), null);
  assert.equal(lastFor(S, 'lat-pulldown', 'x').sets[0].w, '50');
  assert.equal(nextDay(S, '2026-10-02'), 'UA', 'an unticked session does not advance the rotation');
});

test('ramp weeks drop one set, then full volume', () => {
  const ex = EX['incline-db-press'];
  assert.equal(setsFor(ex, 0), 2);
  assert.equal(setsFor(ex, 1), 2);
  assert.equal(setsFor(ex, 2), 3);
  assert.equal(setsFor(ex, 0, true), 3);
});

test('rotation: UA -> LA -> UB -> LB -> UA, and today stays on what was logged', () => {
  const S = blank();
  assert.equal(nextDay(S, '2026-10-05'), 'UA');
  S.workouts[wkey('2026-10-05', 'UA')] = { day: 'UA', date: '2026-10-05', e: { 'tbar-row': [{ w: '40', r: '10', d: 1 }] } };
  assert.equal(nextDay(S, '2026-10-05'), 'UA');
  assert.equal(nextDay(S, '2026-10-06'), 'LA');
  S.workouts[wkey('2026-10-10', 'LB')] = { day: 'LB', date: '2026-10-10', e: { rdl: [{ w: '80', r: '8', d: 1 }] } };
  assert.equal(nextDay(S, '2026-10-11'), 'UA');
  assert.equal(programWeek(S, '2026-10-19'), 2);
});

test('swaps hold the macro the slot is built on', () => {
  const g = swapGrams('chicken', 200, 'tuna');      // 62 g protein
  assert.ok(Math.abs(g * 25.5 / 100 - 62) < 2, 'tuna ' + g);
  const r = swapGrams('rice', 350, 'potato');        // carbs held
  assert.ok(Math.abs(r * 20.1 / 100 - 350 * 28.2 / 100) < 2, 'potato ' + r);
  assert.equal(swapGrams('egg', 200, 'eggwhite') % 33, 0, 'unit foods round to whole units');
  assert.equal(fmtQty('egg', 200), '4 eggs');
  assert.equal(fmtQty('rice', 350), '350 g');
});

test('day totals: ticked meals, swaps and extras', () => {
  const S = blank(), d = '2026-10-05';
  S.meals[d] = { eat: { m2: true }, sw: { m2: { 0: { f: 'tuna', g: 245 } } }, add: [{ k: 100, p: 10 }] };
  const items = mealItems(S, d, 'm2');
  assert.equal(items[0].f, 'tuna');
  const t = dayTotals(S, d);
  assert.ok(Math.abs(t.eaten.k - (sum(items).k + 100)) < .01);
});

test('rice adjustment moves the calorie target', () => {
  const S = blank(), base = kcalTarget(S);
  S.settings.riceAdj = 57.5;
  assert.ok(kcalTarget(S) - base >= 140 && kcalTarget(S) - base <= 160);
});

test('supplements: D3 on its days, loading creatine only for 14 days, pre-training counts after a session', () => {
  const S = blank();
  S.settings.creatineStart = '2026-10-05';
  const thu = '2026-10-08', mon = '2026-10-05';
  assert.ok(!suppsFor(S, thu).some(x => x.id === 'd3'));
  assert.ok(suppsFor(S, mon).some(x => x.id === 'd3'));
  assert.ok(suppsFor(S, mon).some(x => x.id === 'creatine2'));
  assert.ok(!suppsFor(S, addDays(mon, 14)).some(x => x.id === 'creatine2'));
  const before = suppProgress(S, mon).total;
  S.workouts[wkey(mon, 'UA')] = { day: 'UA', date: mon, e: { 'tbar-row': [{ w: '40', r: '10', d: 1 }] } };
  assert.equal(suppProgress(S, mon).total, before + 1);
});

test('trend and check-in: losing triggers add, holding is hold', () => {
  const S = blank();
  for (let i = 0; i < 21; i++) S.body[addDays('2026-10-01', i)] = { w: 100 - i * 0.08 };
  assert.ok(weeklyRate(trend(S)) < -0.2);
  assert.equal(checkIn(S).state, 'add');
  const H = blank();
  for (let i = 0; i < 21; i++) H.body[addDays('2026-10-01', i)] = { w: 100 + (i % 2 ? .3 : -.3) };
  assert.equal(checkIn(H).state, 'hold');
  assert.equal(checkIn(blank()).state, 'wait');
});

test('check-in never suggests a cut during creatine loading, and waits for 2 weeks', () => {
  const S = blank(); S.settings.creatineStart = '2026-10-01';
  for (let i = 0; i < 21; i++) S.body[addDays('2026-10-01', i)] = { w: 100 + i * 0.12, ...(i % 7 === 0 ? { wa: 104 + i * 0.1 } : {}) };
  assert.equal(checkIn(S, '2026-10-21').state, 'hold');
  assert.equal(checkIn(S, '2026-11-15').state, 'cut');
  const E = blank();
  for (let i = 0; i < 10; i++) E.body[addDays('2026-10-01', i)] = { w: 100 - i * 0.2 };
  assert.equal(checkIn(E, '2026-10-10').state, 'wait', 'ten days is too early to call');
});

test('old reps-only sets count as logged; loading dose shows before the first creatine tick', () => {
  const S = blank();
  S.workouts['2026-09-01|B'] = { day: 'B', date: '2026-09-01', e: { 'lying-leg-raise': [{ r: '12' }] } };
  assert.equal(lastFor(S, 'lying-leg-raise', 'x').sets[0].r, '12');
  assert.ok(suppsFor(blank(), '2026-10-05').some(x => x.id === 'creatine2'));
});

test('session stats count PRs against earlier sessions only', () => {
  const S = blank();
  S.workouts['2026-10-01|LA'] = { day: 'LA', date: '2026-10-01', e: { 'smith-squat': [{ w: '60', r: '8', d: 1 }] } };
  S.workouts['2026-10-05|LA'] = { day: 'LA', date: '2026-10-05', e: { 'smith-squat': [{ w: '65', r: '8', d: 1 }] } };
  const st = sessionStats(S, '2026-10-05|LA');
  assert.deepEqual(st.prs, ['smith-squat']);
  assert.equal(st.sets, 1);
});

test('every exercise has a photo pair and cues', async () => {
  const { existsSync } = await import('node:fs');
  for (const d of Object.values(PROGRAM)) for (const x of d.ex) {
    assert.ok(existsSync(new URL(`../img/ex/${x.id}-0.jpg`, import.meta.url)), x.id);
    assert.ok(existsSync(new URL(`../img/ex/${x.id}-1.jpg`, import.meta.url)), x.id);
    assert.ok(x.cues.length >= 2, x.id);
  }
  assert.equal(MEALS.length, 5);
});
