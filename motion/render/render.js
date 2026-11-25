// npm run render <video> [-- --only clean|filmed] [--draft] [--workers N] [--software] [--keep-frames]
// Renders videos/<video>/story.json to out/<video>/:
//   clean.mp4           motion graphics with beat + effects
//   filmed.mp4          the same video on a laptop in a dark room, beat + effects
//   clean-sfx-only.mp4  motion graphics with effects only (add your own track in the app)
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { serve, ROOT } = require('./server');
const A = require('./audio');
const { analyse, decode } = require('./beats');

const args = process.argv.slice(2);
const name = args.find((a, i) => !a.startsWith('--') && !['--only', '--workers'].includes(args[i - 1]));
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const draft = args.includes('--draft');
const FPS = 30;
const WORKERS = args.includes('--workers') ? +args[args.indexOf('--workers') + 1] : 0;
const os = require('os');
// --software forces software WebGL; otherwise Chrome uses the GPU if it finds one.
const GL_ARGS = args.includes('--software')
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu'];
const launch = () => chromium.launch({ args: GL_ARGS });
const AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;

if (!name) {
  const vids = fs.readdirSync(path.join(ROOT, 'videos')).filter((d) => fs.existsSync(path.join(ROOT, 'videos', d, 'story.json')));
  console.error(`Usage: npm run render <video>\nVideos: ${vids.join(', ')}`);
  process.exit(1);
}

const log = (...m) => console.log('·', ...m);
const sec = (t0) => ((Date.now() - t0) / 1000).toFixed(1) + 's';

