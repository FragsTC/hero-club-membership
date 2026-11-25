// Problem -> fixed: a question slams in over a flat drawing of the problem, then on a
// beat the drawing is cleaned (a wipe with the right tool) and sparkles.
// story fields: text (use \n for line breaks), art ("gutter" | "siding" | "window"), bg,
//               fixAt (beat the clean-up lands on, default 2)
import { el, svgEl, fitText, slam, rng, starPath } from '../lib.js';

const AW = 900, AH = 760; // art box

const leaf = (g, x, y, s, rot, fill) => svgEl('path', {
  d: 'M 0 -1 C 0.55 -0.6 0.55 0.6 0 1 C -0.55 0.6 -0.55 -0.6 0 -1 Z M 0 -1 L 0 1.25',
  fill, stroke: fill, 'stroke-width': 0.08, transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`,
}, g);

const ART = {
  // Gutter along an eave: dirty = packed with leaves and spilling over; clean = clear, downspout running.
  gutter(svg, r) {
    const base = svgEl('g', {}, svg);
    svgEl('rect', { x: 0, y: 60, width: AW, height: 250, fill: '#0075aa' }, base);           // roof
    for (let y = 100; y < 300; y += 50) svgEl('rect', { x: 0, y, width: AW, height: 6, fill: '#003b64', opacity: 0.45 }, base);
    for (let row = 0; row < 5; row++) for (let x = (row % 2) * 60; x < AW; x += 120) svgEl('rect', { x, y: 60 + row * 50, width: 5, height: 46, fill: '#003b64', opacity: 0.35 }, base);
    svgEl('rect', { x: 0, y: 300, width: AW, height: 70, fill: '#dfe5ee' }, base);           // fascia
    svgEl('rect', { x: 760, y: 400, width: 64, height: 360, fill: '#ffffff' }, base);        // downspout
    svgEl('rect', { x: 30, y: 300, width: 840, height: 110, rx: 12, fill: '#ffffff' }, base); // gutter
    svgEl('rect', { x: 30, y: 300, width: 840, height: 16, rx: 6, fill: '#b9c4d3' }, base);   // lip
    const dirty = svgEl('g', {}, svg), clean = svgEl('g', {}, svg);
    for (let i = 0; i < 34; i++) leaf(dirty, 50 + r() * 800, 250 + r() * 60, 26 + r() * 20, -70 + r() * 140, r() < 0.55 ? '#fcaf17' : '#d08a4a');
    for (let i = 0; i < 7; i++) {                                                             // overflow
      const x = 80 + i * 105 + r() * 30, h = 70 + r() * 120;
      svgEl('rect', { x, y: 400, width: 14, height: h, rx: 7, fill: '#009bd8' }, dirty);
      svgEl('circle', { cx: x + 7, cy: 400 + h + 26 + r() * 20, r: 9, fill: '#009bd8' }, dirty);
    }
    svgEl('path', { d: 'M 778 740 C 778 760 790 760 840 760 L 900 760', fill: 'none', stroke: '#009bd8', 'stroke-width': 26, 'stroke-linecap': 'round' }, clean);
    svgEl('rect', { x: 772, y: 690, width: 40, height: 70, fill: '#009bd8' }, clean);
    return { dirty, clean, dir: 'right', tool: 'water', stars: [[200, 280], [520, 270], [860, 700]] };
  },
  // A house front in lap siding: gable roof, corner trim and a window, so it reads as a wall.
  // dirty = green algae and streaks on the boards; clean = bright boards.
  siding(svg, r) {
    const base = svgEl('g', {}, svg);
    const wall = 'M 70 300 L 450 70 L 830 300 L 830 760 L 70 760 Z';
    const defs = svgEl('defs', {}, svg);
    const cp = svgEl('clipPath', { id: 'pbHouse' }, defs);
    svgEl('path', { d: wall }, cp);
    const boards = svgEl('g', { 'clip-path': 'url(#pbHouse)' }, base);
    svgEl('rect', { x: 0, y: 0, width: AW, height: AH, fill: '#f4f7fa' }, boards);
    for (let y = 60; y < AH; y += 48) {
      svgEl('rect', { x: 0, y: y + 34, width: AW, height: 14, fill: '#c9d3df' }, boards);  // board shadow
      svgEl('rect', { x: 0, y: y + 34, width: AW, height: 3, fill: '#8ea0b5' }, boards);   // board edge
    }
    // window and trim
    svgEl('rect', { x: 330, y: 380, width: 240, height: 250, fill: '#ffffff' }, base);
    svgEl('rect', { x: 350, y: 400, width: 200, height: 210, fill: '#0075aa' }, base);
    svgEl('rect', { x: 445, y: 400, width: 10, height: 210, fill: '#ffffff' }, base);
    svgEl('rect', { x: 350, y: 500, width: 200, height: 10, fill: '#ffffff' }, base);
    svgEl('rect', { x: 316, y: 626, width: 268, height: 20, fill: '#ffffff' }, base);    // sill
    svgEl('rect', { x: 70, y: 290, width: 30, height: 470, fill: '#ffffff' }, base);     // corner boards
    svgEl('rect', { x: 800, y: 290, width: 30, height: 470, fill: '#ffffff' }, base);
    svgEl('path', { d: 'M 20 330 L 450 40 L 880 330', fill: 'none', stroke: '#003b64', 'stroke-width': 44, 'stroke-linejoin': 'miter' }, base); // roof edge
    const dirty = svgEl('g', {}, svg), clean = svgEl('g', {}, svg);
    const grime = svgEl('g', { 'clip-path': 'url(#pbHouse)' }, dirty); // house mask inside the wipe mask
    // Where it grows: heavy along the bottom (rain splash), heavier on the shaded left side,
    // thinning out going up. A soft-edged mask made of blurred shapes.
    const blur = svgEl('filter', { id: 'pbSoft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    svgEl('feGaussianBlur', { stdDeviation: 46 }, blur);
    const mask = svgEl('mask', { id: 'pbGrow', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: AW, height: AH }, defs);
    const mg = svgEl('g', { filter: 'url(#pbSoft)' }, mask);
    svgEl('rect', { x: 0, y: 620, width: AW, height: 200, fill: '#fff' }, mg);
    svgEl('ellipse', { cx: 150, cy: 520, rx: 190, ry: 300, fill: '#fff' }, mg);
    svgEl('ellipse', { cx: 760, cy: 640, rx: 160, ry: 160, fill: '#fff', opacity: 0.8 }, mg);
    svgEl('ellipse', { cx: 470, cy: 700, rx: 260, ry: 90, fill: '#fff' }, mg);
    svgEl('ellipse', { cx: 260, cy: 300, rx: 120, ry: 110, fill: '#fff', opacity: 0.6 }, mg);
    // Mottled growth: fractal noise thresholded into green patches with ragged edges.
    const growth = (id, freq, seed, rgb, k, b) => {
      const f = svgEl('filter', { id, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, defs);
      svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: freq, numOctaves: 4, seed }, f);
      svgEl('feColorMatrix', { type: 'matrix', values: `0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  ${k} 0 0 0 ${b}` }, f);
      return f;
    };
    growth('pbAlgae', '0.018 0.026', 7, [0.42, 0.53, 0.24], 2.6, -0.95);       // broad patches
    growth('pbAlgae2', '0.05 0.07', 3, [0.3, 0.4, 0.16], 3.2, -1.55);      // darker clumps
    growth('pbAlgae3', '0.3', 11, [0.22, 0.3, 0.1], 4, -2.25);              // fine speckle
    const grow = svgEl('g', { mask: 'url(#pbGrow)', opacity: 0.9 }, grime);
    // darker build-up in the shadow under each board edge, where water sits
    for (let y = 60; y < AH; y += 48) svgEl('rect', { x: 0, y: y + 32, width: AW, height: 9, fill: '#4b6a28', opacity: 0.5 }, grow);
    svgEl('rect', { x: 0, y: 0, width: AW, height: AH, filter: 'url(#pbAlgae)' }, grow);
    svgEl('rect', { x: 0, y: 0, width: AW, height: AH, filter: 'url(#pbAlgae2)' }, grow);
    svgEl('rect', { x: 0, y: 0, width: AW, height: AH, filter: 'url(#pbAlgae3)' }, grow);
    // thin drips running down from board edges, tapering out
    for (let i = 0; i < 16; i++) {
      const x = 100 + r() * 700, y = 300 + Math.floor(r() * 8) * 48 + 36, h = 50 + r() * 140, w = 3 + r() * 4;
      if (x > 320 && x < 580 && y < 650) continue; // keep the window clear
      svgEl('path', { d: `M ${x} ${y} L ${x + w} ${y} L ${x + w * 0.6} ${y + h} L ${x + w * 0.4} ${y + h} Z`, fill: '#3f5a22', opacity: (0.35 + r() * 0.3).toFixed(2) }, grime);
    }
    return { dirty, clean, dir: 'down', tool: 'spray', stars: [[200, 420], [700, 380], [640, 700]] };
  },
  // A window: dirty = grimy grey glass; clean = clear blue glass with glints.
  window(svg, r) {
    const base = svgEl('g', {}, svg);
    const fx = 110, fy = 0, fw = 680, fh = AH;
    svgEl('rect', { x: fx, y: fy, width: fw, height: fh, rx: 14, fill: '#ffffff' }, base);
    const glass = [[fx + 34, fy + 34], [fx + fw / 2 + 10, fy + 34], [fx + 34, fy + fh / 2 + 10], [fx + fw / 2 + 10, fy + fh / 2 + 10]];
    const gw = fw / 2 - 44, gh = fh / 2 - 44;
    const clean = svgEl('g', {}, svg), dirty = svgEl('g', {}, svg);
    for (const [x, y] of glass) {
      svgEl('rect', { x, y, width: gw, height: gh, fill: '#bfe8fa' }, clean);
      svgEl('path', { d: `M ${x + 30} ${y + gh} L ${x + 90} ${y + gh} L ${x + gw} ${y + gh * 0.3} L ${x + gw} ${y + gh * 0.05} Z`, fill: '#ffffff', opacity: 0.85 }, clean);
      svgEl('rect', { x, y, width: gw, height: gh, fill: '#8d949a' }, dirty);
      for (let i = 0; i < 14; i++) svgEl('ellipse', { cx: x + r() * gw, cy: y + r() * gh, rx: 8 + r() * 34, ry: 6 + r() * 20, fill: '#5b5246', opacity: (0.2 + r() * 0.3).toFixed(2) }, dirty);
      for (let i = 0; i < 4; i++) svgEl('rect', { x: x + r() * gw, y: y + r() * gh * 0.3, width: 5 + r() * 5, height: 80 + r() * 160, rx: 4, fill: '#5b5246', opacity: 0.3 }, dirty);
    }
    return { dirty, clean, dir: 'right', tool: 'squeegee', stars: [[fx + 140, 120], [fx + fw - 90, 330], [fx + 220, 600]] };
  },
};

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const col = el('div', 'pb-col', root.cam);
    const q = el('div', 'kw-word pb-q', col);
    q.textContent = scene.text;
    fitText(q, 980, 560, 40, 300);
    const svg = svgEl('svg', { class: 'pb-art', viewBox: `0 0 ${AW} ${AH}`, width: AW, height: AH }, col);
    const art = (ART[scene.art] || ART.window)(svg, rng(scene.art || 'x'));
    // clip the dirty layer: everything behind the edge has been cleaned
    const clipId = 'pbclip' + ctx.index;
    const defs = svgEl('defs', {}, svg);
    const clip = svgEl('clipPath', { id: clipId }, defs);
    const crect = svgEl('rect', { x: 0, y: 0, width: AW, height: AH }, clip);
    art.dirty.setAttribute('clip-path', `url(#${clipId})`);
    // the tool at the edge
    const tool = svgEl('g', {}, svg);
    if (art.tool === 'squeegee') {
      // pulled: the handle leads into the dirty glass, the rubber blade trails at the clean edge
      svgEl('rect', { x: -8, y: -40, width: 16, height: AH + 80, fill: '#0a0c0f' }, tool);
      svgEl('rect', { x: 8, y: -40, width: 32, height: AH + 80, fill: '#b9c4d3' }, tool);
      svgEl('rect', { x: 36, y: AH / 2 - 26, width: 224, height: 52, rx: 26, fill: '#fcaf17' }, tool);
    } else {
      const vertical = art.dir === 'right';
      svgEl('rect', vertical ? { x: -10, y: -20, width: 20, height: AH + 40, rx: 10, fill: '#009bd8' } : { x: -20, y: -10, width: AW + 40, height: 20, rx: 10, fill: '#009bd8' }, tool);
      const r = rng('spray' + scene.art);
      for (let i = 0; i < 18; i++) {
        const a = r() * AH, b = 14 + r() * 50, s = 5 + r() * 8;
        svgEl('circle', vertical ? { cx: -b, cy: a, r: s, fill: '#009bd8' } : { cx: a * AW / AH, cy: -b, r: s, fill: '#009bd8' }, tool);
      }
    }
    const stars = art.stars.map(([x, y], i) => ({ n: svgEl('path', { d: starPath(0, 0, 34 - i * 6), fill: 'var(--pop)' }, svg), x, y }));

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    slam(tl, col, 0, { from: 1.18, shakeNode: root.cam, seed: 60 + ctx.index, amp: 18 });
    ctx.cue(0, 'hit');
    const at = (scene.fixAt ?? 2) * beat, wipe = Math.min(0.45, beat * 0.9), ws = at - wipe;
    const W = { k: 0 };
    tl.fromTo(W, { k: 0 }, { k: 1, duration: wipe, ease: 'power2.inOut' }, ws);
    ctx.cue(ws, 'swipe', { dur: wipe });
    ctx.cue(at, 'sparkle');
    tl.fromTo(svg, { scale: 1 }, { scale: 1.06, duration: 0.25, ease: 'expo.out', immediateRender: false }, at);
    tl.to(svg, { scale: 1, duration: 0.3, ease: 'sine.out' }, at + 0.25);
    if (scene.push !== false) tl.fromTo(root.cam, { scale: 1 }, { scale: 1.05, duration: dur, ease: 'sine.inOut' }, 0);

    return {
      tl,
      render(t) {
        const k = W.k;
        if (art.dir === 'right') {
          const x = k * AW;
          crect.setAttribute('x', x); crect.setAttribute('width', AW - x);
          tool.setAttribute('transform', `translate(${x} 0)`);
        } else {
          const y = k * AH;
          crect.setAttribute('y', y); crect.setAttribute('height', AH - y);
          tool.setAttribute('transform', `translate(0 ${y})`);
        }
        tool.style.display = t >= ws && t < at + 0.02 ? '' : 'none';
        art.clean.style.display = t >= ws ? '' : 'none';
        stars.forEach((s, i) => {
          const a = t - at - i * 0.07;
          const sc = a < 0 ? 0 : a < 0.25 ? gsap.parseEase('back.out(3)')(a / 0.25) : Math.max(0.6, 1 - (a - 0.25) * 0.4);
          s.n.setAttribute('transform', `translate(${s.x} ${s.y}) scale(${sc}) rotate(${a * 120})`);
        });
      },
    };
  },
};
