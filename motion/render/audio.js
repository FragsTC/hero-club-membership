// Audio for a video, all generated in code:
//   - an original electronic beat (kick, hats, clap, bass, synth line) that
//     follows the scene layout and resolves on the end card, or a song from /music
//   - sound effects placed from the cue list the player produced
//   - a mix with the effects just above the music, loudness-normalised and limited
const SR = 48000;

// ---------- small DSP kit -------------------------------------------------
function rng(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

class Biquad {
  constructor(type, f, q = 0.707) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f, q); }
  set(f, q = this.q) {
    this.q = q; f = Math.min(Math.max(f, 10), SR * 0.45);
    const w = (2 * Math.PI * f) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0, b1, b2;
    if (this.type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; } // band-pass, 0 dB peak
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
  }
}

class Bus {
  constructor(dur) { this.n = Math.ceil(dur * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n); }
  // add a mono signal fn(i, t) of length len seconds at time t0, with gain and pan (-1..1)
  add(t0, len, fn, gain = 1, pan = 0) {
    const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2, gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    for (let i = 0; i < n; i++) {
      const j = s0 + i; if (j < 0) { fn(i, i / SR); continue; } if (j >= this.n) break;
      const v = fn(i, i / SR); this.L[j] += v * gl; this.R[j] += v * gr;
    }
  }
  mix(other, g = 1) { for (let i = 0; i < this.n; i++) { this.L[i] += other.L[i] * g; this.R[i] += other.R[i] * g; } }
  scale(g) { for (let i = 0; i < this.n; i++) { this.L[i] *= g; this.R[i] *= g; } }
  peak() { let p = 0; for (let i = 0; i < this.n; i++) p = Math.max(p, Math.abs(this.L[i]), Math.abs(this.R[i])); return p; }
  rms(a = 0, b = this.n) { let s = 0; for (let i = a; i < b; i++) s += this.L[i] ** 2 + this.R[i] ** 2; return Math.sqrt(s / (2 * Math.max(1, b - a))); }
}

// Small Freeverb-style room.
function reverb(bus, { room = 0.8, damp = 0.35, wet = 1 } = {}) {
  const out = new Bus(bus.n / SR);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
  for (const [ch, src, dst, spread] of [[0, bus.L, out.L, 0], [1, bus.R, out.R, 23]]) {
    const cb = combs.map((d) => ({ buf: new Float32Array(d + spread), i: 0, f: 0 }));
    const ab = aps.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let n = 0; n < bus.n; n++) {
      const x = src[n] * 0.12; let y = 0;
      for (const c of cb) { const o = c.buf[c.i]; c.f = o * (1 - damp) + c.f * damp; c.buf[c.i] = x + c.f * room; c.i = (c.i + 1) % c.buf.length; y += o; }
      for (const a of ab) { const o = a.buf[a.i]; const v = y + o * 0.5; a.buf[a.i] = v; a.i = (a.i + 1) % a.buf.length; y = o - y * 0.5; }
      dst[n] = y * wet;
    }
  }
  return out;
}

