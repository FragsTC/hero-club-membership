// Voiceover: each scene's "say" line is either a recording (voice.dir: 01.wav, 02.wav, ...
// in script order; from Creatify, ElevenLabs or your own phone) or, without voice.dir, spoken
// with Kokoro (an open-source voice model that runs locally; downloads once, about 90 MB).
// A line starts just after its scene's cut. If it would run into the next line,
// it is spoken a little faster (up to 1.35x) to fit.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const A = require('./audio');
const { decode } = require('./beats');
const { execFileSync } = require('child_process');
const { ROOT } = require('./server');

const MAX_SPEED = 1.35;

async function makeVoice(story, scenes, duration, work, log) {
  // "say": "line"  or  "say": [{ "text": "line", "at": beats from the scene's cut }, ...]
  const beat = scenes.length ? (scenes[0].end - scenes[0].start) / scenes[0].beats : 0.5;
  const lines = story.scenes.flatMap((s, i) => {
    if (!s.say) return [];
    const list = Array.isArray(s.say) ? s.say : [{ text: s.say, at: 0 }];
    return list.map((l) => ({ i, text: l.text, t: scenes[i].start + (l.at || 0) * beat + (l.delay ?? s.sayDelay ?? 0.06) }));
  }).sort((a, b) => a.t - b.t);
  if (!lines.length || story.voice === false) return null;
  const v = story.voice || {};
  const speaker = v.speaker || 'am_michael';
  const base = v.speed || 1.05;
  const dir = path.join(work, 'vo');
  fs.mkdirSync(dir, { recursive: true });
  const rec = v.dir ? path.join(ROOT, v.dir) : null;
  const { KokoroTTS } = rec ? {} : await import('kokoro-js');
  let tts = null;
  const bus = new A.Bus(duration);
  const report = [];
  for (const [k, ln] of lines.entries()) {
    const room = (k + 1 < lines.length ? lines[k + 1].t : duration - 0.4) - ln.t - 0.08;
    let speed = rec ? 1 : base, file, secs;
    if (rec) {
      // a recording: use it as is, or tighten it (pitch kept) up to 1.25x if it runs long
      file = path.join(rec, String(k + 1).padStart(2, '0') + '.wav');
      if (!fs.existsSync(file)) throw new Error(`voice.dir: missing ${path.relative(ROOT, file)} for line ${k + 1} "${ln.text}"`);
      secs = trimmedLength(file);
      if (secs > room) {
        speed = Math.min(1.25, secs / room);
        const fast = path.join(dir, `rec-${k + 1}-${speed.toFixed(3)}.wav`);
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-af', `atempo=${speed.toFixed(4)}`, fast]);
        file = fast; secs = trimmedLength(file);
      }
    }
    for (let tries = 0; !rec && tries < 3; tries++) {
      const key = crypto.createHash('sha1').update([ln.text, speaker, speed.toFixed(3)].join('|')).digest('hex').slice(0, 12);
      file = path.join(dir, key + '.wav');
      if (!fs.existsSync(file)) {
        if (!tts) tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
        const a = await tts.generate(ln.text, { voice: speaker, speed });
        await a.save(file);
      }
      secs = trimmedLength(file);
      if (secs <= room || speed >= MAX_SPEED) break;
      speed = Math.min(MAX_SPEED, speed * (secs / room) * 1.03);
    }
    const x = trim(decode(file, A.SR, 1));
    bus.add(ln.t, x.length / A.SR, (i) => x[i], 1, 0);
    const over = secs > room + 0.02;
    report.push(`  ${rec ? String(k + 1).padStart(2, '0') + '.wav' : ''} scene ${String(ln.i + 1).padStart(2)} ${ln.t.toFixed(2)}s  ${secs.toFixed(2)}s of ${room.toFixed(2)}s${speed > base + 1e-3 ? `  sped up to ${speed.toFixed(2)}x` : ''}${over ? '  RUNS LONG: shorten this line' : ''}  "${ln.text}"`);
  }
  log(`voice: ${lines.length} lines, ${rec ? 'recordings in ' + v.dir : 'Kokoro ' + speaker}`);
  report.forEach((r) => console.log(r));
  return bus;
}

// leading/trailing silence off, so "starts on the cut" means the first syllable does
function trim(x) {
  const th = 0.01;
  let a = 0, b = x.length - 1;
  while (a < b && Math.abs(x[a]) < th) a++;
  while (b > a && Math.abs(x[b]) < th) b--;
  a = Math.max(0, a - Math.round(0.01 * A.SR));
  b = Math.min(x.length, b + Math.round(0.06 * A.SR));
  return x.subarray(a, b);
}
function trimmedLength(file) { return trim(decode(file, A.SR, 1)).length / A.SR; }

module.exports = { makeVoice };
