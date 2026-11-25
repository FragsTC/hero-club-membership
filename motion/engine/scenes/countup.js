// Count-up: scoreboard digits roll up to each number, each one landing on a beat.
// story fields: items [{ value, prefix, suffix, label }], bg
import { el, fitText } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const items = scene.items;
    const wrap = el('div', 'cu-wrap', root.cam);
    const boards = items.map((it) => {
      const b = el('div', 'cu-item', wrap);
      const row = el('div', 'cu-row', b);
      if (it.prefix) el('span', 'cu-fix', row, it.prefix);
      const digits = String(it.value).length;
      const cols = [];
      for (let i = 0; i < digits; i++) {
        const cell = el('span', 'cu-cell', row);
        const strip = el('span', 'cu-strip', cell);
        for (let d = 0; d <= 10; d++) el('span', 'cu-d', strip, String(d % 10));
        el('span', 'cu-split', cell);
        cols.push(strip);
      }
      if (it.suffix) el('span', 'cu-fix', row, it.suffix);
      const lab = el('div', 'cu-label', b, it.label || '');
      return { b, row, cols, lab, it, digits };
    });
    // Same digit size for every board.
    const sizes = boards.map((bd) => fitText(bd.row, 900, 560, 40, 520));
    const size = Math.min(...sizes);
    boards.forEach((bd) => { bd.row.style.fontSize = size + 'px'; fitText(bd.lab, 900, 150, 20, 140); });

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    // Land the first on beat 2, the next on beat 3, ...
    const lands = boards.map((_, i) => Math.min(dur - beat * 0.5, beat * (2 + i)));
    const starts = boards.map((_, i) => (i === 0 ? 0.05 : lands[i - 1] - beat * 0.9));
    const vals = boards.map(() => ({ v: 0 }));
    boards.forEach((bd, i) => {
      gsap.set(bd.b, { autoAlpha: 0 });
      tl.set(bd.b, { autoAlpha: 1 }, Math.max(0, starts[i] - 0.05));
      tl.fromTo(bd.b, { y: 80 }, { y: 0, duration: 0.25, ease: 'expo.out' }, Math.max(0, starts[i] - 0.05));
      tl.fromTo(vals[i], { v: 0 }, { v: bd.it.value, duration: lands[i] - starts[i], ease: 'power2.out' }, starts[i]);
      // a tick each time the number changes, a hit when it lands
      const ease = gsap.parseEase('power2.out');
      let last = 0;
      const n = 120;
      for (let s = 1; s <= n; s++) {
        const k = s / n;
        const v = Math.floor(ease(k) * bd.it.value);
        if (v !== last) { last = v; if (v < bd.it.value) ctx.cue(starts[i] + k * (lands[i] - starts[i]), 'tick', { v: 0.5 }); }
      }
      ctx.cue(lands[i], 'hit', { v: 0.8 });
      tl.fromTo(bd.row, { scale: 1.12 }, { scale: 1, duration: 0.18, ease: 'expo.out' }, lands[i]);
    });
    if (scene.push !== false) tl.fromTo(wrap, { scale: 1 }, { scale: 1.06, duration: dur, ease: 'sine.inOut' }, 0);

    return {
      tl,
      render() {
        boards.forEach((bd, i) => {
          // odometer: the lower digit rolls smoothly, the higher ones turn over as it passes 9
          const v = vals[i].v;
          for (let p = 0; p < bd.digits; p++) {
            const place = 10 ** (bd.digits - 1 - p);
            let pos = (v / place) % 10;
            if (p < bd.digits - 1) {
              const below = (v % place) / place; // 0..1
              const base = Math.floor(v / place) % 10;
              pos = base + Math.max(0, (below - 0.9) * 10);
            }
            if (v >= bd.it.value) pos = Math.floor(bd.it.value / place) % 10;
            bd.cols[p].style.transform = `translateY(${-pos * 100 / 11}%)`;
          }
        });
      },
    };
  },
};
