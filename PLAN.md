# Recomp Plan: Upper/Lower ×2 at maintenance

**Starting point:** 182 cm, 21, ~100 kg (Oct 2026). InBody on 11 Aug 2026: 92.5 kg, skeletal muscle 39.2 kg, body fat 25.6% (23.6 kg), visceral fat level 10, waist 104.3 cm, BMR 1,857 kcal. Then about 7 weeks without training and roughly +7.5 kg, most likely fat, water and glycogen rather than muscle.

**Goal:** hold weight or gain slowly, build muscle, lose fat. Never lose weight on purpose.

**Training:** 4 days a week, about 60 minutes, Upper / Lower / Upper / Lower.

The app (`js/data.js`) is built from the numbers in this file. Sources are listed at the bottom; the short name in brackets points to them.

---

## Why maintenance, not a deficit

Recomposition, building muscle while losing fat, works best for people who are returning to training, are not very lean, and eat plenty of protein (Barakat 2020). That describes you right now. A deficit is not needed for the waist to come in, and it would work against the "do not lose weight" goal.

The old plan in this repo was 2,300 kcal, a 350 to 450 kcal deficit. This one replaces it.

---

## Nutrition

| | Daily target | Why |
|---|---|---|
| Calories | **~2,890 kcal** | Estimated maintenance. Your BMR was 1,857; four sessions plus 8 to 10k steps puts you near 2,800 to 3,000. The Body tab corrects it from your real trend. |
| Protein | **190 g minimum** | ~1.9 g/kg. Gains plateau around 1.6 g/kg and the upper confidence limit is 2.2 (Morton 2018). The meals carry ~200 g. |
| Carbs | ~350 g | Whatever is left after protein and fat. They fuel the training. |
| Fat | ~75 g | About 25% of calories. Covers hormones and absorbing the D3. |
| Water | 3.5 L | About 35 ml per kg. More on training days. Creatine pulls water into muscle, which is what you want. |
| Steps | 8 to 10k | Most of the day-to-day calorie burn, and good for visceral fat. |
| Sleep | 7 to 9 h | On the same diet, 5.5 h of sleep instead of 8.5 h shifted the weight lost away from fat and toward muscle (Nedeltcheva 2010). |

Total protein for the day matters more than exact timing (Schoenfeld 2013). Spreading it across 4 or 5 meals is simply the easy way to hit 190 g.

### The meals

Built only from what you can cook: eggs, rice, chicken, beef. Plus no-cook extras: toast, bananas, Greek yogurt, honey, oats, frozen veg. Weights are **cooked** weights.

| Meal | What | kcal | Protein |
|---|---|---|---|
| **Breakfast** (with Copad D3 + Zinctron) | 4 whole eggs, 3 slices whole wheat toast, 1 tsp olive oil | 553 | 36 g |
| **Chicken & rice** | 200 g chicken breast, 350 g rice, 150 g frozen mixed veg, 2 tsp olive oil | 962 | 76 g |
| **Pre-training** (with Argecta) | 2 bananas | 214 | 3 g |
| **Yogurt bowl** | 250 g low-fat Greek yogurt, 1 tbsp honey, 30 g oats | 342 | 29 g |
| **Beef & rice** (last meal, with L-carnitine) | 180 g beef mince (10% fat), 300 g rice, cucumber and tomato salad | 817 | 57 g |
| **Total** | | **~2,890** | **~201 g** |

On rest days, eat the bananas any time; the day still adds up.

**Swaps.** Any food in the app can be swapped for another in its group. The amount is recalculated so the meal keeps the same protein (for a meat slot) or the same carbs (for a rice slot). For example, 200 g chicken becomes 245 g tuna or 205 g lean beef cubes, and 350 g rice becomes about 490 g potato. "Use today" changes one day; "Always use" makes it your new default.

### Cooking, twice a week (about 1 hour)

1. **Chicken breast, 1.4 kg.** Oven at 200 °C for about 25 minutes. Season well, no oil needed.
2. **Beef mince, 1.3 kg.** One pan, brown it and season it.
3. **Rice, 1 kg dry.** Makes about 2.6 kg cooked.
4. **Eggs** are cooked fresh each morning. **Frozen veg** goes in the microwave for 3 minutes per box.

Weigh after cooking and box single portions while warm. They keep 3 to 4 days in the fridge; freeze anything for later.

**Eating out:** protein first, one carb source, skip the mayo-based sauces, stop at 80% full.

---

## Training

### Rules

