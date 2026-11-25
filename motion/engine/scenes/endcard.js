// End card: logo, website and phone land on successive beats. A riser leads
// into it and the music resolves on it.
// story fields: bg, tag (small line under the logo), website, phone (default from brand.json)
import { el, svgEl, fitText, slam, starPath } from '../lib.js';

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat, brand } = ctx;
    const c = brand.colors[scene.bg];
    const dark = c.ink !== '#ffffff';
    const wrap = el('div', 'ec-wrap', root.cam);
    const logo = el('img', 'ec-logo', wrap);
    logo.src = '../' + (dark ? brand.logo.dark : brand.logo.light);
    const tag = el('div', 'ec-tag', wrap, scene.tag ?? 'RALEIGH · DURHAM · CHAPEL HILL');
    const site = el('div', 'ec-site', wrap, scene.website || brand.website);
    const phone = el('div', 'ec-phone', wrap, '');
    const ph = scene.phone || brand.phone;
    phone.innerHTML = `<span>${ph}</span><span class="tw-cursor ec-cursor"></span>`;
    fitText(site, 900, 200, 30, 150);
    fitText(phone.firstChild, 900, 260, 30, 200);
    phone.style.fontSize = phone.firstChild.style.fontSize;
    const cur = phone.querySelector('.ec-cursor');

    // twinkling stars around the logo, echoing the ones in it
    const svg = svgEl('svg', { class: 'ec-stars', viewBox: '0 0 1080 1920', width: 1080, height: 1920 }, root.cam);
    const stars = [[150, 560, 34], [940, 1330, 28], [880, 520, 18], [200, 1380, 20]].map(([x, y, s]) =>
      ({ n: svgEl('path', { d: starPath(0, 0, s), fill: 'var(--pop)' }, svg), x, y }));

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    slam(tl, logo, 0, { from: 1.5, settle: 0.2, shakeNode: root.cam, seed: 31, amp: 26 });
    ctx.cue(0, 'hit', { v: 1.1 });
    ctx.cue(-2 * beat, 'riser', { dur: 2 * beat });
    gsap.set([tag, site, phone], { autoAlpha: 0 });
    tl.set(tag, { autoAlpha: 1 }, beat * 0.5);
    tl.fromTo(tag, { y: 30 }, { y: 0, duration: 0.2, ease: 'expo.out' }, beat * 0.5);
    tl.set(site, { autoAlpha: 1 }, beat);
    tl.fromTo(site, { scale: 1.25 }, { scale: 1, duration: 0.16, ease: 'expo.out' }, beat);
    ctx.cue(beat, 'pop', { v: 0.8 });
    tl.set(phone, { autoAlpha: 1 }, beat * 2);
    tl.fromTo(phone, { scale: 1.25 }, { scale: 1, duration: 0.16, ease: 'expo.out' }, beat * 2);
    ctx.cue(beat * 2, 'pop', { v: 0.9 });
    tl.fromTo(wrap, { scale: 1 }, { scale: 1.04, duration: dur, ease: 'sine.out' }, 0);

    return {
      tl,
      render(t) {
        cur.style.opacity = ((t / beat) % 1) < 0.5 ? 1 : 0;
        stars.forEach((s, i) => {
          const k = Math.max(0, Math.sin((t / beat) * Math.PI + i * 1.7));
          s.n.setAttribute('transform', `translate(${s.x} ${s.y}) scale(${t < 0.2 ? 0 : k}) rotate(${t * 40})`);
        });
      },
    };
  },
};
