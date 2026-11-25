// Badge: a logo slams in over slowly turning rays, stars pop around it, a sub line
// lands on the next beat and a glint sweeps across the logo.
// story fields: image (path from the motion folder, e.g. "brand/hero-club-logo.png"), sub, bg
import { el, svgEl, slam, starPath, rng } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat } = ctx;
    // rays: flat wedges, a touch lighter than the field
    const rays = svgEl('svg', { class: 'bd-rays', viewBox: '-1200 -1200 2400 2400', width: 2400, height: 2400 }, root.cam);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
      svgEl('path', { d: `M 0 0 L ${Math.cos(a0) * 1700} ${Math.sin(a0) * 1700} L ${Math.cos(a1) * 1700} ${Math.sin(a1) * 1700} Z`, fill: 'var(--ink)', opacity: 0.07 }, rays);
    }
    const wrap = el('div', 'bd-wrap', root.cam);
    const ring = el('div', 'bd-ring', wrap);
    const logoBox = el('div', 'bd-logo', wrap);
    const src = '../' + scene.image;
    const img = el('img', '', logoBox); img.src = src;
    // glint: a white bar that only shows where the logo is
    const glint = el('div', 'bd-glint', logoBox);
    glint.style.webkitMaskImage = glint.style.maskImage = `url(${src})`;
    const bar = el('div', 'bd-bar', glint);
    const sub = scene.sub ? el('div', 'bd-sub', wrap, scene.sub) : null;

    const stars = svgEl('svg', { class: 'bd-stars', viewBox: '0 0 1080 1920', width: 1080, height: 1920 }, root.cam);
    const r = rng('badge');
    const pts = [[150, 640, 46], [930, 600, 38], [110, 1080, 30], [960, 1130, 50], [250, 470, 22], [950, 1500, 28]];
    const st = pts.map(([x, y, s]) => ({ n: svgEl('path', { d: starPath(0, 0, s), fill: 'var(--pop)' }, stars), x, y, d: r() * 0.25 }));

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    tl.fromTo(rays, { rotation: 0 }, { rotation: 40, duration: dur, ease: 'none' }, 0);
    slam(tl, logoBox, 0, { from: 1.6, settle: 0.22, shakeNode: root.cam, seed: 51, amp: 26 });
    ctx.cue(0, 'hit', { v: 1.1 });
    tl.fromTo(ring, { scale: 0.7, opacity: 0.9 }, { scale: 1.7, opacity: 0, duration: 0.5, ease: 'expo.out', immediateRender: false }, 0);
    gsap.set(ring, { opacity: 0 });
    st.forEach((s, i) => {
      const t0 = beat + s.d;
      tl.fromTo(s.n, { attr: { transform: `translate(${s.x} ${s.y}) scale(0) rotate(0)` } },
        { attr: { transform: `translate(${s.x} ${s.y}) scale(1) rotate(45)` }, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, t0);
      gsap.set(s.n, { attr: { transform: `translate(${s.x} ${s.y}) scale(0)` } });
    });
    ctx.cue(beat, 'sparkle', { v: 0.9 });
    if (sub) {
      gsap.set(sub, { autoAlpha: 0 });
      tl.set(sub, { autoAlpha: 1 }, beat);
      tl.fromTo(sub, { y: 40, scale: 1.15 }, { y: 0, scale: 1, duration: 0.2, ease: 'expo.out' }, beat);
      ctx.cue(beat, 'pop', { v: 0.8 });
    }
    tl.fromTo(bar, { xPercent: -160 }, { xPercent: 420, duration: 0.5, ease: 'power2.inOut' }, beat * 2);
    ctx.cue(beat * 2, 'sparkle', { v: 0.6 });
    tl.fromTo(wrap, { scale: 1 }, { scale: 1.05, duration: dur, ease: 'sine.inOut' }, 0);
    return { tl };
  },
};
