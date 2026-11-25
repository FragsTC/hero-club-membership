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
      'M 440 765 h 200 v 102 h -200 Z', // top window, wide enough for the brush head
    ].map((d) => svgEl('path', { d, ...S }, svg));
    // A tech stands on the ground in front of the house; from this straight-on view the
    // pole (leaning into the wall) reads as vertical. The brush sits flat on the top window.
    const X = 560, FOOT = 1500, TIP = 862, TX = X - 34, JOIN = 1236; // TX: the tech stands just left of the pole
    const hose = svgEl('path', { d: `M ${X} 1425 C ${X} 1478 ${X - 40} 1490 ${X - 100} 1490 L 40 1490`, ...S, stroke: pop, 'stroke-width': 7 }, svg);
    const tech = svgEl('g', {}, svg);
    // flat silhouette with an outline in the background colour so it sits in front of the house lines
    const sil = { fill: pop, stroke: 'var(--bg)', 'stroke-width': 8, 'paint-order': 'stroke' };
    svgEl('rect', { x: TX - 24, y: 1415, width: 20, height: FOOT - 1415, rx: 6, ...sil }, tech);
    svgEl('rect', { x: TX + 4, y: 1415, width: 20, height: FOOT - 1415, rx: 6, ...sil }, tech);
    svgEl('rect', { x: TX - 32, y: 1328, width: 64, height: 102, rx: 20, ...sil }, tech);
    svgEl('circle', { cx: TX - 4, cy: 1298, r: 25, ...sil }, tech);
    // Pole like the real thing, in brand colours: a solid lower section in the accent colour,
    // telescoping sections above it, each joint held by a clamp collar with a lever.
    const navy = ctx.brand.colors.navy.bg;
    const poleLow = svgEl('path', { d: `M ${X} 1425 L ${X} ${JOIN}`, fill: 'none', stroke: pop, 'stroke-width': 14 }, svg);
    const pole = svgEl('path', { d: `M ${X} ${JOIN} L ${X} ${TIP}`, fill: 'none', stroke: navy, 'stroke-width': 11 }, svg);
    const clampYs = [JOIN, 1166, 1096, 1026, 956, 886];
    const clamps = clampYs.map((cy) => {
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: -11, y: -26, width: 22, height: 28, rx: 4, fill: navy }, g);
      svgEl('rect', { x: 9, y: -22, width: 14, height: 13, rx: 3, fill: pop }, g); // lever
      return { g, cy };
    });
    const arms = svgEl('g', {}, svg);
    svgEl('path', { d: `M ${TX + 8} 1350 L ${X - 4} 1395`, fill: 'none', stroke: pop, 'stroke-width': 16, 'stroke-linecap': 'round' }, arms);
    svgEl('path', { d: `M ${TX + 22} 1340 L ${X - 4} 1318`, fill: 'none', stroke: pop, 'stroke-width': 16, 'stroke-linecap': 'round' }, arms);
    // Brush head pressed on the glass, seen from behind: the solid block with an end cap,
    // bristle tips just showing round its edges, mounted off-centre on an angled gooseneck.
    const brush = svgEl('g', {}, svg);
    const bx = -110, bw = 160, by = -78, bh = 44;
    for (let i = bx + 3; i < bx + bw - 3; i += 7) {                                              // bristle tips peeking out
      svgEl('rect', { x: i, y: by - 6, width: 3, height: 8, fill: ink }, brush);
      svgEl('rect', { x: i + 3, y: by + bh - 2, width: 3, height: 8, fill: ink }, brush);
    }
    for (let j = by + 4; j < by + bh - 4; j += 7) svgEl('rect', { x: bx - 6, y: j, width: 8, height: 3, fill: ink }, brush);
    svgEl('rect', { x: bx, y: by, width: bw, height: bh, rx: 6, fill: navy, stroke: ink, 'stroke-width': 3 }, brush); // back of the block
    svgEl('rect', { x: bx + bw - 3, y: by - 4, width: 9, height: bh + 8, rx: 2, fill: navy, stroke: ink, 'stroke-width': 2 }, brush); // end cap
    svgEl('path', { d: `M 0 0 L 0 -14 L -14 ${by + bh / 2}`, fill: 'none', stroke: navy, 'stroke-width': 10, 'stroke-linejoin': 'round' }, brush); // gooseneck into the back
    svgEl('circle', { cx: -14, cy: by + bh / 2, r: 8, fill: navy, stroke: ink, 'stroke-width': 2 }, brush);
    // water running down the pane under the brush
    const r = rng('rinse');
    const drops = Array.from({ length: 7 }, (_, i) => ({
      n: svgEl('rect', { x: -3, y: 0, width: 6, height: 14, rx: 3, fill: ink }, svg),
      x: X - 100 + i * 20 + (r() - 0.5) * 6, d: r() * 0.35, v: 120 + r() * 60,
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
    gsap.set([tech, arms, poleLow], { autoAlpha: 0 });
    tl.set([tech, arms, poleLow], { autoAlpha: 1 }, p0 - 0.12);
    tl.fromTo([tech, arms, poleLow], { y: 40 }, { y: 0, duration: 0.18, ease: 'expo.out' }, p0 - 0.12);
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
        const y = JOIN - (JOIN - TIP) * P.k;
        const lean = (yy) => X + dx * (JOIN - yy) / (JOIN - TIP); // the scrub bends the upper sections
        if (a > 0) { pole.setAttribute('d', `M ${X} ${JOIN} L ${X + dx} ${TIP}`); pole.style.strokeDasharray = 'none'; }
        else { pole.setAttribute('d', `M ${X} ${JOIN} L ${X} ${TIP}`); }
        const tipY = Math.min(JOIN, y);
        // a clamp shows once the section above it has slid out
        clamps.forEach((c) => {
          c.g.style.display = t >= p0 && tipY < c.cy - 30 ? '' : 'none';
          c.g.setAttribute('transform', `translate(${lean(c.cy)} ${c.cy})`);
        });
        brush.setAttribute('transform', `translate(${X + dx} ${tipY})`);
        brush.style.display = t < p0 ? 'none' : '';
        drops.forEach((d) => {
          const k = a - d.d;
          const life = 0.5;
          const kk = ((k % life) + life) % life;
          if (k < 0) { d.n.style.display = 'none'; return; }
          d.n.style.display = '';
          d.n.setAttribute('transform', `translate(${d.x + dx} ${TIP - 30 + kk * d.v * 0.25})`);
          d.n.style.opacity = 1 - kk / life;
        });
        const g = a - 0.45;
        glint.style.display = g < 0 || g > 0.5 ? 'none' : '';
        glint.setAttribute('transform', `translate(${X + 60} ${TIP - 100}) scale(${Math.sin(Math.max(0, g) / 0.5 * Math.PI)}) rotate(${g * 180})`);
      },
    };
  },
};
