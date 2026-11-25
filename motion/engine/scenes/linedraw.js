// Line-draw: a building outline draws itself, then a water-fed pole line
// climbs it to the top window and the brush lands with a spray.
// story fields: text (big label), sub (small mono label), bg
import { el, svgEl, fitText, rng, slam } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const svg = svgEl('svg', { class: 'ld-svg', viewBox: '0 0 1080 1920', width: 1080, height: 1920 }, root.cam);
    const ink = 'var(--ink)', pop = 'var(--pop)';
    const S = { fill: 'none', stroke: ink, 'stroke-width': 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    // Two-storey house, ground line at y=1500.
    const house = [
      'M 120 1500 L 960 1500',
      'M 290 1500 L 290 870 L 560 640 L 830 870 L 830 1500',
      'M 250 905 L 560 640 L 870 905',
      'M 350 960 h 150 v 170 h -150 Z', 'M 620 960 h 150 v 170 h -150 Z',
      'M 350 1250 h 150 v 160 h -150 Z', 'M 625 1260 h 110 v 240 h -110',
      'M 425 960 v 170', 'M 695 960 v 170', 'M 425 1250 v 160', 'M 350 1045 h 150', 'M 620 1045 h 150',
      'M 505 760 h 110 v 90 h -110 Z',
    ].map((d) => svgEl('path', { d, ...S }, svg));
    // The pole: from the tech's hands at ground level up to the top window.
    const pole = svgEl('path', { d: 'M 150 1500 L 150 1420 L 540 790', ...S, stroke: pop, 'stroke-width': 14 }, svg);
    const brush = svgEl('g', {}, svg);
    svgEl('rect', { x: -46, y: -14, width: 92, height: 28, rx: 6, fill: pop }, brush);
    for (let i = -36; i <= 36; i += 12) svgEl('rect', { x: i - 3, y: -32, width: 6, height: 20, fill: pop }, brush);
    const drops = [];
    const r = rng('spray');
    for (let i = 0; i < 14; i++) drops.push({ n: svgEl('rect', { x: -5, y: -5, width: 10, height: 10, rx: 5, fill: ink }, svg), a: -Math.PI / 2 + (r() - 0.5) * 2.4, s: 140 + r() * 160 });

    const big = el('div', 'ld-text', root.cam);
    big.textContent = (scene.text || '').toUpperCase();
    fitText(big, 960, 300);
    let sub = null;
    if (scene.sub) { sub = el('div', 'ld-sub', root.cam); sub.textContent = scene.sub; }

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    const len = (p) => p.getTotalLength();
    const draw = (p, t, d, head = 0) => {
      const L = len(p);
      // hidden until it starts drawing, or the round caps show as dots
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L * (1 - head), autoAlpha: 0 });
      tl.set(p, { autoAlpha: 1 }, t + 1e-5);
      tl.to(p, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, t);
    };
    const houseEnd = Math.min(beat * 2 - 0.1, dur * 0.4);
    // the ground line is already under way on the cut frame
    house.forEach((p, i) => draw(p, (i / house.length) * houseEnd * 0.6, houseEnd * 0.45, i === 0 ? 0.3 : 0));
    // The pole tops out exactly on a beat.
    const top = Math.min(beat * 3, dur - beat * 0.5);
    const p0 = houseEnd * 0.55;
    draw(pole, p0, top - p0);
    const P = { k: 0 };
    tl.fromTo(P, { k: 0 }, { k: 1, duration: top - p0, ease: 'power2.inOut' }, p0);
    const at = top;
    ctx.cue(p0, 'riseshort', { dur: top - p0 });
    ctx.cue(at, 'pop');
    slam(tl, big, 0, { from: 1.1 });
    ctx.cue(0, 'hit', { v: 0.7 });
    if (scene.push !== false) tl.fromTo(root.cam, { scale: 1, y: 0 }, { scale: 1.1, y: 90, duration: dur, ease: 'sine.inOut' }, 0);

    return {
      tl,
      render(t) {
        const L = len(pole);
        const pt = pole.getPointAtLength(L * P.k);
        brush.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(-58)`);
        brush.style.display = t < p0 ? 'none' : '';
        drops.forEach((d) => {
          const a = t - at;
          if (a < 0 || a > 0.6) { d.n.style.display = 'none'; return; }
          d.n.style.display = '';
          const x = pt.x + Math.cos(d.a) * d.s * a * 2;
          const y = pt.y + Math.sin(d.a) * d.s * a * 2 + 900 * a * a;
          d.n.setAttribute('transform', `translate(${x} ${y}) scale(${1 - a / 0.6})`);
        });
      },
    };
  },
};
