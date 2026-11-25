// Icon snap: a big icon does its one move exactly on a beat, with a snap sound.
// story fields: icon ("padlock" | "check" | "star"), text, bg, at (beat of the snap, default 2)
import { el, svgEl, fitText, markup, shake, starPath } from '../lib.js';

const ICONS = {
  padlock(svg) {
    const g = svgEl('g', {}, svg);
    const shackle = svgEl('path', { d: 'M -110 0 V -120 A 110 110 0 0 1 110 -120 V 0', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 52, 'stroke-linecap': 'butt' }, g);
    svgEl('rect', { x: -175, y: -20, width: 350, height: 280, rx: 34, fill: 'var(--ink)' }, g);
    svgEl('circle', { cx: 0, cy: 95, r: 34, fill: 'var(--bg)' }, g);
    svgEl('rect', { x: -14, y: 100, width: 28, height: 80, rx: 10, fill: 'var(--bg)' }, g);
    return {
      g,
      // open: shackle raised and swung; closed: seated
      before: (tl, gsap) => gsap.set(shackle, { y: -95, rotation: -18, transformOrigin: '110px 0px' }),
      snap: (tl, t) => tl.to(shackle, { y: 0, rotation: 0, duration: 0.07, ease: 'power4.in' }, t - 0.07),
    };
  },
  check(svg) {
    const g = svgEl('g', {}, svg);
    svgEl('circle', { cx: 0, cy: 70, r: 230, fill: 'var(--ink)' }, g);
    const p = svgEl('path', { d: 'M -110 70 L -25 155 L 125 -10', fill: 'none', stroke: 'var(--bg)', 'stroke-width': 56, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    return {
      g,
      before: (tl, gsap) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); },
      snap: (tl, t) => tl.to(p, { strokeDashoffset: 0, duration: 0.12, ease: 'power3.in' }, t - 0.12),
    };
  },
  star(svg) {
    const g = svgEl('g', {}, svg);
    const s = svgEl('path', { d: starPath(0, 70, 250, 0.2), fill: 'var(--ink)' }, g);
    return {
      g,
      before: (tl, gsap) => gsap.set(s, { scale: 0.2, rotation: -90, transformOrigin: '0px 70px' }),
      snap: (tl, t) => tl.to(s, { scale: 1, rotation: 0, duration: 0.1, ease: 'power4.in' }, t - 0.1),
    };
  },
};

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    const wrap = el('div', 'ic-wrap', root.cam);
    const svg = svgEl('svg', { class: 'ic-svg', viewBox: '-300 -300 600 600', width: 600, height: 600 }, wrap);
    const ring = svgEl('circle', { cx: 0, cy: 70, r: 200, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 10, opacity: 0 }, svg);
    const icon = (ICONS[scene.icon] || ICONS.padlock)(svg);
    const text = el('div', 'ic-text', wrap, markup(scene.text || ''));
    fitText(text, 960, 560, 40, 230);

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    const at = (scene.at ?? 2) * beat;
    icon.before(tl, gsap);
    // hard cut: everything is on screen from the first frame and settles
    tl.fromTo(svg, { scale: 1.3 }, { scale: 1, duration: 0.2, ease: 'expo.out' }, 0);
    tl.fromTo(text, { y: 50, scale: 1.08 }, { y: 0, scale: 1, duration: 0.22, ease: 'expo.out' }, 0);
    icon.snap(tl, at);
    tl.fromTo(svg, { scale: 1.12 }, { scale: 1, duration: 0.2, ease: 'expo.out' }, at);
    tl.fromTo(ring, { attr: { r: 200 }, opacity: 0.9 }, { attr: { r: 330 }, opacity: 0, duration: 0.4, ease: 'expo.out' }, at);
    shake(tl, root.cam, at, 14, 0.18, 21);
    ctx.cue(at, 'snap');
    if (scene.push !== false) tl.fromTo(root.cam, { scale: 1 }, { scale: 1.05, duration: dur, ease: 'sine.inOut' }, 0);
    return { tl };
  },
};
