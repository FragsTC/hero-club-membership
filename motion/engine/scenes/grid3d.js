// 3D grid wave: a wall of window panes flips from grey (dirty) to sparkling
// (clean) in a diagonal wave while the camera pushes in.
// story fields: bg, cols, rows, text (optional mono label), panes ("dirty" colour), clean ("clean" colour)
import * as THREE from 'three';
import { W, H, el, rng, starPath } from '../lib.js';

function paneTexture(kind, seed) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  const g = c.getContext('2d');
  const r = rng(seed);
  if (kind === 'dirty') {
    g.fillStyle = '#6d7276'; g.fillRect(0, 0, 256, 320);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(70,58,44,${0.12 + r() * 0.25})`;
      g.beginPath(); g.ellipse(r() * 256, r() * 320, 6 + r() * 30, 4 + r() * 18, r() * 3, 0, 7); g.fill();
    }
    for (let i = 0; i < 7; i++) {
      g.fillStyle = `rgba(60,50,40,${0.15 + r() * 0.2})`;
      g.fillRect(r() * 256, r() * 120, 3 + r() * 4, 80 + r() * 200);
    }
  } else {
    g.fillStyle = '#bfe8fa'; g.fillRect(0, 0, 256, 320);
    // two flat glints, like light on clean glass
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath(); g.moveTo(40, 320); g.lineTo(110, 320); g.lineTo(256, 120); g.lineTo(256, 40); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath(); g.moveTo(140, 320); g.lineTo(165, 320); g.lineTo(256, 196); g.lineTo(256, 160); g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default {
  build(root, scene, ctx) {
    const { gsap, dur, beat, brand } = ctx;
    const cols = scene.cols || 4, rows = scene.rows || 7;
    const canvas = el('canvas', 'g3-canvas', root.cam);
    canvas.width = W; canvas.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const bg = brand.colors[scene.bg].bg;
    const scene3 = new THREE.Scene();
    scene3.background = new THREE.Color(bg);
    const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);

    const pw = 1.0, ph = 1.25, gap = 0.16;
    const frameMat = new THREE.MeshBasicMaterial({ color: brand.colors.white.bg });
    const edgeMat = new THREE.MeshBasicMaterial({ color: '#d6dde6' });
    const panes = [];
    const group = new THREE.Group();
    scene3.add(group);
    const gw = cols * (pw + gap) - gap, gh = rows * (ph + gap) - gap;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = new THREE.Group();
        const mats = [edgeMat, edgeMat, edgeMat, edgeMat,
          new THREE.MeshBasicMaterial({ map: paneTexture('dirty', x * 31 + y * 7 + 1) }),
          new THREE.MeshBasicMaterial({ map: paneTexture('clean', x * 13 + y) })];
        // back face texture must read the right way round once flipped
        mats[5].map.wrapS = THREE.RepeatWrapping; mats[5].map.repeat.x = -1;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.06), mats);
        p.add(glass);
        // white mullion frame around each pane
        const fw = 0.05;
        for (const [w, h, ox, oy] of [[pw + fw * 2, fw, 0, ph / 2 + fw / 2], [pw + fw * 2, fw, 0, -ph / 2 - fw / 2], [fw, ph, pw / 2 + fw / 2, 0], [fw, ph, -pw / 2 - fw / 2, 0]]) {
          const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.09), frameMat);
          f.position.set(ox, oy, 0); p.add(f);
        }
        p.position.set(x * (pw + gap) - gw / 2 + pw / 2, (rows - 1 - y) * (ph + gap) - gh / 2 + ph / 2, 0);
        group.add(p);
        panes.push({ p, x, y });
      }
    }
    group.rotation.set(-0.08, 0.32, 0.02);

    // Sparkles: flat four-point stars in the overlay, popping on clean panes.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'g3-sparkles'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    root.cam.appendChild(svg);

    const tl = gsap.timeline();
    tl.to({}, { duration: dur }, 0);
    const w0 = 0.12, w1 = dur - beat * 0.9;
    const maxD = cols + rows;
    const flipT = (pn) => w0 + ((pn.x + pn.y) / maxD) * (w1 - w0);
    const flipLen = 0.38;
    panes.forEach((pn) => tl.fromTo(pn.p.rotation, { y: 0 }, { y: Math.PI, duration: flipLen, ease: 'back.inOut(1.4)' }, flipT(pn)));
    const r = rng('g3');
    const stars = [];
    panes.forEach((pn, i) => {
      if (r() < 0.45) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        s.setAttribute('d', starPath(0, 0, 26 + r() * 26));
        s.setAttribute('fill', '#ffffff');
        svg.appendChild(s);
        stars.push({ s, pn, t: flipT(pn) + flipLen * 0.8 + r() * 0.1, ox: (r() - 0.5) * 0.6, oy: (r() - 0.5) * 0.7 });
      }
    });
    ctx.cue(w0 + 0.2, 'sparkle', { v: 0.6 });
    ctx.cue((w0 + w1) / 2 + 0.2, 'sparkle', { v: 0.7 });
    ctx.cue(w1 + 0.15, 'sparkle', { v: 0.8 });

    let label = null;
    if (scene.text) { label = el('div', 'g3-label', root.cam); label.textContent = scene.text; }

    const v = new THREE.Vector3();
    return {
      tl,
      render(t) {
        const k = Math.min(1, t / dur);
        const e = k * k * (3 - 2 * k);
        cam.position.set(1.6 - 1.2 * e, 0.6 + 0.2 * e, 19.5 - 4.5 * e);
        cam.lookAt(0, 0.1, 0);
        cam.updateMatrixWorld();
        group.updateMatrixWorld(true);
        renderer.render(scene3, cam);
        for (const st of stars) {
          const a = t - st.t;
          const life = 0.45;
          if (a < 0 || a > life) { st.s.style.display = 'none'; continue; }
          st.s.style.display = '';
          st.pn.p.localToWorld(v.set(st.ox, st.oy, 0.1));
          v.project(cam);
          const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
          const sc = Math.sin((a / life) * Math.PI);
          st.s.setAttribute('transform', `translate(${x} ${y}) scale(${sc}) rotate(${a * 200})`);
        }
      },
    };
  },
};
