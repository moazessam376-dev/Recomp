/* The plan as data. Editing this file is how the plan moves on: PLAN.md is the
   prose version and explains every number here. Nothing in this file touches
   the DOM, so the logic tests import it directly. */

/* ============ training ============ */
/* Every exercise carries a stable id. Sets are stored against the id, never a
   position, so the program can be reordered or regrouped without a logged set
   landing on a different lift - and ids shared with the old 3-day plan
   (smith-squat, rdl, leg-press...) carry their history straight across.
   `ss` groups consecutive items into a superset. `lo`/`hi` is the rep range
   that double progression works inside; `inc` is the smallest load step. */
export const ORDER = ['UA', 'LA', 'UB', 'LB'];

export const PROGRAM = {
  UA: { name: 'Upper A', tag: 'Horizontal', ex: [
    { id: 'incline-db-press', n: 'Incline dumbbell press', s: 3, lo: 6, hi: 10, rest: 150, inc: 2.5,
      m: 'Upper chest · front delts · triceps',
      cues: ['Bench at about 30°', 'Shoulder blades back and down, feet planted', 'Lower to the upper chest, elbows about 45° from your sides', 'Press up and slightly in'] },
    { id: 'tbar-row', n: 'T-bar row', s: 3, lo: 8, hi: 12, rest: 120, inc: 2.5,
      m: 'Mid back · lats · rear delts',
      cues: ['If your T-bar has a chest pad, use it - that is the chest-supported version', 'Free-standing: hinge to about 45° with a flat back, knees soft', 'Pull the handle to your upper belly, squeeze the shoulder blades for 1 s', 'Lower all the way under control'] },
    { id: 'lat-pulldown', n: 'Wide-grip lat pulldown', s: 3, lo: 10, hi: 12, rest: 15, inc: 5, ss: 'ua1',
      m: 'Lats · upper back · biceps',
      cues: ['Grip just outside shoulder width', 'Chest up, lean back slightly - no swinging', 'Drive the elbows down, bar to the upper chest', 'Let the arms fully straighten at the top'] },
    { id: 'lateral-raise', n: 'Lateral raise', s: 3, lo: 12, hi: 20, rest: 90, inc: 1, ss: 'ua1',
      m: 'Side delts',
      cues: ['Slight bend in the elbows, kept fixed', 'Raise out to shoulder height, leading with the elbows', 'Take 2 s on the way down', 'Shoulders stay down - no shrugging'] },
    { id: 'oh-tri-ext', n: 'Overhead cable triceps extension', s: 2, lo: 10, hi: 15, rest: 15, inc: 2.5, ss: 'ua2',
      m: 'Triceps (long head)',
      cues: ['Rope on a low or mid pulley, face away from the stack', 'Elbows point forward and stay still', 'Get a deep stretch behind the head', 'Extend fully, split the rope at the top'] },
    { id: 'incline-db-curl', n: 'Incline dumbbell curl', s: 2, lo: 10, hi: 15, rest: 75, inc: 1, ss: 'ua2',
      m: 'Biceps (long head)',
      cues: ['Bench at 45–60°, arms hang straight down behind you', 'Curl without the elbows drifting forward', 'Full stretch at the bottom of every rep'] },
    { id: 'neck-extension', n: 'Neck extension', s: 2, lo: 15, hi: 15, rest: 15, inc: 1.25, ss: 'ua3', neck: true,
      m: 'Back of the neck',
      cues: ['Lie face-down, head off the end of the bench', 'Weeks 1–2: bodyweight only. After that, a plate on the back of the head over a towel', 'Slow nods through a comfortable range - never jerk'] },
    { id: 'wrist-curl', n: 'Wrist curl + reverse wrist curl', s: 2, lo: 15, hi: 15, rest: 60, inc: 1, ss: 'ua3',
      m: 'Forearms · grip',
      cues: ['Forearms on the bench, wrists just off the edge', 'Palms up for 15, then palms down for 15 - that is one set', 'Full range, no bouncing'] }
  ]},
  LA: { name: 'Lower A', tag: 'Squat', ex: [
    { id: 'smith-squat', n: 'Smith squat', s: 3, lo: 6, hi: 10, rest: 180, inc: 5,
      m: 'Quads · glutes',
      cues: ['Feet shoulder width, slightly in front of the bar', 'Brace hard, then sit down between your heels to at least parallel', 'Knees travel in line with your toes', 'Drive up through the whole foot'] },
    { id: 'hip-thrust', n: 'Hip thrust', s: 3, lo: 8, hi: 12, rest: 120, inc: 5,
      m: 'Glutes · hamstrings',
      cues: ['Upper back on the bench edge, bar padded across the hips', 'Feet flat; shins vertical at the top', 'Chin tucked, drive the hips up and squeeze 1 s', 'Ribs down - the lower back does not arch'] },
    { id: 'seated-leg-curl', n: 'Seated leg curl', s: 3, lo: 10, hi: 15, rest: 15, inc: 5, ss: 'la1',
      m: 'Hamstrings',
      cues: ['Knee lined up with the machine’s pivot', 'Lean the chest forward slightly for a better stretch', 'Curl all the way, 2 s on the way back'] },
    { id: 'standing-calf', n: 'Standing calf raise', s: 3, lo: 10, hi: 15, rest: 90, inc: 5, ss: 'la1',
      m: 'Calves',
      cues: ['Balls of the feet on the edge', 'Pause 1–2 s in the bottom stretch - no bouncing', 'Rise as high as you can'] },
    { id: 'leg-extension', n: 'Leg extension', s: 3, lo: 12, hi: 15, rest: 15, inc: 5, ss: 'la2',
      m: 'Quads',
      cues: ['Knee at the machine’s pivot', 'Extend fully and squeeze 1 s', 'Lower slowly'] },
    { id: 'cable-crunch', n: 'Cable crunch', s: 3, lo: 12, hi: 12, rest: 90, inc: 5, ss: 'la2',
      m: 'Abs',
      cues: ['Kneel, rope held beside your ears', 'Hips stay still', 'Curl your ribs toward your pelvis - round the spine', 'The arms do not pull'] },
    { id: 'pallof-press', n: 'Cable Pallof press', s: 2, lo: 12, hi: 12, rest: 60, inc: 2.5, unit: 'side',
      m: 'Obliques · anti-rotation',
      cues: ['Stand side-on to the cable, handle at the chest', 'Press straight out and hold 2 s', 'Do not let the cable twist you', 'Both sides = one set'] }
  ]},
  UB: { name: 'Upper B', tag: 'Vertical', ex: [
    { id: 'hs-chest-press', n: 'Hammer Strength chest press', s: 3, lo: 6, hi: 10, rest: 150, inc: 5,
      m: 'Chest · front delts · triceps',
      cues: ['Seat height so the handles meet mid-chest', 'Shoulder blades pinned to the pad', 'Press without slamming the lockout', '2 s on the way back'] },
    { id: 'sa-lat-row', n: 'Single-arm dumbbell row', s: 3, lo: 8, hi: 12, rest: 90, inc: 2.5, unit: 'arm',
      m: 'Lats · mid back',
      cues: ['Hand and knee on the bench, back flat', 'Pull the dumbbell toward your hip, not your chest', 'Full stretch at the bottom', 'Both arms = one set'] },
    { id: 'db-shoulder-press', n: 'Seated dumbbell shoulder press', s: 3, lo: 8, hi: 12, rest: 15, inc: 2.5, ss: 'ub1',
      m: 'Front and side delts · triceps',
      cues: ['Bench upright or one notch back', 'Dumbbells at ear level, elbows slightly forward', 'Press up, ribs down - no big back arch'] },
    { id: 'neutral-pulldown', n: 'Neutral-grip pulldown', s: 3, lo: 10, hi: 12, rest: 90, inc: 5, ss: 'ub1',
      m: 'Lats · biceps',
      cues: ['V-bar or close neutral handles', 'Pull to the upper chest, elbows down to your ribs', 'Full stretch at the top'] },
    { id: 'pec-deck', n: 'Pec deck (or flat dumbbell fly)', s: 2, lo: 12, hi: 15, rest: 15, inc: 5, ss: 'ub2',
      m: 'Chest',
      cues: ['Handles at chest height, slight bend in the elbows kept fixed', 'Squeeze together, 1 s hold', 'Open wide under control', 'Machine busy? Flat dumbbell fly works the same way'] },
    { id: 'rear-delt-fly', n: 'Reverse pec deck', s: 3, lo: 12, hi: 20, rest: 90, inc: 2.5, ss: 'ub2',
      m: 'Rear delts',
      cues: ['Chest to the pad, arms slightly bent', 'Sweep the arms back wide, leading with the back of the hands', 'Machine busy? Bent-over dumbbell rear raise'] },
    { id: 'cable-pushdown', n: 'Cable pushdown', s: 2, lo: 10, hi: 15, rest: 15, inc: 2.5, ss: 'ub3',
      m: 'Triceps',
      cues: ['Elbows pinned to your sides', 'Push down and split the rope at the bottom', 'Only the forearms move'] },
    { id: 'hammer-curl', n: 'Hammer curl', s: 2, lo: 10, hi: 15, rest: 75, inc: 1, ss: 'ub3',
      m: 'Brachialis · forearms · biceps',
      cues: ['Neutral grip, thumbs up', 'Elbows still, no swing', 'Lower all the way'] },
    { id: 'neck-flexion', n: 'Neck flexion', s: 2, lo: 15, hi: 15, rest: 60, inc: 1.25, neck: true,
      m: 'Front of the neck',
      cues: ['Lie face-up, head off the end of the bench', 'Weeks 1–2: bodyweight only. After that, a plate on the forehead over a towel', 'Chin to chest, slowly - never jerk'] }
  ]},
  LB: { name: 'Lower B', tag: 'Hinge', ex: [
    { id: 'rdl', n: 'Romanian deadlift', s: 3, lo: 6, hi: 10, rest: 180, inc: 5,
      m: 'Hamstrings · glutes · lower back',
      cues: ['Soft knees, bar close - it slides down your thighs', 'Push the hips back until the hamstrings are fully stretched (around mid-shin)', 'Back stays flat the whole time', 'Stand up by driving the hips forward'] },
    { id: 'leg-press', n: 'Leg press', s: 3, lo: 10, hi: 15, rest: 120, inc: 10,
      m: 'Quads · glutes',
      cues: ['Feet shoulder width, middle of the plate', 'Lower until your thighs come toward your chest - stop before your lower back peels off the pad', 'Do not lock the knees at the top'] },
    { id: 'bulgarian-split', n: 'Bulgarian split squat', s: 2, lo: 10, hi: 10, rest: 15, inc: 2.5, ss: 'lb1', unit: 'leg',
      m: 'Quads · glutes',
      cues: ['Rear foot on a bench, front foot far enough forward that the shin stays fairly upright', 'Drop straight down', 'Small forward lean puts more on the glutes', 'Both legs = one set'] },
    { id: 'lying-leg-raise', n: 'Lying leg raise (straight legs)', s: 3, lo: 12, hi: 15, rest: 90, inc: 0, ss: 'lb1', bw: true,
      m: 'Lower abs · hip flexors',
      cues: ['Lie flat, grip the bench behind your head', 'Legs straight - this is not a knee raise', 'Raise to vertical, then lower slowly until just above the bench', 'Lower back stays pressed down; if it arches, that rep is past your range'] },
    { id: 'lying-leg-curl', n: 'Lying leg curl', s: 3, lo: 10, hi: 15, rest: 15, inc: 5, ss: 'lb2',
      m: 'Hamstrings',
      cues: ['Hips pressed into the pad', 'Curl heels to glutes', '2 s on the way down'] },
    { id: 'leg-press-calf', n: 'Calf press on the leg press', s: 3, lo: 12, hi: 20, rest: 90, inc: 10, ss: 'lb2',
      m: 'Calves',
      cues: ['Balls of the feet on the bottom edge of the plate', 'Knees straight but not locked; keep the safety catches on', 'Full stretch, then push through the big toe'] },
    { id: 'back-extension', n: 'Back extension (45°)', s: 2, lo: 12, hi: 12, rest: 15, inc: 2.5, ss: 'lb3',
      m: 'Lower back · glutes',
      cues: ['Pad just below the hips', 'Hinge down with a flat back', 'Rise until your body is in a straight line - not past it'] },
    { id: 'farmers-carry', n: 'Farmer’s carry', s: 3, lo: 40, hi: 40, rest: 90, inc: 2.5, ss: 'lb3', unit: 'm',
      m: 'Grip · traps · core',
      cues: ['Heavy dumbbells', 'Tall posture, shoulders down', 'Short, quick steps for 40 m'] }
  ]}
};

