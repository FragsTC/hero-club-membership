// Word stack: one word lands per beat (or per `every` beats), the colour field
// flips hard on each one, and earlier words stay as outlines above it.
// story fields: words [..], bg (one colour or a list, cycled per word), every (beats per word)
import { el, fitText, slam } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const bgs = Array.isArray(scene.bg) ? scene.bg : [scene.bg];
    const every = (scene.every || 1) * beat;
    const words = scene.words.map((w) => w.toUpperCase());
    const col = el('div', 'st-col', root.cam);
    const nodes = words.map((w) => { const n = el('div', 'st-word', col); n.textContent = w; return n; });
    // One size for all, set by the longest word.
    const longest = nodes.reduce((a, b) => (b.textContent.length > a.textContent.length ? b : a));
    const size = Math.min(fitText(longest, 960, 400), Math.floor(1500 / words.length / 0.9));
    nodes.forEach((n) => (n.style.fontSize = size + 'px'));

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    const keyAt = (i) => bgs[i % bgs.length];
    nodes.forEach((n, i) => {
      const t = i * every;
      slam(tl, n, t, { from: 1.15, shakeNode: root.cam, seed: 11 + i, amp: 16 });
      ctx.cue(t, 'hit', { v: 0.85 + 0.05 * i });
    });
    if (scene.push) tl.fromTo(col, { scale: 1 }, { scale: 1.05, duration: dur, ease: 'sine.inOut' }, 0);
    const idx = (t) => Math.min(words.length - 1, Math.floor(t / every + 1e-6));
    return {
      tl,
      render(t) {
        const k = idx(t);
        nodes.forEach((m, j) => { m.classList.toggle('st-old', j < k); m.classList.toggle('st-new', j === k); });
      },
      bgAt: (t) => keyAt(idx(t)),
    };
  },
};