// ---------- instruments ---------------------------------------------------
function kick(bus, t, g = 1) {
  let ph = 0; const r = rng(Math.round(t * 1000));
  bus.add(t, 0.5, (i, x) => {
    const f = 46 + 110 * Math.exp(-x * 30); ph += (2 * Math.PI * f) / SR;
    return (Math.sin(ph) * Math.exp(-x * 7) + (r() * 2 - 1) * Math.exp(-x * 500) * 0.35) * Math.min(1, x * 2000);
  }, 0.95 * g);
}
function clap(bus, send, t, g = 1) {
  const r = rng(Math.round(t * 997)); const bp = new Biquad('bp', 1300, 1.1);
  const fn = (i, x) => {
    let e = 0; for (const o of [0, 0.011, 0.023]) if (x >= o) e = Math.max(e, Math.exp(-(x - o) * 180));
    if (x > 0.03) e = Math.max(e, 0.55 * Math.exp(-(x - 0.03) * 16));
    return bp.run(r() * 2 - 1) * e * 2.2;
  };
  bus.add(t, 0.35, fn, 0.42 * g);
  const bp2 = new Biquad('bp', 1300, 1.1); const r2 = rng(Math.round(t * 997));
  send.add(t, 0.35, (i, x) => bp2.run(r2() * 2 - 1) * Math.exp(-x * 10) * 2, 0.25 * g);
}
function hat(bus, t, open = false, g = 1, pan = 0) {
  const r = rng(Math.round(t * 5003)); const hp = new Biquad('hp', 7500, 0.8); const hp2 = new Biquad('hp', 7500, 0.8);
  bus.add(t, open ? 0.28 : 0.07, (i, x) => hp2.run(hp.run(r() * 2 - 1)) * Math.exp(-x * (open ? 13 : 70)), (open ? 0.16 : 0.15) * g, pan);
}
function bass(bus, t, note, len, g = 1) {
  const f = mtof(note); const lp = new Biquad('lp', 420, 0.9); let ph = 0;
  bus.add(t, len, (i, x) => {
    ph += f / SR; const saw = 2 * (ph % 1) - 1;
    const env = Math.min(1, x * 300) * Math.exp(-x * 5) * Math.min(1, (len - x) * 80);
    return (Math.sin(2 * Math.PI * ph) * 0.8 + lp.run(saw) * 0.5) * env;
  }, 0.42 * g);
}
function pluck(bus, send, t, note, cutoff, g = 1, pan = 0) {
  const f = mtof(note); const lp = new Biquad('lp', cutoff, 1.4); let p1 = 0, p2 = 0;
  const fn = (i, x) => {
    if (i % 32 === 0) lp.set(cutoff * 0.35 + cutoff * Math.exp(-x * 16));
    p1 += f / SR; p2 += (f * 1.006) / SR;
    const s = (2 * (p1 % 1) - 1) + (2 * (p2 % 1) - 1);
    return lp.run(s * 0.5) * Math.exp(-x * 8) * Math.min(1, x * 600);
  };
  bus.add(t, 0.32, fn, 0.17 * g, pan);
  const lp2 = new Biquad('lp', cutoff, 1); let q = 0;
  send.add(t, 0.32, (i, x) => { q += f / SR; return lp2.run(2 * (q % 1) - 1) * Math.exp(-x * 8); }, 0.08 * g, pan);
}
function crash(bus, t, g = 1) {
  const r = rng(Math.round(t * 71)); const hp = new Biquad('hp', 3500, 0.7);
  bus.add(t, 2.2, (i, x) => hp.run(r() * 2 - 1) * Math.exp(-x * 2.2) * Math.min(1, x * 400), 0.22 * g);
}
function pad(bus, t, notes, len, g = 1) {
  for (const [k, m] of notes.entries()) {
    const f = mtof(m); const lp = new Biquad('lp', 2200, 0.8); const ph = [0, 0, 0];
    bus.add(t, len, (i, x) => {
      if (i % 64 === 0) lp.set(400 + 2400 * Math.exp(-x * 1.6));
      let s = 0; [-0.007, 0, 0.0065].forEach((d, j) => { ph[j] += (f * (1 + d)) / SR; s += 2 * (ph[j] % 1) - 1; });
      const env = Math.min(1, x * 200) * Math.exp(-x * 1.3) * Math.min(1, (len - x) * 6);
      return lp.run(s / 3) * env;
    }, 0.13 * g, (k % 2 ? 0.35 : -0.35));
  }
}

