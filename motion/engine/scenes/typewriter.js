// Typewriter caption: text types out with a blinking block cursor.
// story fields: text (wrap *words* for the accent colour), bg, align ("left"|"center"),
//               typeEnd (0-1, share of the scene spent typing, default 0.62)
import { el, markup, fitText, rng } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const box = el('div', 'tw-box', root.cam);
    box.style.textAlign = scene.align || 'left';
    const p = el('div', 'tw-text', box);
    // Wrap each character in a span so we can reveal them one by one.
    const tmp = document.createElement('div');
    tmp.innerHTML = markup(scene.text);
    const chars = [];
    const walk = (src, dst) => {
      for (const n of src.childNodes) {
        if (n.nodeType === 3) {
          // keep words together so lines never break mid-word
          for (const word of n.textContent.split(/(\s+)/)) {
            if (!word) continue;
            const w = el('span', /\s/.test(word) ? 'tw-sp' : 'tw-word', dst);
            for (const ch of word) { const s = el('span', 'tw-ch', w); s.textContent = ch; chars.push(s); }
          }
        } else {
          const c = n.cloneNode(false); dst.appendChild(c); walk(n, c);
        }
      }
    };
    walk(tmp, p);
    const cursor = el('span', 'tw-cursor', p);

    fitText(p, 900, 1100, 40, scene.maxSize || 170);
    // Remember where each character ends so the cursor can sit after it.
    const pr = p.getBoundingClientRect();
    const pos = chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.right - pr.left, y: r.top - pr.top, h: r.height }; });
    const first = chars[0].getBoundingClientRect();
    const start = { x: first.left - pr.left, y: first.top - pr.top, h: first.height };
    cursor.style.position = 'absolute';
    const cw = Math.round(pos[0].h * 0.42);
    cursor.style.width = cw + 'px';
    cursor.style.height = Math.round(pos[0].h * 0.78) + 'px';

    // Typing schedule: a human rhythm, finishing by typeEnd of the scene.
    const r = rng(scene.text);
    const t0 = scene.typeStart ?? Math.min(beat * 0.5, 0.25);
    const t1 = dur * (scene.typeEnd ?? 0.62);
    const weights = chars.map((c) => (c.textContent === ' ' ? 1.6 : 0.7 + r() * 0.6));
    const total = weights.reduce((a, b) => a + b, 0);
    const times = [];
    let acc = t0;
    for (const w of weights) { times.push(acc); acc += ((t1 - t0) * w) / total; }
    times.forEach((t, i) => { if (chars[i].textContent.trim()) ctx.cue(t, 'click', { v: 0.7 + r() * 0.5 }); });
    // a caption after the opening is a breakdown in the music: build into the next cut
    if (ctx.index > 0 && dur >= 3 * beat) ctx.cue(dur - 2 * beat, 'riser', { dur: 2 * beat });

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0); // pin the length
    if (scene.push !== false) tl.fromTo(root.cam, { scale: 1 }, { scale: 1.05, duration: dur, ease: 'sine.inOut' }, 0);

    return {
      tl,
      render(t) {
        let n = 0;
        while (n < times.length && times[n] <= t) n++;
        chars.forEach((c, i) => (c.style.visibility = i < n ? 'visible' : 'hidden'));
        const at = n === 0 ? { x: start.x - 4, y: start.y, h: start.h } : { ...pos[n - 1], x: pos[n - 1].x + 8 };
        cursor.style.transform = `translate(${at.x}px, ${at.y + at.h * 0.14}px)`;
        // Solid while typing, then blink on the beat (on for the first half).
        const typing = t >= t0 && t <= t1 + 0.05;
        const on = typing || ((t / beat) % 1) < 0.5;
        cursor.style.opacity = on ? 1 : 0;
      },
    };
  },
};
