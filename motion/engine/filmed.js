// "Filmed" look: the finished video playing on a laptop in a dark room.
// Angled screen, its light spilling onto the keyboard, a soft reflection in a
// glossy desk, and a slow handheld drift. Fed one clean frame at a time.
//   window.__initFilmed({ duration })
//   window.__frame(pngBase64, t)
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color('#030405');
scene.fog = new THREE.Fog('#030405', 6, 14);
const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 50);

// ---- screen content: the clean frame, pillarboxed on a 16:10 panel --------
const SW = 3.0, SH = 1.875; // panel size (16:10)
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 1920; screenCanvas.height = 1200;
const sctx = screenCanvas.getContext('2d');
sctx.fillStyle = '#000'; sctx.fillRect(0, 0, 1920, 1200);
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = 8;
const probe = document.createElement('canvas'); probe.width = 8; probe.height = 8;
const pctx = probe.getContext('2d', { willReadFrequently: true });

// ---- laptop ----------------------------------------------------------------
const laptop = new THREE.Group();
scene.add(laptop);
const alu = new THREE.MeshStandardMaterial({ color: '#2b2f36', metalness: 0.7, roughness: 0.32 });
const keyMat = new THREE.MeshStandardMaterial({ color: '#0d0e10', metalness: 0.1, roughness: 0.55 });
const BW = 3.3, BD = 2.25, BT = 0.09;
const base = new THREE.Mesh(new THREE.BoxGeometry(BW, BT, BD), alu);
base.position.y = BT / 2;
laptop.add(base);
// keys
const keyGeo = new THREE.BoxGeometry(0.17, 0.025, 0.17);
const keys = new THREE.InstancedMesh(keyGeo, keyMat, 14 * 5 + 1);
const m = new THREE.Matrix4();
let k = 0;
for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
  m.makeTranslation(-1.3 + c * 0.2, BT + 0.006, -0.95 + r * 0.2);
  keys.setMatrixAt(k++, m);
}
m.compose(new THREE.Vector3(0, BT + 0.006, 0.05), new THREE.Quaternion(), new THREE.Vector3(5.5, 1, 1));
keys.setMatrixAt(k++, m); // space bar
laptop.add(keys);
const pad = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.004, 0.7), new THREE.MeshStandardMaterial({ color: '#30343b', metalness: 0.5, roughness: 0.25 }));
pad.position.set(0, BT + 0.002, 0.62);
laptop.add(pad);
// lid, hinged at the back edge, opened to ~108 degrees
const lid = new THREE.Group();
lid.position.set(0, BT, -BD / 2);
lid.rotation.x = -0.32;
laptop.add(lid);
const shell = new THREE.Mesh(new THREE.BoxGeometry(BW, 2.15, 0.05), alu);
shell.position.set(0, 2.15 / 2, -0.025);
lid.add(shell);
const bezel = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.04, 2.11), new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.15, metalness: 0 }));
bezel.position.set(0, 2.15 / 2, 0.001);
lid.add(bezel);
const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, color: new THREE.Color(0.92, 0.92, 0.92), toneMapped: true });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat);
screen.position.set(0, 2.15 / 2 + 0.03, 0.003);
lid.add(screen);
// faint glare across the glass
const glareTex = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.018)';
  g.beginPath(); g.moveTo(80, 320); g.lineTo(230, 320); g.lineTo(470, 0); g.lineTo(320, 0); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.01)';
  g.beginPath(); g.moveTo(260, 320); g.lineTo(300, 320); g.lineTo(540, 0); g.lineTo(500, 0); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const glare = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: glareTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
glare.position.copy(screen.position).add(new THREE.Vector3(0, 0, 0.004));
lid.add(glare);
// screen light spilling onto keyboard and desk
const spill = new THREE.RectAreaLight('#ffffff', 6, 0.9, SH);
spill.position.copy(screen.position).add(new THREE.Vector3(0, 0, 0.02));
spill.rotation.y = Math.PI; // area lights shine along -z; turn it to face out of the screen
lid.add(spill);
const wide = new THREE.RectAreaLight('#ffffff', 1.2, SW, SH);
wide.position.copy(spill.position);
wide.rotation.y = Math.PI;
lid.add(wide);
// a very faint cool fill so the room is not pure black
scene.add(new THREE.HemisphereLight('#2a3550', '#000000', 0.12));

