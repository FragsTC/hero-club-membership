// Shared helpers for scene modules. Everything here must be deterministic:
// a frame is rendered by seeking the timeline, never by letting it play.

export const W = 1080;
export const H = 1920;

export function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}

export function svgEl(tag, attrs, parent) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

// Seeded random numbers (mulberry32) so every render is identical.
export function rng(seed) {
  let a = typeof seed === 'string' ? [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7) : seed | 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Escape text and turn *words* into accent spans.
export function markup(text) {
  const esc = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return esc.replace(/\*(.+?)\*/g, '<span class="pop">$1</span>');
}
export const plain = (text) => String(text).replace(/\*/g, '');

// Largest font size (px) at which `node` fits inside maxW x maxH.
// Measures the text itself (max-content), not the box it sits in. Ignores transforms.
export function fitText(node, maxW, maxH, lo = 20, hi = 900) {
  const keep = node.style.width;
  const wraps = !['nowrap', 'pre'].includes(getComputedStyle(node).whiteSpace);
  if (!wraps) node.style.width = 'max-content';
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    node.style.fontSize = mid + 'px';
    const w = wraps ? node.scrollWidth : node.offsetWidth;
    if (w <= maxW && node.offsetHeight <= maxH && node.scrollWidth <= maxW + 1) lo = mid; else hi = mid;
  }
  node.style.width = keep;
  node.style.fontSize = Math.floor(lo) + 'px';
  return Math.floor(lo);
}

// Quick decaying shake on a node, starting at time t in timeline tl.
export function shake(tl, node, t, amp = 22, dur = 0.24, seed = 1) {
  const r = rng(seed);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const k = 1 - i / steps;
    tl.to(node, { x: (r() * 2 - 1) * amp * k, y: (r() * 2 - 1) * amp * k, duration: dur / steps, ease: 'none' }, t + (dur / steps) * (i - 1));
  }
  tl.to(node, { x: 0, y: 0, duration: 0.01 }, t + dur);
}

// Slam: node appears at full force exactly on time t and settles.
// Nothing happens before the beat, so the impact and the cut coincide.
export function slam(tl, node, t, { from = 1.35, settle = 0.16, shakeNode = null, seed = 1, amp = 20 } = {}) {
  if (t > 0) gsap.set(node, { autoAlpha: 0 });
  tl.set(node, { autoAlpha: 1, scale: from }, t);
  tl.to(node, { scale: 1, duration: settle, ease: 'expo.out' }, t);
  if (shakeNode) shake(tl, shakeNode, t, amp, 0.22, seed);
}

// A four-point star like the ones in the logo.
export function starPath(cx, cy, r, thin = 0.18) {
  const t = r * thin;
  return `M${cx},${cy - r} L${cx + t},${cy - t} L${cx + r},${cy} L${cx + t},${cy + t} L${cx},${cy + r} L${cx - t},${cy + t} L${cx - r},${cy} L${cx - t},${cy - t} Z`;
}

export function colorOf(ctx, key) {
  const c = ctx.brand.colors[key];
  if (!c) throw new Error(`Unknown colour "${key}". Use one of: ${Object.keys(ctx.brand.colors).join(', ')}`);
  return c;
}

// Paint a scene root with a named colour field.
export function paint(node, c) {
  node.style.background = c.bg;
  node.style.color = c.ink;
  node.style.setProperty('--ink', c.ink);
  node.style.setProperty('--pop', c.pop);
  node.style.setProperty('--bg', c.bg);
}
