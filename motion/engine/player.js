// Builds a video from story.json and exposes a frame-exact seek for the renderer.
//   window.__init(story, { brand, bpm, fps }) -> { duration, cues, scenes }
//   window.__seek(t)  renders the frame at time t (seconds)
// Opened directly as player.html?video=<name> it plays in real time as a preview.
import { el, paint } from './lib.js';
import typewriter from './scenes/typewriter.js';
import kinetic from './scenes/kinetic.js';
import stack from './scenes/stack.js';
import grid3d from './scenes/grid3d.js';
import linedraw from './scenes/linedraw.js';
import countup from './scenes/countup.js';
import icon from './scenes/icon.js';
import endcard from './scenes/endcard.js';
import tiers from './scenes/tiers.js';
import badge from './scenes/badge.js';
import problem from './scenes/problem.js';

const TYPES = { typewriter, kinetic, stack, grid3d, linedraw, countup, icon, endcard, tiers, badge, problem };
const stage = document.getElementById('stage');
let built = null;

async function init(story, { brand, bpm, fps = 30 }) {
  await document.fonts.ready;
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
  const beat = 60 / bpm;
  const cues = [];
  const scenes = [];
  let t = 0;
  stage.innerHTML = '';
  for (const [i, sc] of story.scenes.entries()) {
    const type = TYPES[sc.type];
    if (!type) throw new Error(`Scene ${i + 1}: unknown type "${sc.type}". Types: ${Object.keys(TYPES).join(', ')}`);
    if (!(sc.beats > 0)) throw new Error(`Scene ${i + 1}: "beats" must be a positive number`);
    const dur = sc.beats * beat;
    const node = el('div', 'scene', stage);
    const cam = el('div', 'cam', node);
    const bg0 = Array.isArray(sc.bg) ? sc.bg[0] : sc.bg;
    if (!brand.colors[bg0]) throw new Error(`Scene ${i + 1}: unknown colour "${bg0}". Colours: ${Object.keys(brand.colors).join(', ')}`);
    paint(node, brand.colors[bg0]);
    node.classList.add('on'); // visible while building so text can be measured
    const start = t;
    const ctx = {
      gsap, brand, beat, dur, index: i, total: story.scenes.length,
      prevType: story.scenes[i - 1]?.type, nextType: story.scenes[i + 1]?.type,
      // a scene that pans in starts its own animation once the pan lands
      enter: sc.enter === 'pan' ? (sc.panBeats || 1) * beat : 0,
      cue: (lt, type, opts = {}) => cues.push({ t: +(start + lt).toFixed(5), type, scene: i, ...opts }),
    };
    if (i > 0 && sc.whoosh !== false) ctx.cue(0, 'whoosh');
    const out = type.build({ el: node, cam }, sc, ctx);
    out.tl.pause(0);
    node.classList.remove('on');
    scenes.push({ ...out, node, start, dur, bg0, sc });
    t += dur;
  }
  const hud = el('div', '', stage);
  hud.id = 'hud';
  const lab = {
    tl: el('div', 'tl', hud, story.label || 'Window Hero RDU'),
    tr: el('div', 'tr', hud),
    bl: el('div', 'bl', hud),
    br: el('div', 'br', hud, story.corner || brand.website),
  };
  built = { scenes, duration: t, fps, brand, lab, beat };
  cues.sort((a, b) => a.t - b.t);
  seek(0);
  return {
    duration: t, beat, cues,
    scenes: scenes.map((s) => ({ type: s.sc.type, start: s.start, end: s.start + s.dur, beats: s.sc.beats, enter: s.sc.enter || 'cut' })),
  };
}

const pad = (n, w = 2) => String(n).padStart(w, '0');

function seek(t) {
  const { scenes, duration, fps, brand, lab } = built;
  t = Math.max(0, Math.min(t, duration - 1e-6));
  let cur = 0;
  scenes.forEach((s, i) => { if (t >= s.start - 1e-6) cur = i; });
  const s = scenes[cur];
  const lt = t - s.start;
  // pan: the previous scene (held on its last frame) slides out as this one slides in
  const panDur = s.sc.enter === 'pan' && cur > 0 ? (s.sc.panBeats || 1) * built.beat : 0;
  const panning = lt < panDur;
  scenes.forEach((x, i) => { x.node.classList.toggle('on', i === cur || (panning && i === cur - 1)); x.node.style.transform = ''; });
  if (panning) {
    const p = scenes[cur - 1], pt = p.dur - 1e-4;
    p.tl.seek(pt, false);
    paint(p.node, brand.colors[p.bgAt ? p.bgAt(pt) : p.bg0]);
    if (p.render) p.render(pt);
    const k = gsap.parseEase('power3.inOut')(lt / panDur);
    p.node.style.transform = `translateX(${-k * 1080}px)`;
    s.node.style.transform = `translateX(${(1 - k) * 1080}px)`;
  }
  // a hair past 0 so anything set exactly at the cut is drawn on the cut frame
  s.tl.seek(Math.max(lt, 1e-4), false);
  const key = s.bgAt ? s.bgAt(lt) : s.bg0;
  paint(s.node, brand.colors[key]);
  if (s.render) s.render(lt);
  // corner labels follow the current colour field
  const c = brand.colors[key];
  document.getElementById('hud').style.color = c.ink;
  const f = Math.floor(t * fps + 1e-4);
  lab.tr.textContent = `${pad(cur + 1)}/${pad(scenes.length)}`;
  lab.bl.textContent = `${pad(Math.floor(f / fps / 60))}:${pad(Math.floor(f / fps) % 60)}:${pad(f % fps)}`;
}

window.__init = init;
window.__seek = seek;

// ---- live preview --------------------------------------------------------
const q = new URLSearchParams(location.search);
if (q.get('video') && !q.has('render')) {
  const [story, brand] = await Promise.all([
    fetch(`../videos/${q.get('video')}/story.json`).then((r) => r.json()),
    fetch('../brand/brand.json').then((r) => r.json()),
  ]);
  const info = await init(story, { brand, bpm: story.bpm || 120 });
  const fit = () => { const k = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = `scale(${k})`; };
  fit(); addEventListener('resize', fit);
  const t0 = performance.now();
  const loop = () => {
    const t = ((performance.now() - t0) / 1000) % info.duration;
    seek(t);
    document.getElementById('scrub').style.width = (t / info.duration) * 100 + '%';
    requestAnimationFrame(loop);
  };
  loop();
} else {
  document.body.classList.add('rendering');
}
