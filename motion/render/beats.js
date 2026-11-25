// Beat detection for a song in /music: tempo (BPM) and the time of the first beat.
// Spectral-flux onsets -> autocorrelation for tempo -> best phase for the grid.
const { execFileSync } = require('child_process');

const AR = 22050, HOP = 256, FFT = 1024;

function decode(file, sr = AR, channels = 1) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', String(channels), '-ar', String(sr), '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}

function fftMag(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  const m = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) m[i] = Math.hypot(re[i], im[i]);
  return m;
}

function onsets(x) {
  const frames = Math.floor((x.length - FFT) / HOP);
  const win = new Float32Array(FFT).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FFT));
  const env = new Float32Array(Math.max(0, frames));
  let prev = null;
  for (let f = 0; f < frames; f++) {
    const re = new Float32Array(FFT), im = new Float32Array(FFT);
    for (let i = 0; i < FFT; i++) re[i] = x[f * HOP + i] * win[i];
    const m = fftMag(re, im).map((v) => Math.log1p(100 * v));
    if (prev) { let s = 0; for (let i = 1; i < m.length; i++) s += Math.max(0, m[i] - prev[i]); env[f] = s; }
    prev = m;
  }
  // remove the slow trend so only the hits remain
  const out = new Float32Array(env.length), w = 16;
  for (let i = 0; i < env.length; i++) {
    let s = 0, c = 0; for (let k = Math.max(0, i - w); k < Math.min(env.length, i + w); k++) { s += env[k]; c++; }
    out[i] = Math.max(0, env[i] - s / c);
  }
  return out;
}

function analyse(file, { minBpm = 70, maxBpm = 180 } = {}) {
  const x = decode(file);
  const o = onsets(x);
  const fps = AR / HOP;
  const ac = (lag) => { let s = 0; for (let i = 0; i + lag < o.length; i++) s += o[i] * o[i + lag]; return s / (o.length - lag); };
  let best = null;
  for (let lag = Math.floor((fps * 60) / maxBpm); lag <= Math.ceil((fps * 60) / minBpm); lag++) {
    const bpm = (60 * fps) / lag;
    // prefer tempos near 120 and reward support at twice the period
    const w = Math.exp(-0.5 * (Math.log2(bpm / 120) / 0.9) ** 2);
    const score = (ac(lag) + 0.5 * ac(lag * 2)) * w;
    if (!best || score > best.score) best = { lag, score };
  }
  // fine search of period and phase together
  let top = null;
  for (let p = best.lag - 1; p <= best.lag + 1; p += 0.02) {
    for (let ph = 0; ph < p; ph += 0.5) {
      let s = 0, n = 0;
      for (let t = ph; t < o.length; t += p) {
        const i = Math.floor(t), f = t - i;
        s += (o[i] || 0) * (1 - f) + (o[i + 1] || 0) * f; n++;
      }
      s /= n;
      if (!top || s > top.s) top = { p, ph, s };
    }
  }
  const bpm = (60 * fps) / top.p;
  // the flux frame sits half a window after the attack it detects
  let first = (top.ph * HOP + FFT / 2) / AR;
  const beat = 60 / bpm;
  while (first - beat >= 0) first -= beat;
  if (first < 0) first += beat;
  if (first > beat - 0.03) first = Math.max(0, first - beat); // a beat right at the start
  return { bpm: +bpm.toFixed(3), firstBeat: +first.toFixed(4), length: x.length / AR };
}

module.exports = { analyse, decode };

if (require.main === module) console.log(analyse(process.argv[2]));