- **Each muscle twice a week.** At the same total volume, two sessions per muscle per week build more than one (Schoenfeld 2016a).
- **8 to 14 hard sets per muscle per week.** 10 or more sets a week grew more muscle than fewer than 5 (Schoenfeld 2017), and gains keep rising with volume up to around 20 sets, with diminishing returns (Pelland 2024). Coming back from a break, the lower half of that range is plenty.
- **Stop 1 to 3 reps short of failure.** Growth is about the same as going to failure, with much less fatigue (Refalo 2023).
- **Rest 2 to 3 minutes on the big lifts.** 3 minutes built more muscle than 1 (Schoenfeld 2016b). Supersets only pair exercises that do not compete, so they save time without costing reps.
- **Double progression.** Each lift has a rep range. Once every set reaches the top of it, add the smallest step (2.5 kg on dumbbells and most machines, 5 kg on squats, RDLs and hip thrusts, 10 kg on the leg press) and start again at the bottom. The app tells you when you have earned it.
- **Ramp, weeks 1 and 2.** One set fewer on everything, about 3 reps in reserve. This is when soreness is worst. In a study with almost your exact timeline (7 weeks of training, 7 weeks off, 7 weeks back), people grew more muscle the second time around (Seaborne 2018). In mice, the extra nuclei muscle gains from training stay through a layoff (Bruusgaard 2010).
- **Neck work** is bodyweight only in weeks 1 and 2.

### Upper A (horizontal)

| # | Exercise | Sets × reps | |
|---|---|---|---|
| 1 | Incline dumbbell press | 3 × 6–10 | on its own, 2.5 min |
| 2 | T-bar row | 3 × 8–12 | on its own, 2 min. Use the chest pad if yours has one. |
| 3 | Wide-grip lat pulldown | 3 × 10–12 | **superset** |
| 4 | Lateral raise | 3 × 12–20 | ↑ pull against shoulders |
| 5 | Overhead cable triceps extension | 2 × 10–15 | **superset** |
| 6 | Incline dumbbell curl | 2 × 10–15 | ↑ triceps against biceps |
| 7 | Neck extension | 2 × 15 | **superset** |
| 8 | Wrist curl + reverse wrist curl | 2 × 15 each | ↑ unrelated |

### Lower A (squat)

| # | Exercise | Sets × reps | |
|---|---|---|---|
| 1 | Smith squat | 3 × 6–10 | on its own, 3 min |
| 2 | Hip thrust | 3 × 8–12 | on its own, 2 min |
| 3 | Seated leg curl | 3 × 10–15 | **superset** |
| 4 | Standing calf raise | 3 × 10–15 | ↑ hamstrings against calves |
| 5 | Leg extension | 3 × 12–15 | **superset** |
| 6 | Cable crunch | 3 × 12 | ↑ quads against abs |
| 7 | Cable Pallof press | 2 × 12 per side | on its own |

### Upper B (vertical)

| # | Exercise | Sets × reps | |
|---|---|---|---|
| 1 | Hammer Strength chest press | 3 × 6–10 | on its own, 2.5 min |
| 2 | Single-arm dumbbell row | 3 × 8–12 per arm | on its own |
| 3 | Seated dumbbell shoulder press | 3 × 8–12 | **superset** |
| 4 | Neutral-grip pulldown | 3 × 10–12 | ↑ press against pull |
| 5 | Pec deck (or flat dumbbell fly if it is taken) | 2 × 12–15 | **superset** |
| 6 | Reverse pec deck | 3 × 12–20 | ↑ front against back |
| 7 | Cable pushdown | 2 × 10–15 | **superset** |
| 8 | Hammer curl | 2 × 10–15 | ↑ triceps against biceps |
| 9 | Neck flexion | 2 × 15 | on its own |

The pec deck replaces a cable fly because the cables are usually busy.

### Lower B (hinge)

| # | Exercise | Sets × reps | |
|---|---|---|---|
| 1 | Romanian deadlift | 3 × 6–10 | on its own, 3 min |
| 2 | Leg press | 3 × 10–15 | on its own, 2 min |
| 3 | Bulgarian split squat | 2 × 10 per leg | **superset** |
| 4 | Lying leg raise, straight legs | 3 × 12–15 | ↑ legs against abs. Not a knee raise. |
| 5 | Lying leg curl | 3 × 10–15 | **superset** |
| 6 | Calf press on the leg press | 3 × 12–20 | ↑ there is no seated calf machine, so this replaces it |
| 7 | Back extension (45°) | 2 × 12 | **superset** |
| 8 | Farmer's carry | 3 × 40 m | ↑ lower back against grip |

### Weekly hard sets at full volume

| Muscle | Sets |
|---|---|
| Back (rows and pulldowns) | 12 |
| Quads | 11 |
| Hamstrings | 9, plus the RDLs |
| Chest | 8, plus the shoulder press |
| Side and rear delts | 8 |
| Biceps, triceps | 4 to 5 each, plus all the pressing and rowing |
| Calves | 6 |
| Abs and core | 11 |
| Neck, forearms | twice a week each |

### Cardio

Incline treadmill walk, 20 to 30 minutes, 2 or 3 times a week, after lifting or on rest days. Cardio cut into strength and size gains mainly when it was running, and when it was frequent and long; cycling interfered far less (Wilson 2012). Low-intensity walking is lighter on the legs than either, so it is the safe choice. At maintenance calories it will not take weight off you, but it helps your heart and your visceral fat.

---

## Supplements

Doses come from your doctor. The timing below is based on how each one is absorbed.

