// Line-draw: a house outline draws itself, a tech steps in, and a water-fed pole
// telescopes up to the top window; the brush scrubs and water runs down the glass.
// story fields: text (big label), sub (small mono label), bg
import { el, svgEl, fitText, rng, slam, starPath } from '../lib.js';

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
    // A tech stands on the ground in front of the house; from this straight-on view the
    // pole (leaning into the wall) reads as vertical. The brush sits flat on the top window.
    const X = 560, FOOT = 1500, TIP = 818, TX = X - 34; // TX: the tech stands just left of the pole
    const hose = svgEl('path', { d: `M ${X} 1425 C ${X} 1478 ${X - 40} 1490 ${X - 100} 1490 L 40 1490`, ...S, stroke: pop, 'stroke-width': 7 }, svg);
    const tech = svgEl('g', {}, svg);
    // flat silhouette with an outline in the background colour so it sits in front of the house lines
    const sil = { fill: pop, stroke: 'var(--bg)', 'stroke-width': 8, 'paint-order': 'stroke' };
    svgEl('rect', { x: TX - 24, y: 1415, width: 20, height: FOOT - 1415, rx: 6, ...sil }, tech);
    svgEl('rect', { x: TX + 4, y: 1415, width: 20, height: FOOT - 1415, rx: 6, ...sil }, tech);
    svgEl('rect', { x: TX - 32, y: 1328, width: 64, height: 102, rx: 20, ...sil }, tech);
    svgEl('circle', { cx: TX - 4, cy: 1298, r: 25, ...sil }, tech);
    const pole = svgEl('path', { d: `M ${X} 1425 L ${X} ${TIP}`, ...S, stroke: pop, 'stroke-width': 12, 'stroke-linecap': 'butt' }, svg);
    const arms = svgEl('g', {}, svg);
    svgEl('path', { d: `M ${TX + 8} 1350 L ${X - 4} 1395`, fill: 'none', stroke: pop, 'stroke-width': 16, 'stroke-linecap': 'round' }, arms);
    svgEl('path', { d: `M ${TX + 22} 1340 L ${X - 4} 1318`, fill: 'none', stroke: pop, 'stroke-width': 16, 'stroke-linecap': 'round' }, arms);
    // brush head: a bar with bristles top and bottom, face-on against the glass
    const brush = svgEl('g', {}, svg);
    svgEl('rect', { x: -52, y: -13, width: 104, height: 26, rx: 5, fill: pop }, brush);
    for (let i = -44; i <= 44; i += 11) {
      svgEl('rect', { x: i - 2.5, y: -24, width: 5, height: 11, fill: pop }, brush);
      svgEl('rect', { x: i - 2.5, y: 13, width: 5, height: 11, fill: pop }, brush);
    }
    // water running down the pane under the brush
    const r = rng('rinse');
    const drops = Array.from({ length: 7 }, (_, i) => ({
      n: svgEl('rect', { x: -3, y: 0, width: 6, height: 14, rx: 3, fill: ink }, svg),
      x: X - 42 + i * 14 + (r() - 0.5) * 6, d: r() * 0.35, v: 120 + r() * 60,
    }));
    const glint = svgEl('path', { d: starPath(0, 0, 30), fill: 'var(--ink)' }, svg);

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
    // tech steps in, hose runs out, pole telescopes up and lands on the glass on the beat
    gsap.set([tech, arms], { autoAlpha: 0 });
    tl.set([tech, arms], { autoAlpha: 1 }, p0 - 0.12);
    tl.fromTo([tech, arms], { y: 40 }, { y: 0, duration: 0.18, ease: 'expo.out' }, p0 - 0.12);
    draw(hose, p0 - 0.1, 0.35);
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
        const a = t - at;
        // after landing the brush scrubs side to side and the pole tip follows it
        const dx = a > 0 ? 16 * Math.sin(a * Math.PI * 2 * 3) * Math.exp(-a * 1.2) : 0;
        const y = 1425 - (1425 - TIP) * P.k;
        if (a > 0) { pole.setAttribute('d', `M ${X} 1425 L ${X + dx} ${TIP}`); pole.style.strokeDasharray = 'none'; }
        else { pole.setAttribute('d', `M ${X} 1425 L ${X} ${TIP}`); }
        brush.setAttribute('transform', `translate(${X + dx} ${y - 12})`);
        brush.style.display = t < p0 ? 'none' : '';
        drops.forEach((d) => {
          const k = a - d.d;
          const life = 0.5;
          const kk = ((k % life) + life) % life;
          if (k < 0) { d.n.style.display = 'none'; return; }
          d.n.style.display = '';
          d.n.setAttribute('transform', `translate(${d.x + dx * 0.5} ${TIP + 18 + kk * d.v})`);
          d.n.style.opacity = 1 - kk / life;
        });
        const g = a - 0.45;
        glint.style.display = g < 0 || g > 0.5 ? 'none' : '';
        glint.setAttribute('transform', `translate(${X + 70} ${TIP - 50}) scale(${Math.sin(Math.max(0, g) / 0.5 * Math.PI)}) rotate(${g * 180})`);
      },
    };
  },
};