/* Weeks 1–2 back after the layoff run one set fewer at ~3 reps in reserve. */
export const RAMP_WEEKS = 2;

/* ============ food ============ */
/* Per 100 g, cooked weight where it matters (USDA FoodData Central, rounded).
   `s` is the short label after the amount, and `u` a natural unit: "4 eggs"
   reads better than "200 g whole egg".
   `grp` decides what a food can be swapped for, and `by` which macro a swap
   holds steady: a protein swap keeps the protein, a carb swap keeps the carbs. */
export const FOODS = [
  { id: 'chicken',   n: 'Chicken breast, cooked', s: 'chicken breast',     grp: 'protein', k: 165, p: 31,   c: 0,    f: 3.6 },
  { id: 'thigh',     n: 'Chicken thigh, skinless, cooked', s: 'chicken thigh', grp: 'protein', k: 179, p: 24.8, c: 0, f: 8.2 },
  { id: 'beef10',    n: 'Beef mince (10% fat), cooked', s: 'beef mince', grp: 'protein', k: 217, p: 26.1, c: 0,  f: 11.7 },
  { id: 'beef5',     n: 'Beef mince (5% fat), cooked', s: 'lean beef mince',  grp: 'protein', k: 164, p: 25.4, c: 0,  f: 6.4 },
  { id: 'beefcubes', n: 'Lean beef cubes, cooked', s: 'beef cubes',     grp: 'protein', k: 190, p: 30,   c: 0,    f: 7.5 },
  { id: 'tuna',      n: 'Tuna in water, drained', s: 'tuna',      grp: 'protein', k: 116, p: 25.5, c: 0,    f: 0.8 },
  { id: 'egg',       n: 'Whole egg', s: '',                   grp: 'egg',     k: 143, p: 12.6, c: 0.7,  f: 9.5, u: { n: 'egg', g: 50 } },
  { id: 'eggwhite',  n: 'Egg white', s: '',                   grp: 'egg',     k: 52,  p: 10.9, c: 0.7,  f: 0.2, u: { n: 'white', g: 33 } },
  { id: 'greek',     n: 'Greek yogurt, low-fat', s: 'Greek yogurt',       grp: 'dairy',   k: 73,  p: 10,   c: 3.9,  f: 1.9 },
  { id: 'greekfull', n: 'Greek yogurt, full-fat', s: 'full-fat Greek yogurt',      grp: 'dairy',   k: 97,  p: 9,    c: 4,    f: 5 },
  { id: 'areesh',    n: 'Cottage / areesh cheese', s: 'areesh cheese',     grp: 'dairy',   k: 81,  p: 10.5, c: 4.8,  f: 2.3 },
  { id: 'milk',      n: 'Milk, low-fat', s: 'low-fat milk',               grp: 'dairy',   k: 47,  p: 3.4,  c: 4.9,  f: 1.5, u: { n: 'cup', g: 250 } },
  { id: 'whey',      n: 'Whey protein', s: 'whey',                grp: 'dairy',   k: 400, p: 80,   c: 10,   f: 5,   u: { n: 'scoop', g: 30 } },
  { id: 'rice',      n: 'White rice, cooked', s: 'rice',          grp: 'carb',    k: 130, p: 2.7,  c: 28.2, f: 0.3 },
  { id: 'potato',    n: 'Potato, boiled or oven, no oil', s: 'potato', grp: 'carb', k: 87,  p: 1.9,  c: 20.1, f: 0.1 },
  { id: 'pasta',     n: 'Pasta, cooked', s: 'pasta',               grp: 'carb',    k: 158, p: 5.8,  c: 30.9, f: 0.9 },
  { id: 'toast',     n: 'Whole wheat toast', s: 'toast',           grp: 'bread',   k: 252, p: 12.4, c: 43,   f: 3.5, u: { n: 'slice', g: 30 } },
  { id: 'baladi',    n: 'Baladi bread', s: 'baladi bread',                grp: 'bread',   k: 266, p: 9.8,  c: 55,   f: 2.6, u: { n: 'loaf', g: 90 } },
  { id: 'oats',      n: 'Oats, dry', s: 'oats',                   grp: 'bread',   k: 379, p: 13.2, c: 67.7, f: 6.5 },
  { id: 'banana',    n: 'Banana', s: '',                      grp: 'fruit',   k: 89,  p: 1.1,  c: 22.8, f: 0.3, u: { n: 'banana', g: 120 } },
  { id: 'dates',     n: 'Dates', s: '',                       grp: 'fruit',   k: 282, p: 2.5,  c: 75,   f: 0.4, u: { n: 'date', g: 8 } },
  { id: 'apple',     n: 'Apple', s: '',                       grp: 'fruit',   k: 52,  p: 0.3,  c: 13.8, f: 0.2, u: { n: 'apple', g: 180 } },
  { id: 'honey',     n: 'Honey', s: 'honey',                       grp: 'sweet',   k: 304, p: 0.3,  c: 82,   f: 0,   u: { n: 'tbsp', g: 21 } },
  { id: 'veg',       n: 'Frozen mixed veg, cooked', s: 'mixed veg',    grp: 'veg',     k: 65,  p: 2.9,  c: 13,   f: 0.2 },
  { id: 'salad',     n: 'Cucumber + tomato salad', s: 'salad',     grp: 'veg',     k: 18,  p: 0.9,  c: 3.9,  f: 0.2 },
  { id: 'oil',       n: 'Olive oil', s: 'olive oil',                   grp: 'fat',     k: 884, p: 0,    c: 0,    f: 100, u: { n: 'tsp', g: 4.5 } },
  { id: 'pb',        n: 'Peanut butter', s: 'peanut butter',               grp: 'fat',     k: 588, p: 25,   c: 20,   f: 50,  u: { n: 'tbsp', g: 16 } }
];
export const SWAP_BY = { protein: 'p', egg: 'p', dairy: 'p', carb: 'c', bread: 'c', fruit: 'c', sweet: 'c', veg: 'k', fat: 'f' };
/* Groups that may stand in for one another. Eggs can cover a meat slot and
   bread a rice slot; the swap holds the macro either way. */
