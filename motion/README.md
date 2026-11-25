# Window Hero RDU motion videos

Short vertical videos (TikTok, Reels, Shorts) built from a story file. Each
video is an HTML page animated with GSAP (Three.js for 3D), captured frame by
frame with Playwright, and encoded with ffmpeg at 1080x1920, 30 fps.

```
npm install
npm run render first-test
```

This lives in its own folder (not the repository root) so Netlify keeps
deploying the Hero Club page with no build step.

## What you get

`out/<video>/`

| File | What it is |
|---|---|
| `clean.mp4` | The video with the beat and sound effects |
| `filmed.mp4` | The same video playing on a laptop in a dark room, beat and effects |
| `clean-sfx-only.mp4` | The video with sound effects only, to pair with a track from TikTok's Commercial Music Library or Instagram's royalty-free audio |
| `work/` | `mix.wav`, `sfx.wav`, `music.wav` and `timeline.json` (scene times and every sound cue) |

`out/` is not committed.

## Folders

| Path | What it is |
|---|---|
| `brand/` | `brand.json` (colours, website, phone), logos, fonts |
| `music/` | Drop one song here to cut to it. Empty: an original beat is generated |
| `videos/<name>/story.json` | One video |
| `engine/` | The player page, scene types (`engine/scenes/`) and the filmed look |
| `render/` | Render, audio, beat detection and check scripts |
| `out/` | Finished videos |

## Making the next video

1. Copy a story: `cp -r videos/first-test videos/spring-promo`
2. Edit `videos/spring-promo/story.json` (fields below).
3. Look at it fast, without a full render:
   - `npm run preview spring-promo` and open the link it prints (plays in real time, no sound), or
   - `npm run stills spring-promo` saves the middle and end frame of every scene to `out/spring-promo/stills/`.
     Add `--filmed` to also see the laptop version; add times to pick frames (`npm run stills spring-promo 2.5 9 --filmed`).
4. `npm run render spring-promo`. Options go after `--`:
   - `--only clean`: skip the laptop version (about 1 minute for 20 seconds). Use this while iterating.
   - `--only filmed`: just the laptop version.
   - `--workers N`: how many browsers draw the laptop version at once (default: half your CPU cores,
     or 2 with a GPU).
   - `--software`: force software 3D. By default Chrome uses your graphics card if it finds one;
     the first lines of the log say `WebGL: GPU` or `WebGL: software`.
   - `--draft`: faster, lower-quality encode.

   The laptop version is the slow part: its 3D lighting, glow and reflection are drawn for every
   frame. On a machine without a graphics card it runs at roughly 1 to 2 seconds per frame.
5. `npm run check spring-promo` confirms every cut is on a beat, the whooshes land on the cuts,
   nothing clips, and the loudness. It also writes `check-sheet.png` (the frame before and after
   each cut) and `check-wave.png`.

### story.json

```json
{
  "title": "Spring promo",
  "bpm": 120,
  "scenes": [
    { "type": "typewriter", "beats": 8, "bg": "black", "text": "Pollen on your *windows?*" }
  ]
}
```

- `beats` is how long a scene lasts. At 120 BPM one beat is 0.5 s, so 2 to 4 beats is a 1 to 2 second scene.
  Every cut lands on a beat because scenes are measured in beats. Keep totals in multiples of 4
  (one bar) so big moments fall on bar lines.
- `bg` is a colour name from `brand/brand.json`: `blue`, `navy`, `sky`, `white`, `black`, `accent`.
  Text colour follows automatically. Put `*stars*` around words to use the accent colour.
- `push: true` (or `false`) adds or removes a slow camera push on a scene.
- Optional top level: `"label"` (top-left corner text), `"corner"` (bottom-right),
  `"music": { "file": "song.mp3", "start": 32.5, "offsetBeats": 0 }`, or `"music": false` to ignore /music.

### Scene types

| type | fields | notes |
|---|---|---|
| `typewriter` | `text`, `align`, `typeEnd` | Types out with a blinking block cursor and soft key clicks. `typeEnd` is the share of the scene spent typing (0.62) |
| `kinetic` | `text`, `mode`, `to`, `toBg`, `at`, `sub` | Giant word. `mode`: `slam` (hits in on the cut), `morph` (letters flip from `text` to `to`), `swap` (squeegee wipes `text` into `to` on `toBg`). `at` = beat of the change |
| `stack` | `words`, `bg` (one or a list), `every` | One word per beat, colour field flips on each, earlier words stay as outlines |
| `grid3d` | `cols`, `rows`, `text` | 3D wall of window panes flipping from grey to sparkling in a wave |
| `linedraw` | `text`, `sub` | House outline draws itself, a tech steps in and a water-fed pole telescopes up to the top window, scrubs, and water runs down the glass |
| `countup` | `items: [{ value, prefix, suffix, label }]` | Scoreboard digits roll up, each number lands on the next beat |
| `icon` | `icon` (`padlock`, `check`, `star`, `pin`), `text`, `at` | The icon snaps on beat `at` (default 2) |
| `tiers` | `items: [{ name, medal, tag, lines }]`, `every`, `price`, `fine` | Plan cards, one lands per beat (Hero Club Bronze / Silver / Gold) |
| `badge` | `image`, `sub` | A logo slams in over turning rays, stars pop, a glint sweeps across it |
| `endcard` | `tag`, `website`, `phone` | Logo, then website, then phone on successive beats. Riser leads in |

A new scene type is one file in `engine/scenes/` exporting `build(root, scene, ctx)`, registered in
`engine/player.js`. Use `ctx.cue(time, 'hit' | 'whoosh' | 'click' | 'snap' | 'pop' | 'tick' | 'sparkle' | 'swipe' | 'riser')`
to place sounds; they are generated in `render/audio.js`.

## Audio

- **No song in `/music`:** an original 120 BPM track is generated in code (kick, clap, hats, off-beat
  bass, a synth arpeggio over Am-F-C-G). It follows the scenes: synth-only intro over the first
  scene, full beat from the first cut, a two-beat break under the riser, a drop on the end card,
  and a final chord that rings out to silence on the last frame.
- **A song in `/music`:** the first audio file (or `music.file`) is analysed for tempo and beat
  positions. The video uses its tempo, the song starts on a beat so every cut lands on one, and it
  fades over the last bar. Use music you have the rights to.
- **Effects** are generated in code: whoosh into each cut, clicks for typing, a hit on each slammed
  word and number, a snap for icons, a riser into the end card, sparkles and pops.
- **Mix:** the music is ducked slightly under the effects so they sit just above it, the full mix is
  set to about -14 LUFS (where TikTok, Reels and Shorts play back) and limited below -1 dBTP.
  The effects-only track keeps the same effect levels, so it sits right under a library track.

## Requirements

Node 18+, ffmpeg on the PATH, and Playwright's Chromium (`npx playwright install chromium`
if it is not already installed). No GPU needed; WebGL runs in software.