// ---------- the beat ------------------------------------------------------
// Follows the layout: a synth-only intro if the video opens on a typewriter caption
// (otherwise the groove starts on frame one), a breakdown under any later caption
// that builds into a drop, a two-beat break under the riser, a drop on the end card,
// then one final chord that rings out to silence by the last frame.
function makeBeat(plan) {
  const { duration, beat, scenes } = plan;
  const bus = new Bus(duration), send = new Bus(duration);
  const introEnd = scenes[0].type === 'typewriter' ? scenes[0].end : 0;
  const downs = scenes.slice(1).filter((s) => s.type === 'typewriter').map((s) => ({ s: s.start, e: s.end }));
  const last = scenes[scenes.length - 1];
  const endStart = last.type === 'endcard' ? last.start : duration;
  const breakStart = endStart - 2 * beat;
  const endBeats = Math.round((duration - endStart) / beat);
  const finalHit = endStart + Math.max(0, endBeats - 4) * beat;
  const prog = [[45, [57, 60, 64, 69]], [41, [53, 57, 60, 65]], [48, [55, 60, 64, 67]], [43, [55, 59, 62, 67]]]; // Am F C G
  const arp = [0, 1, 2, 3, 2, 1, 2, 0, 3, 2, 1, 2, 0, 1, 2, 3];
  const nBeats = Math.round(duration / beat);
  for (let b = 0; b < nBeats; b++) {
    const t = b * beat;
    if (t >= finalHit) break;
    const bar = Math.floor(b / 4), inBar = b % 4;
    const [root, tones] = prog[bar % 4];
    const dn = downs.find((d) => t >= d.s - 1e-6 && t < d.e - 1e-6);
    const intro = t < introEnd - 1e-6 || !!dn;
    const brk = (t >= breakStart - 1e-6 && t < endStart - 1e-6) || (dn && t >= dn.e - 2 * beat - 1e-6);
    const bs = dn ? dn.e - 2 * beat : breakStart;
    // drums
    if (!intro && !brk) kick(bus, t);
    if (intro && !brk && inBar % 2 === 0) kick(bus, t, 0.5); // soft half-time pulse under the intro
    if (!intro && !brk && (inBar === 1 || inBar === 3)) clap(bus, send, t);
    for (let s = 0; s < 4; s++) {
      const ts = t + (s * beat) / 4;
      if (intro && !brk) { if (s === 2 || (s === 0 && (dn || t > introEnd / 2))) hat(bus, ts, false, 0.9, s ? 0.15 : -0.15); continue; }
      hat(bus, ts, s === 2, s === 2 ? 1 : s % 2 ? 0.55 : 0.75, s % 2 ? 0.2 : -0.15);
    }
    if (brk) { for (let s = 0; s < 4; s++) clap(bus, send, t + (s * beat) / 4, 0.35 + 0.18 * s + 0.4 * ((t - bs) / (2 * beat))); }
    // bass on the off-beats
    if (!intro && !brk) bass(bus, t + beat / 2, root, beat / 2 - 0.02);
    // synth line: 16ths through the chord; the filter opens across the intro
    const open = dn ? 700 + 2100 * ((t - dn.s) / (dn.e - dn.s)) ** 1.5 : intro ? 500 + 2300 * (t / introEnd) ** 1.5 : brk ? 2600 : 2800;
    for (let s = 0; s < 4; s++) {
      const step = (b * 4 + s) % 16;
      pluck(bus, send, t + (s * beat) / 4, tones[arp[step]], open, intro ? 1.3 : 1, step % 2 ? 0.3 : -0.3);
    }
  }
  crash(bus, introEnd, 0.9);
  for (const d of downs) if (d.e < duration) { crash(bus, d.e, 1.1); kick(bus, d.e, 1.1); }
  if (endStart < duration) { crash(bus, endStart, 1.2); kick(bus, endStart, 1.1); }
  // final resolve: kick + Am chord, ringing out
  if (finalHit < duration) {
    kick(bus, finalHit, 1.1); crash(bus, finalHit, 0.8);
    bass(bus, finalHit, 33, Math.min(1.6, duration - finalHit), 1.1);
    pad(bus, finalHit, [57, 60, 64, 69, 72], duration - finalHit, 1.2);
    pad(send, finalHit, [57, 64, 69], duration - finalHit, 0.6);
  }
  bus.mix(reverb(send, { room: 0.84 }), 1);
  return bus;
}