export const SWAP_POOL = {
  protein: ['protein', 'egg'], egg: ['egg', 'protein', 'dairy'], dairy: ['dairy', 'egg'],
  carb: ['carb', 'bread', 'fruit'], bread: ['bread', 'carb', 'fruit'], fruit: ['fruit', 'carb', 'bread', 'sweet'],
  sweet: ['sweet', 'fruit'], veg: ['veg'], fat: ['fat']
};

/* Five slots, built from what is easy to cook: eggs, rice, chicken, beef, plus
   no-cook extras. The defaults land at ~2,900 kcal and ~200 g protein. */
export const MEALS = [
  { id: 'm1', t: 'Breakfast', hint: 'Take Copad D3 + Zinctron with this', items: [
    { f: 'egg', g: 200 }, { f: 'toast', g: 90 }, { f: 'oil', g: 4.5 }] },
  { id: 'm2', t: 'Chicken & rice', hint: 'Prep box', items: [
    { f: 'chicken', g: 200 }, { f: 'rice', g: 350 }, { f: 'veg', g: 150 }, { f: 'oil', g: 9 }] },
  { id: 'm3', t: 'Pre-training', hint: '30–45 min before, with Argecta', items: [
    { f: 'banana', g: 240 }] },
  { id: 'm4', t: 'Yogurt bowl', hint: 'After training or mid-afternoon', items: [
    { f: 'greek', g: 250 }, { f: 'honey', g: 15 }, { f: 'oats', g: 30 }] },
  { id: 'm5', t: 'Beef & rice', hint: 'Last meal · L-carnitine goes best with this', items: [
    { f: 'beef10', g: 180 }, { f: 'rice', g: 300 }, { f: 'salad', g: 200 }] }
];
/* The meals the rice adjustment from a check-in is split across. */
export const RICE_SLOTS = ['m2', 'm5'];

