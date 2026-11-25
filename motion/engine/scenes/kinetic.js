// Giant kinetic word that fills the screen.
// story fields: text, bg, mode, to, toBg, at (beat of the change, default half way), sub (small line under a slam)
//   mode "slam"  : the word slams in on the cut (a hit).
//   mode "morph" : letters flip one by one from `text` into `to`.
//   mode "swap"  : a squeegee wipes across mid-scene, revealing `to` on `toBg`.
import { el, fitText, slam, colorOf, paint, starPath, svgEl, rng } from '../lib.js';

function word(parent, text, cls = '') {
  const w = el('div', 'kw-word ' + cls, parent);
  w.textContent = text;
  return w;
}

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const mode = scene.mode || 'slam';
    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    const at = scene.at != null ? scene.at * beat : Math.round(dur / beat / 2) * beat;

    if (mode === 'slam') {
      const w = word(root.cam, scene.text);
      fitText(w, 980, scene.sub ? 420 : 1500);
      slam(tl, w, 0, { shakeNode: root.cam, seed: 3 });
      ctx.cue(0, 'hit');
      if (scene.sub) {
        const sub = el('div', 'kw-sub', root.cam, scene.sub);
        gsap.set(sub, { autoAlpha: 0 });
        tl.set(sub, { autoAlpha: 1 }, beat);
        tl.fromTo(sub, { y: 24 }, { y: 0, duration: 0.2, ease: 'expo.out' }, beat);
        ctx.cue(beat, 'pop', { v: 0.7 });
      }
      if (scene.push) tl.to(root.cam, { scale: 1.08, duration: dur, ease: 'sine.inOut' }, 0);
      return { tl };
    }

    if (mode === 'morph') {
      const a = scene.text.toUpperCase();
      const b = (scene.to || scene.text).toUpperCase();
      const n = Math.max(a.length, b.length);
      const row = el('div', 'kw-word kw-row', root.cam);
      const cells = [];
      for (let i = 0; i < n; i++) {
        const c = el('span', 'kw-cell', row);
        c.textContent = a[i] || ' ';
        cells.push(c);
      }
      fitText(row, 980, 1500);
      slam(tl, row, 0, { shakeNode: root.cam, seed: 5 });
      ctx.cue(0, 'hit');
      const r = rng(a + b);
      const glyphs = 'ABCDEFGHJKLMNOPRSTUVWXYZ';
      const step = Math.min(0.07, (beat * 0.9) / n);
      cells.forEach((c, i) => {
        const t = at - beat * 0.9 + i * step;
        tl.to(c, { rotateX: 90, duration: step * 0.6, ease: 'power2.in' }, t);
        tl.set(c, { textContent: glyphs[Math.floor(r() * glyphs.length)] }, t + step * 0.6);
        tl.set(c, { textContent: b[i] || ' ' }, at);
        tl.to(c, { rotateX: 0, duration: step * 0.8, ease: 'back.out(3)' }, t + step * 0.6);
        ctx.cue(t, 'tick', { v: 0.6 });
      });
      ctx.cue(at, 'hit', { v: 0.8 });
      return { tl };
    }

    // ---- swap: squeegee wipe ------------------------------------------------
    const under = el('div', 'kw-layer', root.cam);
    const over = el('div', 'kw-layer', root.cam);
    const cTo = colorOf(ctx, scene.toBg || 'blue');
    paint(under, cTo);
    paint(over, colorOf(ctx, scene.bg));
    over.classList.add('kw-dirty');
    // Grime: blotches and drips drawn as flat shapes.
    const g = svgEl('svg', { class: 'kw-grime', viewBox: '0 0 1080 1920', width: 1080, height: 1920 }, over);
    const r = rng('grime' + scene.text);
    for (let i = 0; i < 70; i++) {
      const x = r() * 1080, y = r() * 1920, s = 6 + r() * 46;
      svgEl('ellipse', { cx: x, cy: y, rx: s, ry: s * (0.5 + r() * 0.7), fill: '#7a6a55', opacity: (0.08 + r() * 0.2).toFixed(2) }, g);
    }
    for (let i = 0; i < 16; i++) {
      const x = r() * 1080, y = r() * 900, l = 120 + r() * 380;
      svgEl('rect', { x, y, width: 4 + r() * 8, height: l, rx: 5, fill: '#7a6a55', opacity: (0.12 + r() * 0.18).toFixed(2) }, g);
    }
    const w1 = word(over, scene.text.toUpperCase(), 'kw-dirty-word');
    const w2 = word(under, (scene.to || 'CLEAR').toUpperCase());
    const s1 = fitText(w1, 980, 1500);
    const s2 = fitText(w2, 980, 1500);
    w1.style.fontSize = w2.style.fontSize = Math.min(s1, s2) + 'px';

    // Sparkles that pop on the clean word.
    const sp = svgEl('svg', { class: 'kw-sparkles', viewBox: '0 0 1080 1920', width: 1080, height: 1920 }, under);
    const stars = [[880, 700, 70], [960, 820, 38], [170, 1210, 54], [260, 1120, 26]].map(([x, y, s]) =>
      svgEl('path', { d: starPath(0, 0, s), fill: cTo.pop, transform: `translate(${x} ${y}) scale(0)` }, sp));

    // The squeegee: rubber blade + channel + handle, tilted a little.
    const sq = el('div', 'kw-squeegee', root.cam);
    sq.innerHTML = '<div class="sq-blade"></div><div class="sq-channel"></div><div class="sq-handle"></div>';

    slam(tl, w1, 0, { shakeNode: root.cam, seed: 7, from: 1.3 });
    ctx.cue(0, 'hit');
    const wipe = Math.min(0.42, beat * 0.85);
    const ws = at - wipe;
    // Over-layer is clipped from the left as the blade passes; ends exactly on the beat.
    // One driver for blade and wipe edge: the blade crosses the right edge exactly on the beat,
    // then the squeegee carries on off screen.
    const W = { x: -40 };
    const BLADE = 297;
    tl.fromTo(W, { x: -40 }, { x: 1080, duration: wipe, ease: 'power2.in' }, ws);
    tl.to(W, { x: 1080 + 380, duration: 0.12, ease: 'none' }, at);
    ctx.cue(ws, 'swipe', { dur: wipe });
    slam(tl, w2, at, { from: 1.12, shakeNode: null });
    tl.to(root.cam, { scale: 1.06, duration: dur - at, ease: 'sine.out' }, at);
    stars.forEach((s, i) => {
      const [x, y] = s.getAttribute('transform').match(/[\d.]+/g);
      tl.fromTo(s, { attr: { transform: `translate(${x} ${y}) scale(0) rotate(0)` } },
        { attr: { transform: `translate(${x} ${y}) scale(1) rotate(45)` }, duration: 0.25, ease: 'back.out(3)' }, at + 0.04 + i * 0.07);
      tl.to(s, { attr: { transform: `translate(${x} ${y}) scale(0.6) rotate(90)` }, duration: 0.4, ease: 'sine.inOut' }, at + 0.35 + i * 0.07);
    });
    ctx.cue(at + 0.04, 'sparkle');
    return {
      tl,
      bgAt: (t) => (t < at ? scene.bg : scene.toBg || 'blue'),
      render(t) {
        const on = t >= ws && W.x < 1080 + 370;
        sq.style.visibility = on ? 'visible' : 'hidden';
        sq.style.transform = `translateX(${W.x - BLADE}px)`;
        over.style.clipPath = t < ws ? 'none' : `inset(0 0 0 ${Math.min(1080, Math.max(0, W.x))}px)`;
      },
    };
  },
};