function ffmpeg(argv, { input } = {}) {
  const p = spawn('ffmpeg', ['-v', 'error', '-y', ...argv], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', (c) => (c ? rej(new Error('ffmpeg failed: ' + argv.join(' '))) : res())));
  return { p, done };
}

function measure(file) {
  const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{')));
  return { i: +j.input_i, tp: +j.input_tp };
}

(async () => {
  const T0 = Date.now();
  const vdir = path.join(ROOT, 'videos', name);
  const story = JSON.parse(fs.readFileSync(path.join(vdir, 'story.json'), 'utf8'));
  const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'brand', 'brand.json'), 'utf8'));
  const out = path.join(ROOT, 'out', name);
  const work = path.join(out, 'work');
  fs.mkdirSync(work, { recursive: true });

  // 1. Tempo: from a song in /music if there is one, else the story's bpm (default 120).
  let song = null;
  const want = story.music && story.music.file;
  const files = fs.readdirSync(path.join(ROOT, 'music')).filter((f) => AUDIO_EXT.test(f)).sort();
  if (story.music === false) files.length = 0;
  const pick = want ? files.find((f) => f === want) : files[0];
  if (want && !pick) throw new Error(`music.file "${want}" is not in /music`);
  let bpm = story.bpm || 120;
  if (pick) {
    const t = Date.now();
    const a = analyse(path.join(ROOT, 'music', pick));
    bpm = a.bpm;
    // start on the first detected beat at or after music.start (seconds), plus music.offsetBeats
    const beat = 60 / bpm;
    const from = (story.music && story.music.start) || 0;
    let start = a.firstBeat + Math.max(0, Math.ceil((from - a.firstBeat) / beat - 1e-6)) * beat;
    start += ((story.music && story.music.offsetBeats) || 0) * beat;
    song = { file: path.join(ROOT, 'music', pick), start, ...a };
    log(`song: ${pick}  ${a.bpm} BPM, first beat ${a.firstBeat}s, using it from ${start.toFixed(3)}s (${sec(t)})`);
  } else {
    log(`no song in /music: generating an original ${bpm} BPM beat`);
  }

  // 2. Build the video in the browser and collect timing + sound cues.
  const { server, port } = await serve();
  const browser = await launch();
  // which WebGL renderer we got: a real GPU, or software (SwiftShader)
  const gl = await (await browser.newPage()).evaluate(() => {
    const c = document.createElement('canvas').getContext('webgl');
    if (!c) return 'none';
    const x = c.getExtension('WEBGL_debug_renderer_info');
    return x ? c.getParameter(x.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER);
  });
  const gpu = !/swiftshader|software|llvmpipe|none/i.test(gl);
  log(`WebGL: ${gpu ? 'GPU' : 'software'} (${gl})`);
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/engine/player.html?render`);
  const info = await page.evaluate(([s, b, bpm]) => window.__init(s, { brand: b, bpm, fps: 30 }), [story, brand, bpm]);
  if (errors.length) throw new Error('Player error: ' + errors.join('\n'));
  const duration = info.duration;
  const frames = Math.round(duration * FPS);
  log(`${info.scenes.length} scenes, ${duration.toFixed(2)}s at ${bpm} BPM (${frames} frames)`);
  info.scenes.forEach((s, i) => {
    const off = Math.abs(s.start * FPS - Math.round(s.start * FPS));
    log(`  ${String(i + 1).padStart(2)} ${s.type.padEnd(10)} ${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s  (${s.beats} beats)${off > 0.01 ? '  cut between frames' : ''}`);
  });
  fs.writeFileSync(path.join(work, 'timeline.json'), JSON.stringify({ bpm, ...info }, null, 2));

  // 3. Audio.
  let t = Date.now();
  const plan = { duration, beat: info.beat, scenes: info.scenes, cues: info.cues };
  let music;
  if (song) {
    const raw = decode(song.file, A.SR, 2);
    const s0 = Math.round(song.start * A.SR) * 2;
    music = A.fromInterleaved(raw.subarray(s0), duration);
    // fade the song out over the end card's last bar so it ends cleanly
    const fade = Math.min(4 * info.beat, duration / 4), n = Math.round(fade * A.SR);
    for (let i = 0; i < n; i++) { const k = (1 - i / n) ** 2; music.L[music.n - n + i] *= k; music.R[music.n - n + i] *= k; }
  } else {
    music = A.makeBeat(plan);
  }
  const sfx = A.makeSfx(plan);
  // levels: music body around -20 dBFS RMS, effects peaking ~5 dB above the music
  const body = music.rms(Math.round(info.scenes[0].end * A.SR), Math.round((info.scenes.at(-1).start) * A.SR)) || music.rms();
  music.scale(0.1 / body);
  sfx.scale(0.5 / Math.max(1e-6, sfx.peak()));
  A.duck(music, sfx, 0.35);
  const mix = new A.Bus(duration); mix.mix(music); mix.mix(sfx);
  A.fadeTail(mix, 0.12);
  // loudness to about -14 LUFS (TikTok / Reels / Shorts), then a peak limiter at -1 dBFS
  fs.writeFileSync(path.join(work, 'pre.wav'), A.wav(mix));
  const pre = measure(path.join(work, 'pre.wav'));
  const gain = 10 ** ((-13.4 - pre.i) / 20); // the limiter takes back ~0.6 dB
  mix.scale(gain); A.limit(mix, 0.85);
  const fx = new A.Bus(duration); fx.mix(sfx, gain); A.fadeTail(fx, 0.12); A.limit(fx, 0.85);
  const mixWav = path.join(work, 'mix.wav'), sfxWav = path.join(work, 'sfx.wav');
  fs.writeFileSync(mixWav, A.wav(mix));
  fs.writeFileSync(sfxWav, A.wav(fx));
  fs.writeFileSync(path.join(work, 'music.wav'), A.wav(music));
  const m = measure(mixWav), f = measure(sfxWav);
  log(`audio: mix ${m.i} LUFS, peak ${m.tp} dBTP | effects-only ${f.i} LUFS, peak ${f.tp} dBTP (${sec(t)})`);

  // 4. Frames -> video.
  //   Pass A draws every clean frame (fast) and keeps them in work/frames.
  //   Pass B composites the filmed look from those frames, split across several
  //   browsers at once, since that is the slow part (3D, glow, reflections).
  const doClean = only !== 'filmed', doFilmed = only !== 'clean';
  // grain in the filmed look eats bitrate, so it gets a cap that keeps the file phone-friendly (~40 MB / 20 s)
  const cap = (file) => (file.endsWith('filmed.mp4') ? ['-maxrate', '14M', '-bufsize', '28M'] : []);
  const enc = (file, audio, input) => ffmpeg([...(input ? ['-framerate', String(FPS), '-i', input] : ['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-']),
    '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '23' : file.endsWith('filmed.mp4') ? '20' : '16', ...cap(file),
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-t', duration.toFixed(3), '-movflags', '+faststart', file], { input: !input });
  const framesDir = path.join(work, 'frames'), filmedDir = path.join(work, 'filmed');
  for (const d of [framesDir, filmedDir]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
  const fname = (dir, i) => path.join(dir, String(i).padStart(5, '0') + '.png');
  const clean = doClean ? enc(path.join(out, 'clean.mp4'), mixWav) : null;
  const write = (proc, buf) => new Promise((res) => (proc.p.stdin.write(buf) ? res() : proc.p.stdin.once('drain', res)));
  t = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate((x) => window.__seek(x), i / FPS);
    const png = await page.screenshot({ type: 'png' });
    if (clean) await write(clean, png);
    if (doFilmed) fs.writeFileSync(fname(framesDir, i), png);
    if (errors.length) throw new Error(errors.join('\n'));
    if (i % 30 === 0 || i === frames - 1) process.stdout.write(`\r· clean frames ${i + 1}/${frames}  ${sec(t)}   `);
  }
  process.stdout.write('\n');
  if (clean) { clean.p.stdin.end(); await clean.done; }
  await browser.close();

  if (doFilmed) {
    const workers = Math.max(1, Math.min(frames, WORKERS || (gpu ? 2 : Math.max(1, Math.floor(os.cpus().length / 2)))));
    t = Date.now();
    let done = 0;
    const chunk = Math.ceil(frames / workers);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const b = await launch();
      const fp = await b.newPage({ viewport: { width: 1080, height: 1920 } });
      fp.on('pageerror', (e) => errors.push('filmed: ' + e.message));
      await fp.goto(`http://127.0.0.1:${port}/engine/filmed.html`);
      await fp.evaluate((d) => window.__initFilmed({ duration: d }), duration);
      for (let i = w * chunk; i < Math.min(frames, (w + 1) * chunk); i++) {
        const b64 = fs.readFileSync(fname(framesDir, i)).toString('base64');
        await fp.evaluate(([x, ft]) => window.__frame(x, ft), [b64, i / FPS]);
        await fp.screenshot({ type: 'png', path: fname(filmedDir, i) });
        if (errors.length) throw new Error(errors.join('\n'));
        if (++done % 30 === 0 || done === frames) process.stdout.write(`\r· filmed frames ${done}/${frames} on ${workers} workers  ${sec(t)}   `);
      }
      await b.close();
    }));
    process.stdout.write('\n');
    await enc(path.join(out, 'filmed.mp4'), mixWav, path.join(filmedDir, '%05d.png')).done;
  }
  server.close();
  if (!args.includes('--keep-frames')) for (const d of [framesDir, filmedDir]) fs.rmSync(d, { recursive: true, force: true });

  // 5. Effects-only copy: same picture, effects track.
  if (doClean) {
    await ffmpeg(['-i', path.join(out, 'clean.mp4'), '-i', sfxWav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', path.join(out, 'clean-sfx-only.mp4')]).done;
  }
  log(`done in ${sec(T0)} ->`);
  const made = [doClean && 'clean.mp4', doFilmed && 'filmed.mp4', doClean && 'clean-sfx-only.mp4'].filter(Boolean);
  for (const f of made) console.log('  ' + path.join('out', name, f));
})().catch((e) => { console.error('\n✖ ' + e.message); process.exit(1); });
