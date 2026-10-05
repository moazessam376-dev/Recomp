/* The one mutable object the views share, and the only code that touches
   storage. Works standalone (localStorage) and inside a Claude artifact
   (window.storage). */
import { blank, migrate, iso } from './logic.js';
import { toast } from './ui.js';

const KEY = 'recomp:v1';   // unchanged, so v1 data loads straight into v2

export const ctx = { S: blank(), today: iso(new Date()), selDay: null, full: false };

const store = {
  async load() {
    try {
      if (window.storage && window.storage.get) {
        const r = await window.storage.get(KEY);
        return r && r.value ? JSON.parse(r.value) : null;
      }
    } catch (e) { /* key absent */ }
    let s = null;
    try { s = localStorage.getItem(KEY); } catch (e) { return null; }
    if (!s) return null;
    try { return JSON.parse(s); }
    catch (e) {
      /* Unreadable is not the same as empty. Keep the raw text before the
         first save overwrites it, so it can still be recovered by hand. */
      try { localStorage.setItem(KEY + ':unreadable:' + Date.now(), s); } catch (e2) {}
      setTimeout(() => toast('Saved data was unreadable: a copy was kept'), 500);
      return null;
    }
  },
  async save(d) {
    const s = JSON.stringify(d);
    try { if (window.storage && window.storage.set) { await window.storage.set(KEY, s); return true; } } catch (e) {}
    /* Report the failure. A tool whose whole point is the log must not lose a
       set quietly because storage is full or blocked in private browsing. */
    try { localStorage.setItem(KEY, s); return true; } catch (e) { return false; }
  }
};

export async function boot() {
  const d = await store.load();
  if (d) {
    const [s, changed] = migrate(d);
    ctx.S = s;
    if (changed) await persist();   // write the new shape back once, not every load
  }
}
export function persist() {
  return store.save(ctx.S).then(ok => { if (!ok) toast('Not saved: storage blocked'); return ok; });
}
export function replace(d) {
  const [s] = migrate(d);
  ctx.S = s;
  return persist();
}

/* Change notifications: a view re-renders the others it affects. */
const subs = [];
export const onChange = fn => subs.push(fn);
export function changed(what) { subs.forEach(fn => fn(what)); }
