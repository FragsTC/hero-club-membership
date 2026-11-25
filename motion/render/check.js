// npm run check <video>
// Checks a finished render: are the cuts on beats, do the sounds land on the
// cuts, does anything clip, how loud is it. Also writes out/<video>/check-sheet.png
// (the frame before and after every cut) and check-wave.png (waveform).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT } = require('./server');

const name = process.argv[2];
if (!name) { console.error('Usage: npm run check <video>'); process.exit(1); }
const out = path.join(ROOT, 'out', name);
const tl = JSON.parse(fs.readFileSync(path.join(out, 'work', 'timeline.json'), 'utf8'));
const FPS = 30, beat = tl.beat;
const ff = (a, opts) => execFileSync('ffmpeg', ['-v', 'error', ...a], { maxBuffer: 1 << 30, ...opts });

// ---- picture: where the hard cuts really are -------------------------------
const w = 54, h = 96;
const raw = ff(['-i', path.join(out, 'clean.mp4'), '-vf', `scale=${w}:${h},format=gray`, '-f', 'rawvideo', '-']);
const n = raw.length / (w * h);
const diff = [0];
for (let f = 1; f < n; f++) {
  let s = 0; for (let i = 0; i < w * h; i++) s += Math.abs(raw[f * w * h + i] - raw[(f - 1) * w * h + i]);
  diff.push(s / (w * h));
}
const planned = tl.scenes.slice(1).map((s) => Math.round(s.start * FPS));
console.log(`\nPICTURE  ${n} frames, ${(n / FPS).toFixed(2)}s, beat = ${beat}s (${(beat * FPS).toFixed(2)} frames)`);
let bad = 0;
for (const f of planned) {
  const near = [f - 1, f, f + 1].map((k) => diff[k] || 0);
  const at = f - 1 + near.indexOf(Math.max(...near));
  const onBeat = Math.abs((at / FPS / beat) - Math.round(at / FPS / beat)) < 0.01;
  if (at !== f || !onBeat) bad++;
  console.log(`  cut at frame ${String(at).padStart(4)}  ${(at / FPS).toFixed(3)}s  beat ${(at / FPS / beat).toFixed(2)}  change ${diff[at].toFixed(0).padStart(3)}  ${at === f && onBeat ? 'ok' : 'OFF'}`);
}
// big changes that are not planned scene cuts (e.g. colour flips inside a scene)
const extra = diff.map((d, f) => [d, f]).filter(([d, f]) => d > 40 && !planned.includes(f));
for (const [d, f] of extra) {
  const b = f / FPS / beat;
  console.log(`  in-scene flip at frame ${f} (${(f / FPS).toFixed(3)}s, beat ${b.toFixed(2)})  ${Math.abs(b - Math.round(b)) < 0.01 ? 'ok, on beat' : 'between beats'}`);
}

// ---- sound -------------------------------------------------------------------
const SR = 48000;
// left and right summed for timing; peaks are taken per channel in stats()
function load(file, channels = 1) {
  const b = ff(['-i', file, '-f', 'f32le', '-af', channels === 1 ? 'pan=mono|c0=0.5*c0+0.5*c1' : 'anull', '-ac', String(channels), '-ar', String(SR), '-']);
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4);
}
function stats(label, x) {
  let peak = 0, clip = 0; for (const v of x) { const a = Math.abs(v); if (a > peak) peak = a; if (a >= 0.999) clip++; }
  const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', label, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{')));
  return { peak: (20 * Math.log10(peak)).toFixed(2), clip, lufs: j.input_i, tp: j.input_tp };
}
for (const f of ['clean.mp4', 'clean-sfx-only.mp4', 'filmed.mp4']) {
  const p = path.join(out, f); if (!fs.existsSync(p)) continue;
  const s = stats(p, load(p, 2));
  console.log(`\nSOUND ${f.padEnd(20)} ${s.lufs} LUFS, true peak ${s.tp} dBTP, sample peak ${s.peak} dBFS, clipped samples: ${s.clip}`);
}
// Energy rise around each cut in the effects track: the whoosh should peak on the cut.
const fx = load(path.join(out, 'work', 'sfx.wav'));
const win = Math.round(0.005 * SR);
const env = new Float32Array(Math.floor(fx.length / win));
for (let i = 0; i < env.length; i++) { let s = 0; for (let k = 0; k < win; k++) s += fx[i * win + k] ** 2; env[i] = Math.sqrt(s / win); }
console.log('\nSOUND vs CUTS (loudest 5 ms of the effects track within ±120 ms of each cut)');
for (const s of tl.scenes.slice(1)) {
  const c = Math.round(s.start * SR / win), r = Math.round(0.12 * SR / win);
  let best = c; for (let i = c - r; i <= c + r; i++) if (env[i] > env[best]) best = i;
  const ms = ((best - c) * win * 1000) / SR;
  console.log(`  ${s.start.toFixed(2)}s ${s.type.padEnd(10)} peak ${ms >= 0 ? '+' : ''}${ms.toFixed(0)} ms  ${Math.abs(ms) <= 35 ? 'ok' : 'CHECK'}`);
}
// Music downbeats vs the beat grid (generated beat or song)
const mus = load(path.join(out, 'work', 'music.wav'));
const menv = new Float32Array(Math.floor(mus.length / win));
for (let i = 0; i < menv.length; i++) { let s = 0; for (let k = 0; k < win; k++) s += mus[i * win + k] ** 2; menv[i] = Math.sqrt(s / win); }
let errs = [];
for (let b = 0; b * beat < tl.duration - 0.1; b++) {
  const c = Math.round(b * beat * SR / win), r = Math.round(0.06 * SR / win);
  let lo = Math.max(1, c - r), best = lo, rise = -1;
  for (let i = lo; i <= c + r && i < menv.length; i++) { const d = menv[i] - menv[i - 1]; if (d > rise) { rise = d; best = i; } }
  if (rise > 0.01) errs.push(((best - c) * win * 1000) / SR);
}
if (errs.length) { const so = errs.map(Math.abs).sort((a, b) => a - b); console.log(`\nMUSIC onsets vs beat grid: ${errs.length} beats with a hit, median offset ${so[so.length >> 1].toFixed(0)} ms, 90% within ${so[Math.floor(so.length * 0.9)].toFixed(0)} ms`); }

// ---- pictures for a human ------------------------------------------------------
const picks = planned.flatMap((f) => [f - 1, f]);
const sel = picks.map((f) => `eq(n\\,${f})`).join('+');
ff(['-y', '-i', path.join(out, 'clean.mp4'), '-vf', `select='${sel}',scale=216:384,tile=${Math.min(8, picks.length)}x${Math.ceil(picks.length / 8)}`, '-frames:v', '1', path.join(out, 'check-sheet.png')]);
ff(['-y', '-i', path.join(out, 'clean.mp4'), '-filter_complex', 'showwavespic=s=1600x300:split_channels=0:colors=#fcaf17', '-frames:v', '1', path.join(out, 'check-wave.png')]);
console.log(`\nWrote out/${name}/check-sheet.png (frame before | after each cut) and check-wave.png`);
console.log(bad ? `\n${bad} cut(s) off the beat` : '\nAll cuts on beats.');
