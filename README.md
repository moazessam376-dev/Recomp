# Recomp

A tool to track my gym meals and log training.

**Live:** https://moazessam376-dev.github.io/Recomp/

A single-page app with no build step and no backend. Four tabs (Train, Food,
Body, Plan) backed by `localStorage` and a service worker, so it opens
instantly and keeps working with no signal in the gym.

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
| `index.html` | the entire app: markup, styles and logic |
| `sw.js` | service worker: offline shell and asset cache |
| `manifest.webmanifest` | name, colours and icons for installation |
| `PLAN.md` | the training and nutrition plan the app is built around |
| `.github/workflows/deploy.yml` | publishes to Pages on every push to `main` |

## Changing it

Edit `index.html` and push to `main`: the workflow redeploys. The page is
fetched network-first, so an installed phone picks up the new version on its
next launch; static assets stay cache-first, and bumping `CACHE` in `sw.js`
forces those to refresh too.

The program, meals and targets are plain data near the top of the script in
`index.html` (`PROGRAM`, `MEALS`, `KCAL`, `PROT`, `WAIST0`): that is the part
to edit when the plan moves on. `PLAN.md` is the prose version and does not
drive the app.