// ---------- sound effects --------------------------------------------------
const SFX = {
  whoosh(bus, send, c) {
    const pre = 0.3, post = 0.14; const r = rng(Math.round(c.t * 131));
    const bp = new Biquad('bp', 500, 1.3), bp2 = new Biquad('bp', 500, 1.3);
    const fn = (bpf) => (i, x) => {
      const u = x - pre;
      if (i % 32 === 0) bpf.set(u < 0 ? 350 + 2600 * (x / pre) ** 2 : 2950 - 1500 * Math.min(1, u / post));
      const env = u < 0 ? (x / pre) ** 2.2 : Math.exp(-u * 22);
      return bpf.run(r() * 2 - 1) * env * 2.4;
    };
    bus.add(c.t - pre, pre + post, fn(bp), 0.42 * (c.v || 1), -0.3);
    bus.add(c.t - pre, pre + post, fn(bp2), 0.42 * (c.v || 1), 0.3);
  },
  click(bus, send, c) {
    const r = rng(Math.round(c.t * 7919)); const hp = new Biquad('hp', 1800, 0.7);
    const f = 2600 + r() * 1400;
    bus.add(c.t, 0.03, (i, x) => (hp.run(r() * 2 - 1) * Math.exp(-x * 900) + Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 260) * 0.35), 0.42 * (c.v || 1), (r() - 0.5) * 0.3);
  },
  hit(bus, send, c) {
    const v = c.v || 1; let ph = 0; const r = rng(Math.round(c.t * 433)); const bp = new Biquad('bp', 1900, 0.9);
    const fn = (i, x) => {
      const f = 52 + 90 * Math.exp(-x * 25); ph += (2 * Math.PI * f) / SR;
      return Math.sin(ph) * Math.exp(-x * 5.5) * 0.9 + bp.run(r() * 2 - 1) * Math.exp(-x * 30) * 1.6;
    };
    bus.add(c.t, 0.7, fn, 0.62 * v);
    const bp2 = new Biquad('bp', 1500, 0.8);
    send.add(c.t, 0.2, (i, x) => bp2.run(r() * 2 - 1) * Math.exp(-x * 20), 0.5 * v);
  },
  snap(bus, send, c) {
    const r = rng(77); const hp = new Biquad('hp', 1200, 0.7); let ph = 0;
    const fn = (i, x) => {
      ph += (2 * Math.PI * (150 + 60 * Math.exp(-x * 60))) / SR;
      return hp.run(r() * 2 - 1) * Math.exp(-x * 1400) * 1.2
        + (Math.sin(2 * Math.PI * 2150 * x) + 0.7 * Math.sin(2 * Math.PI * 3420 * x) + 0.4 * Math.sin(2 * Math.PI * 5230 * x)) * Math.exp(-x * 75) * 0.35
        + Math.sin(ph) * Math.exp(-x * 28) * 0.8;
    };
    bus.add(c.t, 0.3, fn, 0.7 * (c.v || 1));
    send.add(c.t, 0.05, (i, x) => Math.sin(2 * Math.PI * 3420 * x) * Math.exp(-x * 60), 0.3);
  },
  riser(bus, send, c, k = 0.42) {
    const d = c.dur; const r = rng(5); const bp = new Biquad('bp', 300, 2), bp2 = new Biquad('bp', 300, 2); let ph = 0;
    const fn = (bpf, sine) => (i, x) => {
      const u = x / d;
      if (i % 32 === 0) bpf.set(300 * 20 ** u, 2);
      const trem = sine ? 0.75 + 0.25 * Math.sin(2 * Math.PI * (4 * u + 10 * u * u) * x * 2) : 1;
      if (sine) ph += (2 * Math.PI * (220 * 8 ** (u * u))) / SR;
      const s = bpf.run(r() * 2 - 1) * 2.5 + (sine ? Math.sin(ph) * 0.35 : 0);
      return s * u ** 2.2 * trem * Math.min(1, (d - x) * 200);
    };
    bus.add(c.t, d, fn(bp, true), k, -0.2);
    bus.add(c.t, d, fn(bp2, false), k * 0.8, 0.2);
  },
  riseshort(bus, send, c) { SFX.riser(bus, send, c, 0.14); },
  sparkle(bus, send, c) {
    const r = rng(Math.round(c.t * 1000));
    for (let k = 0; k < 6; k++) {
      const t0 = c.t + r() * 0.45, f = 2400 + r() * 3800, p = r() * 1.6 - 0.8;
      const fn = (i, x) => Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 22) * Math.min(1, x * 3000);
      bus.add(t0, 0.25, fn, 0.09 * (c.v || 1), p);
      send.add(t0, 0.25, fn, 0.12 * (c.v || 1), p);
    }
  },
  tick(bus, send, c) {
    bus.add(c.t, 0.02, (i, x) => Math.sin(2 * Math.PI * 1750 * x) * Math.exp(-x * 320), 0.18 * (c.v || 1), 0.1);
  },
  pop(bus, send, c) {
    let ph = 0;
    bus.add(c.t, 0.12, (i, x) => { ph += (2 * Math.PI * (330 + 600 * Math.exp(-x * 55))) / SR; return Math.sin(ph) * Math.exp(-x * 38) * Math.min(1, x * 3000); }, 0.42 * (c.v || 1));
  },
  swipe(bus, send, c) {
    const d = c.dur || 0.4; const r = rng(9); const bp = new Biquad('bp', 1500, 2.2); let ph = 0;
    bus.add(c.t, d + 0.05, (i, x) => {
      const u = Math.min(1, x / d);
      if (i % 32 === 0) bp.set(1300 + 2600 * u, 2.2);
      ph += (2 * Math.PI * (1050 + 450 * u + 40 * Math.sin(2 * Math.PI * 28 * x))) / SR;
      const env = Math.sin(Math.PI * u) ** 0.7;
      return (bp.run(r() * 2 - 1) * 2 + Math.sin(ph) * 0.12) * env;
    }, 0.38);
  },
};