laptop.rotation.y = 0.72;

// ---- glossy desk with a soft reflection -------------------------------------
const mirror = new Reflector(new THREE.PlaneGeometry(30, 30), { textureWidth: 384, textureHeight: 683, color: '#6b6f78' });
mirror.rotation.x = -Math.PI / 2;
mirror.position.y = -0.002;
scene.add(mirror);
const desk = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#08090b', roughness: 0.5, metalness: 0.2, transparent: true, opacity: 0.8 }));
desk.rotation.x = -Math.PI / 2;
scene.add(desk);
// dim back wall
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ color: '#0b0d12', roughness: 1 }));
wall.position.set(0, 5, -6);
scene.add(wall);

// ---- post: bloom, vignette, grain -----------------------------------------
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.32, 0.5, 0.82));
const film = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, seed: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float seed; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + seed) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5;
      float ca = 0.0012 * length(d) * 2.0;
      vec3 c = vec3(texture2D(tDiffuse, vUv + d*ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - d*ca).b);
      float v = smoothstep(0.85, 0.25, length(d * vec2(1.0, 0.75)));
      c *= mix(0.55, 1.0, v);
      c += (h(vUv * 1000.0) - 0.5) * 0.03;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
composer.addPass(film);
composer.addPass(new OutputPass());

// ---- camera: framed on the screen, slow push, handheld drift ---------------
let DUR = 20;
const target = new THREE.Vector3();
function placeCamera(t) {
  const n = (f, p) => Math.sin(t * f + p);
  const drift = (a, b, c) => 0.55 * n(a, 1.3) + 0.3 * n(b, 4.1) + 0.15 * n(c, 0.7);
  const push = t / DUR;
  const e = push * push * (3 - 2 * push);
  screen.getWorldPosition(target);
  camera.position.set(
    target.x + 0.9 - 0.2 * e + 0.035 * drift(0.53, 1.31, 2.9),
    target.y + 0.9 - 0.12 * e + 0.03 * drift(0.71, 1.67, 3.3),
    target.z + 8.6 - 1.1 * e + 0.03 * drift(0.37, 1.13, 2.3),
  );
  camera.lookAt(target.x + 0.01 * drift(0.9, 2.1, 3.7), target.y - 0.62 + 0.012 * drift(0.6, 1.9, 4.4), target.z);
  camera.rotateZ(0.006 * drift(0.45, 1.5, 3.1));
}

const edge = document.createElement('canvas'); edge.width = 2; edge.height = 96;
const ectx = edge.getContext('2d', { willReadFrequently: true });
function edgeColour(img) {
  // sample the left and right edge columns, skipping the corner-label rows
  ectx.imageSmoothingEnabled = false;
  ectx.drawImage(img, 2, 200, 1, 1520, 0, 0, 1, 96);
  ectx.drawImage(img, img.width - 3, 200, 1, 1520, 1, 0, 1, 96);
  const d = ectx.getImageData(0, 0, 2, 96).data;
  const count = new Map();
  let best = '#000', n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const key = `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`;
    const c = (count.get(key) || 0) + 1; count.set(key, c);
    if (c > n) { n = c; best = key; }
  }
  return best;
}

window.__initFilmed =({ duration }) => { DUR = duration; };

window.__frame = async (b64, t) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  // The 9:16 frame sits in the middle of the 16:10 panel; the sides are filled
  // with the scene's own colour field (the most common colour down its edges).
  const h = 1200, w = Math.round((h * 9) / 16);
  sctx.fillStyle = edgeColour(img); sctx.fillRect(0, 0, 1920, 1200);
  sctx.drawImage(img, (1920 - w) / 2, 0, w, h);
  screenTex.needsUpdate = true;
  // light colour follows what is on the whole panel
  pctx.drawImage(screenCanvas, 0, 0, 8, 8);
  const d = pctx.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const c = new THREE.Color(r / 64 / 255, g / 64 / 255, b / 64 / 255).convertSRGBToLinear();
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  spill.color.copy(c).multiplyScalar(1 / Math.max(0.05, Math.max(c.r, c.g, c.b)));
  spill.intensity = 2 + 22 * lum;
  wide.color.copy(spill.color);
  wide.intensity = 0.4 + 3 * lum;
  film.uniforms.seed.value = (t * 30) % 97;
  placeCamera(t);
  composer.render();
};
