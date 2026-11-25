// Plan cards: one card lands per beat (a hit each), then they hold.
// story fields: bg, items [{ name, medal (colour), tag (optional pill), lines: [..] }], every (beats per card),
//               price (headline that lands on the beat after the last card), fine (small print under it)
import { el, fitText, slam, markup } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const every = (scene.every || 1) * beat;
    const col = el('div', 'ti-col', root.cam);
    const head = scene.price ? el('div', 'ti-price', col, markup(scene.price)) : null;
    const fine = scene.fine ? el('div', 'ti-fine', col, scene.fine) : null;
    if (head) fitText(head, 940, 330, 30, 200);
    const cards = scene.items.map((it) => {
      const c = el('div', 'ti-card', col);
      const m = el('div', 'ti-medal', c);
      m.style.background = it.medal || 'var(--pop)';
      const body = el('div', 'ti-body', c);
      const head = el('div', 'ti-head', body);
      el('div', 'ti-name', head, it.name);
      if (it.tag) el('div', 'ti-tag', head, it.tag);
      it.lines.forEach((l, i) => el('div', i === 0 ? 'ti-line' : 'ti-line ti-pop', body, l));
      return c;
    });
    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    cards.forEach((c, i) => {
      slam(tl, c, i * every, { from: 1.12, shakeNode: root.cam, seed: 40 + i, amp: 12 });
      ctx.cue(i * every, 'hit', { v: 0.8 + 0.08 * i });
    });
    if (head) {
      const t = scene.items.length * every;
      slam(tl, head, t, { from: 1.3, shakeNode: root.cam, seed: 47, amp: 16 });
      ctx.cue(t, 'hit', { v: 1.05 });
      if (fine) { gsap.set(fine, { autoAlpha: 0 }); tl.set(fine, { autoAlpha: 1 }, t + beat * 0.5); }
    }
    if (scene.push !== false) tl.fromTo(col, { scale: 1 }, { scale: 1.04, duration: dur, ease: 'sine.inOut' }, 0);
    return { tl };
  },
};
