// npm run voices -- "Line to read" [voice ...]
// Saves a sample of each voice to out/voice-samples/ so you can pick one for story.json "voice.speaker".
const path = require('path');
const fs = require('fs');
const { ROOT } = require('./server');
(async () => {
  const args = process.argv.slice(2);
  const text = args[0] || 'Meet the Hero Club. Plans start at fifty-four dollars a month.';
  const list = args.length > 1 ? args.slice(1) : ['am_michael', 'am_fenrir', 'am_puck', 'am_eric', 'af_heart', 'af_bella', 'af_nicole', 'bm_george'];
  const { KokoroTTS } = await import('kokoro-js');
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
  const dir = path.join(ROOT, 'out', 'voice-samples');
  fs.mkdirSync(dir, { recursive: true });
  for (const v of list) {
    const a = await tts.generate(text, { voice: v, speed: 1.05 });
    const f = path.join(dir, `${v}.wav`);
    await a.save(f);
    console.log(f);
  }
  console.log(`All voices: ${Object.keys(tts.voices).join(' ')}\n(am = American male, af = American female, bm/bf = British)`);
})();