| When | What | Notes |
|---|---|---|
| Morning, with breakfast | **Copad D3 10,000 IU** | Fat-soluble. Taken with a meal that has fat, absorption was ~32% higher (Dawson-Hughes 2015). Set to 5 days a week (Sat to Wed) in the app. **Confirm the days with your doctor.** 10,000 IU is a treatment dose, and anything above 4,000 IU a day long term should be checked with a 25(OH)D blood test. |
| Morning, with breakfast | **Zinctron** | Zinc with food avoids nausea. Kept away from the magnesium, because the two compete for absorption at high doses. |
| Morning | **Creatine monohydrate, 5 g** | Every day, training or not. Timing does not matter. |
| Evening, first 14 days only | **Creatine, 5 g more** | 10 g a day for two weeks fills your muscles in about a week instead of a month, then drop to 5 g. 3 to 5 g a day is enough to stay full, and bigger athletes may need 5 to 10 g (Hultman 1996; Kreider 2017). Expect +1 to 2 kg of water in the muscle, which is not fat. Tell your doctor you take it, because it raises blood creatinine on lab tests. |
| 30 to 45 min before training | **Argecta**, with the bananas | As prescribed. |
| About 1 hour before bed | **Magnesium bisglycinate 150 mg** | The gentle form. Modest evidence for sleep. |
| About 1 hour before bed | **L-Carnitine 350 mg** | Better with your last meal: muscle carnitine only went up when it was taken with plenty of carbs (Wall 2011). The fat-loss evidence in people who train is weak, so count it as a bonus, not as part of the plan. |

**Caffeine:** up to about 400 mg a day is fine. Stop by 4 pm, because caffeine taken even 6 hours before bed cut about an hour of sleep (Drake 2013).

---

## What to track

- **Weight, every morning** if you can: after the bathroom, before food. The app shows a smoothed trend line, because single weigh-ins swing ±1 kg with water, salt and creatine.
- **Waist at the navel, once a week.** This is the real fat-loss marker. It started at 104.3 cm.
- **Every set.** The app turns them into the next session's targets.
- **A new InBody scan** as soon as you can, then every 6 to 8 weeks. Use the same machine, in the morning, before food.

### Check-in, every 2 to 3 weeks

The Body tab does this for you once it has 2 weeks of weigh-ins:

- **Losing more than 0.2 kg a week:** add about 150 kcal of rice (roughly 60 g cooked at lunch and 60 g at dinner).
- **Gaining more than 0.5 kg a week and the waist is up more than 1 cm:** take that 150 kcal back out. Not during creatine loading or the week after, because that early gain is water in the muscle.
- **Anything in between:** the plan is working. If the scale barely moves while the waist comes in and the lifts go up, that is recomposition. The scale alone cannot show it.

---

## Sources

- **Barakat 2020.** Barakat C, et al. Body recomposition: can trained individuals build muscle and lose fat at the same time? *Strength Cond J* 42(5):7–21.
- **Morton 2018.** Morton RW, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength. *Br J Sports Med* 52:376–384.
- **Schoenfeld 2013.** Schoenfeld BJ, Aragon AA, Krieger JW. The effect of protein timing on muscle strength and hypertrophy: a meta-analysis. *JISSN* 10:53.
- **Schoenfeld 2016a.** Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. *Sports Med* 46:1689–1697.
- **Schoenfeld 2016b.** Schoenfeld BJ, et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. *J Strength Cond Res* 30:1805–1812.
- **Schoenfeld 2017.** Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. *J Sports Sci* 35:1073–1082.
- **Pelland 2024.** Pelland JC, et al. The resistance training dose-response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gain. *SportRxiv* preprint.
- **Refalo 2023.** Refalo MC, et al. Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis. *Sports Med* 53:649–665.
- **Bruusgaard 2010.** Bruusgaard JC, et al. Myonuclei acquired by overload exercise precede hypertrophy and are not lost on detraining. *PNAS* 107:15111–15116. (Mice.)
- **Seaborne 2018.** Seaborne RA, et al. Human skeletal muscle possesses an epigenetic memory of hypertrophy. *Sci Rep* 8:1898.
- **Wilson 2012.** Wilson JM, et al. Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises. *J Strength Cond Res* 26:2293–2307.
- **Nedeltcheva 2010.** Nedeltcheva AV, et al. Insufficient sleep undermines dietary efforts to reduce adiposity. *Ann Intern Med* 153:435–441.
- **Hultman 1996.** Hultman E, et al. Muscle creatine loading in men. *J Appl Physiol* 81:232–237.
- **Kreider 2017.** Kreider RB, et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. *JISSN* 14:18.
- **Dawson-Hughes 2015.** Dawson-Hughes B, et al. Dietary fat increases vitamin D-3 absorption. *J Acad Nutr Diet* 115:225–230.
- **Wall 2011.** Wall BT, et al. Chronic oral ingestion of L-carnitine and carbohydrate increases muscle carnitine content and alters muscle fuel metabolism during exercise in humans. *J Physiol* 589:963–973.
- **Drake 2013.** Drake C, et al. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. *J Clin Sleep Med* 9:1195–1200.

Food values are per 100 g from USDA FoodData Central, rounded. Exercise photos are from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain, Unlicense).

This is a training and nutrition plan, not medical advice. Supplement doses and anything to do with the vitamin D course are your doctor's call.
