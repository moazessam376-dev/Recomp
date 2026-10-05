/* Small UI toolkit: toast, haptics, bottom sheet, and animated rings, bars and
   numbers. Views re-render with innerHTML, which would normally kill every
   transition - so animated values remember what they last showed (by key) and
   are tweened from there after each render. */

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(t._x); t._x = setTimeout(() => t.classList.remove('show'), 1700);
}
export function buzz(p = 8) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

export const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
export const ck = (on, cls = '', pop = false) => `<span class="ck ${cls}${on ? ' on' : ''}${pop ? ' pop' : ''}">${CHECK}</span>`;
export const icon = d => `<svg class="i" viewBox="0 0 24 24">${d}</svg>`;
export const I = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  img: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  chev: '<path d="M6 9l6 6 6-6"/>'
};

/* ============ animated values ============ */
const mem = {};
const C = 2 * Math.PI * 42;   // ring circumference for r=42 in a 100 viewBox

export function ring(key, ratio, inner = '', { color = 'var(--brass)', width = 8, cls = '' } = {}) {
  const from = mem['r:' + key] ?? 0;
  return `<div class="ringwrap ${cls}"><svg viewBox="0 0 100 100">
    <circle class="bg" cx="50" cy="50" r="42" stroke-width="${width}"/>
    <circle class="fg" cx="50" cy="50" r="42" stroke-width="${width}" stroke="${color}"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(from, 1))}"
      data-ring="${key}" data-to="${ratio}"/></svg><div class="ringval">${inner}</div></div>`;
}
export function bar(key, ratio, ghost = 0) {
  const r = Math.min(ratio, 1), cls = ratio > 1.06 ? ' over' : ratio >= .95 ? ' hit' : '';
  return `<div class="track"><div class="ghost" data-bar="g:${key}" data-to="${Math.min(ghost, 1)}" style="width:${(mem['b:g:' + key] ?? 0) * 100}%"></div>
    <div class="fill${cls}" data-bar="${key}" data-to="${r}" style="width:${(mem['b:' + key] ?? 0) * 100}%"></div></div>`;
}
/* `zero`: count up from 0 the first time. Off for things like body weight,
   where climbing from 0 to 100 kg is noise, not information. */
export function count(key, val, digits = 0, zero = true) {
  if (!zero && mem['c:' + key] == null) mem['c:' + key] = val;
  const from = mem['c:' + key] ?? 0;
  return `<span data-count="${key}" data-to="${val}" data-d="${digits}">${fmt(from, digits)}</span>`;
}
const fmt = (v, d) => d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US');

/* Call after inserting rendered HTML. */
export function animate(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('[data-ring]', root).forEach(el => {
      const to = +el.dataset.to; mem['r:' + el.dataset.ring] = to;
      el.style.strokeDashoffset = C * (1 - Math.min(Math.max(to, 0), 1));
    });
    $$('[data-bar]', root).forEach(el => {
      const to = +el.dataset.to; mem['b:' + el.dataset.bar] = to;
      el.style.width = Math.max(0, to) * 100 + '%';
    });
    $$('[data-count]', root).forEach(el => {
      const k = el.dataset.count, to = +el.dataset.to, d = +el.dataset.d, from = mem['c:' + k] ?? 0;
      mem['c:' + k] = to;
      if (reduced() || from === to) { el.textContent = fmt(to, d); return; }
      const t0 = performance.now(), dur = 700;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * e, d);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // Frames can be throttled (backgrounded tab, low power): land on the value regardless.
      setTimeout(() => { if (mem['c:' + k] === to) el.textContent = fmt(to, d); }, dur + 150);
    });
  }));
}

/* ============ bottom sheet ============ */
let onClose = null;
export function sheet(title, html, mount, close) {
  const sh = $('#sheet');
  sh.innerHTML = `<div class="grab"><i></i></div>
    <div class="sheet-head"><h2>${title}</h2><button class="icon-btn" data-close>${icon(I.x)}</button></div>
    <div class="sheet-body">${html}</div>`;
  onClose = close || null;
  $('#scrim').classList.add('show');
  requestAnimationFrame(() => sh.classList.add('show'));
  $('[data-close]', sh).onclick = closeSheet;
  dragToClose(sh);
  if (mount) mount($('.sheet-body', sh));
  return sh;
}
export function closeSheet() {
  const sh = $('#sheet');
  sh.classList.remove('show'); sh.style.transform = '';
  $('#scrim').classList.remove('show');
  const f = onClose; onClose = null; if (f) f();
}
export function sheetBody(html) { const b = $('#sheet .sheet-body'); if (b) b.innerHTML = html; return b; }
function dragToClose(sh) {
  let y0 = null, dy = 0;
  const zones = [$('.grab', sh), $('.sheet-head', sh)];
  zones.forEach(z => {
    z.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; sh.classList.add('drag'); }, { passive: true });
    z.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      sh.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    const end = () => {
      sh.classList.remove('drag');
      if (dy > 90) closeSheet(); else sh.style.transform = '';
      y0 = null; dy = 0;
    };
    z.addEventListener('touchend', end);
    z.addEventListener('touchcancel', end);
  });
}
document.addEventListener('DOMContentLoaded', () => { $('#scrim').onclick = closeSheet; });
