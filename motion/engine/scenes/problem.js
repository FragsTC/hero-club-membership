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
      svgEl('rect', { x, y: 400, width: 14, height: h, rx: 7, fill: '#bfe8fa' }, dirty);
      svgEl('circle', { cx: x + 7, cy: 400 + h + 26 + r() * 20, r: 9, fill: '#bfe8fa' }, dirty);
    }
    // downspout elbow turning out at the bottom, with water pouring from it in light blue
    // (not the background blues, so it never reads as a hole in the spout)
    svgEl('path', { d: 'M 824 680 L 760 680 L 760 690 Q 760 712 736 712 L 700 712 L 700 752 L 744 752 Q 824 752 824 690 Z', fill: '#ffffff' }, clean);
    svgEl('path', { d: 'M 696 720 C 670 722 660 738 658 756', fill: 'none', stroke: '#bfe8fa', 'stroke-width': 22, 'stroke-linecap': 'round' }, clean);
    return { dirty, clean, dir: 'right', tool: 'water', stars: [[200, 280], [520, 270], [860, 700]] };
  },
  // A classic two-storey house, face-on and symmetric: wide gable roof with a chimney, a covered
  // porch with columns over the front door, shuttered windows, lap siding, bushes along the base.
  // dirty = green algae film on the siding; clean = bright boards.
  siding(svg, r) {
    const defs = svgEl('defs', {}, svg);
    const base = svgEl('g', {}, svg);
    const L = 110, R = 790, TOP = 300, BOT = 716;                 // the siding: one wide wall
    const body = `M ${L} ${TOP} L ${R} ${TOP} L ${R} ${BOT} L ${L} ${BOT} Z`;
    const cp = svgEl('clipPath', { id: 'pbHouse' }, defs); svgEl('path', { d: body }, cp);
    svgEl('ellipse', { cx: 450, cy: 722, rx: 420, ry: 26, fill: '#003b64', opacity: 0.28 }, base);   // ground shadow
    // chimney (behind the roof), roof with shingle rows, small entry gable
    svgEl('rect', { x: 630, y: 100, width: 56, height: 120, fill: '#b9c4d3' }, base);
    svgEl('rect', { x: 622, y: 92, width: 72, height: 16, fill: '#8ea0b5' }, base);
    svgEl('path', { d: `M 70 ${TOP + 6} L 250 130 L 650 130 L 830 ${TOP + 6} Z`, fill: '#003b64' }, base);
    for (let y = 160; y < TOP; y += 34) { const k = (y - 130) / (TOP + 6 - 130);
      svgEl('rect', { x: 250 - 180 * k, y, width: 400 + 360 * k, height: 4, fill: '#0b4f80' }, base); }
    svgEl('rect', { x: 64, y: TOP, width: 772, height: 14, fill: '#002a47' }, base);                // eave
    // siding boards
    const sb = svgEl('g', { 'clip-path': 'url(#pbHouse)' }, base);
    svgEl('rect', { x: 0, y: 0, width: AW, height: AH, fill: '#f6f8fb' }, sb);
    for (let y = TOP + 6; y < BOT; y += 28) {
      svgEl('rect', { x: 0, y: y + 18, width: AW, height: 10, fill: '#d3dce7' }, sb);
      svgEl('rect', { x: 0, y: y + 18, width: AW, height: 2.5, fill: '#93a5ba' }, sb);
    }
    const dirty = svgEl('g', {}, svg), clean = svgEl('g', {}, svg);
    const grime = svgEl('g', { 'clip-path': 'url(#pbHouse)' }, dirty);
    // where it grows: heaviest low on the wall (rain splash) and on the shaded left end
    const blur = svgEl('filter', { id: 'pbSoft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    svgEl('feGaussianBlur', { stdDeviation: 44 }, blur);
    const mask = svgEl('mask', { id: 'pbGrow', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: AW, height: AH }, defs);
    const mg = svgEl('g', { filter: 'url(#pbSoft)' }, mask);
    svgEl('rect', { x: 0, y: 520, width: AW, height: 280, fill: '#fff' }, mg);
    svgEl('ellipse', { cx: 190, cy: 480, rx: 220, ry: 300, fill: '#fff' }, mg);
    svgEl('ellipse', { cx: 700, cy: 430, rx: 160, ry: 150, fill: '#fff', opacity: 0.7 }, mg);
    svgEl('ellipse', { cx: 720, cy: 640, rx: 130, ry: 120, fill: '#fff', opacity: 0.8 }, mg);
    svgEl('ellipse', { cx: 560, cy: 340, rx: 110, ry: 60, fill: '#fff', opacity: 0.55 }, mg);
    const growth = (id, freq, seed, rgb, k, b) => {
      const f = svgEl('filter', { id, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, defs);
      svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: freq, numOctaves: 4, seed }, f);
      svgEl('feColorMatrix', { type: 'matrix', values: `0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  ${k} 0 0 0 ${b}` }, f);
    };
    growth('pbAlgae', '0.02 0.028', 7, [0.38, 0.52, 0.2], 3.0, -0.75);
    growth('pbAlgae2', '0.055 0.075', 3, [0.27, 0.4, 0.13], 3.4, -1.35);
    growth('pbAlgae3', '0.3', 11, [0.22, 0.3, 0.1], 4, -2.25);
    const grow = svgEl('g', { mask: 'url(#pbGrow)', opacity: 1 }, grime);
    for (let y = TOP + 6; y < BOT; y += 28) svgEl('rect', { x: L, y: y + 17, width: R - L, height: 8, fill: '#4b6a28', opacity: 0.5 }, grow);
    for (const id of ['pbAlgae', 'pbAlgae2', 'pbAlgae3']) svgEl('rect', { x: 0, y: 0, width: AW, height: AH, filter: `url(#${id})` }, grow);
    for (let i = 0; i < 18; i++) {
      const x = L + 20 + r() * (R - L - 40), y = TOP + 30 + Math.floor(r() * 12) * 28 + 20, h = 40 + r() * 110, w = 3 + r() * 4;
      svgEl('path', { d: `M ${x} ${y} L ${x + w} ${y} L ${x + w * 0.6} ${y + h} L ${x + w * 0.4} ${y + h} Z`, fill: '#3f5a22', opacity: (0.3 + r() * 0.3).toFixed(2) }, grime);
    }
    // details above the algae: trim, windows with shutters, porch, door, steps
    const det = svgEl('g', {}, svg);
    svgEl('rect', { x: L - 6, y: TOP + 10, width: 22, height: BOT - TOP - 10, fill: '#ffffff' }, det);
    svgEl('rect', { x: R - 16, y: TOP + 10, width: 22, height: BOT - TOP - 10, fill: '#ffffff' }, det);
    const win = (cx, y, w, h) => {
      svgEl('rect', { x: cx - w / 2 - 34, y, width: 22, height: h, fill: '#003b64' }, det);            // shutters
      svgEl('rect', { x: cx + w / 2 + 12, y, width: 22, height: h, fill: '#003b64' }, det);
      svgEl('rect', { x: cx - w / 2 - 8, y: y - 8, width: w + 16, height: h + 16, fill: '#ffffff' }, det);
      svgEl('rect', { x: cx - w / 2, y, width: w, height: h, fill: '#0075aa' }, det);
      svgEl('rect', { x: cx - 4, y, width: 8, height: h, fill: '#ffffff' }, det);
      svgEl('rect', { x: cx - w / 2, y: y + h / 2 - 4, width: w, height: 8, fill: '#ffffff' }, det);
      svgEl('rect', { x: cx - w / 2 - 12, y: y + h + 6, width: w + 24, height: 12, fill: '#ffffff' }, det);  // sill
    };
    win(210, 350, 96, 112); win(450, 350, 96, 112); win(690, 350, 96, 112);
    win(210, 540, 96, 112); win(690, 540, 96, 112);
    // porch: roof with a small gable, two columns, door, steps
    svgEl('path', { d: 'M 330 508 L 450 446 L 570 508 Z', fill: '#003b64' }, det);
    svgEl('path', { d: 'M 360 500 L 450 456 L 540 500 Z', fill: '#f6f8fb' }, det);
    svgEl('rect', { x: 320, y: 506, width: 260, height: 18, fill: '#002a47' }, det);
    svgEl('rect', { x: 340, y: 524, width: 18, height: 192, fill: '#ffffff' }, det);
    svgEl('rect', { x: 542, y: 524, width: 18, height: 192, fill: '#ffffff' }, det);
    svgEl('rect', { x: 398, y: 556, width: 104, height: 160, fill: '#ffffff' }, det);
    svgEl('rect', { x: 410, y: 568, width: 80, height: 148, fill: '#003b64' }, det);
    svgEl('circle', { cx: 478, cy: 646, r: 6, fill: '#fcaf17' }, det);
    svgEl('rect', { x: 330, y: 716, width: 240, height: 14, fill: '#ffffff' }, det);
    svgEl('rect', { x: 350, y: 730, width: 200, height: 14, fill: '#dfe5ee' }, det);
    // leafy bushes along the foundation, either side of the steps
    const bush = svgEl('g', {}, svg);
    for (const [cx, cy, w] of [[160, 714, 120], [280, 718, 90], [620, 718, 90], [740, 714, 120]]) {
      for (let k = 0; k < 9; k++) {
        const a = k / 9 * Math.PI, x = cx + Math.cos(a) * w * 0.42 * (0.6 + r() * 0.5), y = cy - Math.sin(a) * w * 0.28 - r() * 10;
        svgEl('circle', { cx: x, cy: y, r: w * (0.2 + r() * 0.1), fill: k % 3 ? '#3f6f3a' : '#2f5a2d' }, bush);
      }
      for (let k = 0; k < 5; k++) svgEl('circle', { cx: cx - w * 0.3 + r() * w * 0.6, cy: cy - w * 0.2 - r() * w * 0.15, r: w * (0.09 + r() * 0.06), fill: '#5c8f4f' }, bush);
    }
    return { dirty, clean, dir: 'down', tool: 'spray', stars: [[150, 330], [760, 470], [600, 620]] };
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
export { ART, AW, AH };