/* Protein is a floor; calories, carbs and fat are read off the meals above. */
export const TARGETS = { p: 190, waterMl: 3500, steps: '8–10k' };

/* ============ supplements ============ */
/* Doses come from the doctor; timing comes from how each one is absorbed.
   `days` is 0–6, Sunday first. `load` items only show during creatine loading. */
export const SLOTS = [
  { id: 'am',  t: 'Morning',       sub: 'With breakfast' },
  { id: 'pre', t: 'Pre-training',  sub: '30–45 min before' },
  { id: 'pm',  t: 'Evening',       sub: '1 h before bed' }
];
export const SUPPS = [
  { id: 'd3',       n: 'Copad D3 10,000 IU', dose: '1 capsule', slot: 'am', days: [0, 1, 2, 3, 6],
    note: 'Fat-soluble: with a meal that has fat (the eggs) it absorbs about a third better. Confirm the days per week with your doctor.' },
  { id: 'zinc',     n: 'Zinctron',           dose: '1 capsule', slot: 'am', days: [0, 1, 2, 3, 4, 5, 6],
    note: 'With food, so it does not upset your stomach. Kept away from the magnesium on purpose.' },
  { id: 'creatine', n: 'Creatine monohydrate', dose: '5 g',     slot: 'am', days: [0, 1, 2, 3, 4, 5, 6],
    note: 'Any time, every day, training or not. Timing does not matter; consistency does.' },
  { id: 'creatine2', n: 'Creatine (loading)', dose: '5 g',      slot: 'pm', days: [0, 1, 2, 3, 4, 5, 6], load: true,
    note: 'Only for the first 14 days: 10 g a day fills the muscle stores in about a week instead of a month.' },
  { id: 'argecta',  n: 'Argecta',            dose: 'As prescribed', slot: 'pre', days: [0, 1, 2, 3, 4, 5, 6], training: true,
    note: 'With the bananas before training.' },
  { id: 'mg',       n: 'Magnesium bisglycinate 150 mg', dose: '1 capsule', slot: 'pm', days: [0, 1, 2, 3, 4, 5, 6],
    note: 'Bisglycinate is the gentle form. Modest evidence for sleep quality.' },
  { id: 'carnitine', n: 'L-Carnitine 350 mg', dose: '1 capsule', slot: 'pm', days: [0, 1, 2, 3, 4, 5, 6],
    note: 'Absorbs better with carbs, so with the last meal if you can. Weak fat-loss evidence: a bonus, not the plan.' }
];
export const CREATINE_LOAD_DAYS = 14;

/* ============ body ============ */
/* InBody 270 printouts, as entered from the paper. */
export const INBODY_SEED = [
  { d: '2025-04-07', w: 87.0, smm: 40.3, pbf: 19.0 },
  { d: '2026-05-10', w: 90.2, smm: 36.6, pbf: 28.4 },
  { d: '2026-08-11', w: 92.5, smm: 39.2, bfm: 23.6, pbf: 25.6, vf: 10, waist: 104.3, ffm: 68.9, bmr: 1857 }
];
export const WAIST0 = 104.3;