function makeSfx(plan) {
  const bus = new Bus(plan.duration), send = new Bus(plan.duration);
  for (const c of plan.cues) {
    if (!SFX[c.type]) { console.warn(`  (no sound for cue "${c.type}", skipped)`); continue; }
    SFX[c.type](bus, send, c);
  }
  bus.mix(reverb(send, { room: 0.78 }), 1);
  return bus;
}

// ---------- mixing --------------------------------------------------------
function limit(bus, ceiling = 0.89) {
  const la = Math.round(0.004 * SR), rel = Math.exp(-1 / (0.08 * SR));
  const req = new Float32Array(bus.n);
  for (let i = 0; i < bus.n; i++) { const p = Math.max(Math.abs(bus.L[i]), Math.abs(bus.R[i])); req[i] = p > ceiling ? ceiling / p : 1; }
  // minimum over the look-ahead window, then release smoothing, then a short average
  const g = new Float32Array(bus.n); const dq = [];
  for (let i = bus.n - 1; i >= 0; i--) {
    while (dq.length && req[dq[dq.length - 1]] >= req[i]) dq.pop();
    dq.push(i); while (dq[0] > i + la) dq.shift();
    g[i] = req[dq[0]];
  }
  let cur = 1;
  for (let i = 0; i < bus.n; i++) { cur = g[i] < cur ? g[i] : g[i] + (cur - g[i]) * rel; g[i] = cur; }
  let acc = 0; const sm = new Float32Array(bus.n);
  for (let i = 0; i < bus.n; i++) { acc += g[i]; if (i >= la) acc -= g[i - la]; sm[i] = acc / Math.min(i + 1, la); }
  for (let i = 0; i < bus.n; i++) { bus.L[i] *= sm[i]; bus.R[i] *= sm[i]; }
  return bus;
}

// Duck the music under the effects so they sit just above it.
function duck(music, sfx, depth = 0.4) {
  const att = Math.exp(-1 / (0.004 * SR)), rel = Math.exp(-1 / (0.18 * SR));
  let env = 0;
  for (let i = 0; i < music.n; i++) {
    const x = Math.max(Math.abs(sfx.L[i]), Math.abs(sfx.R[i]));
    env = x > env ? x + (env - x) * att : x + (env - x) * rel;
    const g = 1 - Math.min(depth, env * 1.2);
    music.L[i] *= g; music.R[i] *= g;
  }
}

function fadeTail(bus, sec = 0.25) {
  const n = Math.round(sec * SR);
  for (let i = 0; i < n; i++) { const k = i / n; bus.L[bus.n - 1 - i] *= k; bus.R[bus.n - 1 - i] *= k; }
}

function wav(bus) {
  const n = bus.n, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(bus.L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(bus.R[i] * 32767))), 46 + i * 4);
  }
  return buf;
}

function fromInterleaved(f32, duration) {
  const b = new Bus(duration);
  for (let i = 0; i < b.n && i * 2 + 1 < f32.length; i++) { b.L[i] = f32[i * 2]; b.R[i] = f32[i * 2 + 1]; }
  return b;
}

module.exports = { SR, Bus, makeBeat, makeSfx, limit, duck, fadeTail, wav, fromInterleaved };
