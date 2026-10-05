# Recomp

A tool to track my gym meals and log training.

**Live:** https://moazessam376-dev.github.io/Recomp/

A small web app with no build step and no backend. Five tabs, backed by
`localStorage` and a service worker, so it opens instantly and keeps working
with no signal in the gym:

- **Today:** next session, protein, calories and water rings, the next meal,
  and the supplement checklist by time of day.
- **Train:** Upper/Lower ×2 with set logging, double-progression targets, a rest
  timer that starts on its own, and form photos with cues for every exercise.
- **Food:** five planned meals you tick off, swaps that keep the protein or carbs
  the same, and extras for anything off-plan.
- **Body:** trend weight, waist, InBody scans, and a check-in that adjusts the
  rice when the trend says so.
- **Plan:** the numbers with the research behind them, the supplement editor,
  and backup and restore.

## One-time setup

Pages has to be switched on once, by hand, before the first deploy can publish:

**Settings → Pages → Build and deployment → Source → GitHub Actions.**

The workflow cannot do this for you. Creating a Pages site needs
`administration` scope and the Actions `GITHUB_TOKEN` is never granted it, so
it fails with *Resource not accessible by integration*. Once the source is set,
re-run the latest **Deploy to GitHub Pages** run and every push after that
deploys on its own.

## Install it on your phone

Open the link above, then:

- **iPhone (Safari):** Share → *Add to Home Screen*. It has to be Safari;
  Chrome on iOS cannot install web apps.
- **Android (Chrome):** menu → *Install app* / *Add to Home screen*.

It launches full screen with no browser chrome and works offline after the
first load.

## Where the data lives

On the phone, in that browser's storage for this site: nothing is uploaded and
there is no account. Two things follow from that:

- The Home Screen app and the browser tab share one store on Android, but on
  iOS an installed app gets its own. Pick one and stay in it.
- Clearing site data, or iOS reclaiming storage from an app you have not opened
  in weeks, wipes the log. **Plan → Save a backup** writes one `.json` file and
  opens the share sheet, so it can go straight into Files or Notes.
  **Plan → Restore from a backup** reads one back, from a file or pasted text,
  and asks before replacing anything.

## What's here

| File | |
|---|---|
| `index.html` | the shell: header, the five views, nav |
| `css/app.css` | all styles and animations |
| `js/data.js` | **the plan as data:** program, foods, meals, supplements, targets |
| `js/logic.js` | pure rules: progression, ramp weeks, macros, swaps, trend, check-in, migration |
| `js/state.js` | storage, and the one state object the views share |
| `js/ui.js` | toast, bottom sheet, animated rings, bars and numbers |
| `js/today.js` `train.js` `food.js` `body.js` `plan.js` | one module per tab |
| `js/app.js` | boot, tabs, midnight rollover |
| `img/ex/` | two form photos per exercise, from free-exercise-db (public domain) |
| `tests/` | Node tests for `logic.js`: run `npm test` |
| `sw.js` | service worker: offline cache for the app and the photos |
| `manifest.webmanifest` | name, colours and icons for installation |
| `PLAN.md` | the plan in prose, with the research behind every number |
| `.github/workflows/deploy.yml` | runs the tests, then publishes to Pages on every push to `main` |

## Changing it

Edit, run `npm test`, and push to `main`: the workflow tests and redeploys. The
page, scripts and styles are fetched network-first, so an installed phone picks
up the new version on its next launch with all of them from the same deploy.
Photos and icons stay cache-first; bump `CACHE` in `sw.js` when you add or
replace any.

To try it locally, serve the folder (ES modules do not load from `file://`):

```
python3 -m http.server 8642
```

The program, meals, foods, supplements and targets live in `js/data.js`. That
is the file to edit when the plan moves on. `PLAN.md` is the prose version and
does not drive the app. Logs from the old 3-day app load as they are: lifts
shared with the new split (Smith squat, RDL, leg press and others) keep their
history.
