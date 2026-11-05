"use client";

// Makes a short original drum + bass loop in the browser (OfflineAudioContext)
// and returns it as a WAV blob URL, so the Playground works without any files.

function writeWav(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  const rate = buffer.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const str = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  out.setUint32(4, 36 + data.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true); // PCM
  out.setUint16(22, 1, true); // mono
  out.setUint32(24, rate, true);
  out.setUint32(28, rate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  str(36, "data");
  out.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    out.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return new Blob([out], { type: "audio/wav" });
}

let cached: Promise<string> | null = null;

export function demoBeatUrl(bpm: number) {
  cached ??= render(bpm);
  return cached;
}

async function render(bpm: number) {
  const rate = 44100;
  const beat = 60 / bpm;
  const bars = 8;
  const length = bars * 4 * beat;
  const ctx = new OfflineAudioContext(1, Math.ceil(length * rate), rate);
  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  const noise = ctx.createBuffer(1, rate, rate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.4);
  };
  const hiss = (t: number, dur: number, type: BiquadFilterType, freq: number, vol: number) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(master);
    s.start(t);
    s.stop(t + dur + 0.02);
  };
  const bassNotes = [55, 55, 65.41, 49]; // A1 A1 C2 G1, one per bar
  const bass = (t: number, hz: number) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = hz;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
    o.connect(f).connect(g).connect(master);
    o.start(t);
    o.stop(t + beat);
  };

  for (let b = 0; b < bars * 4; b++) {
    const t = b * beat;
    kick(t);
    if (b % 4 === 1 || b % 4 === 3) hiss(t, 0.18, "bandpass", 1800, 0.6); // snare
    hiss(t + beat / 2, 0.05, "highpass", 7000, 0.25); // off-beat hat
    hiss(t, 0.04, "highpass", 9000, 0.12);
    if (b % 2 === 0 || b % 4 === 3) bass(t + (b % 4 === 3 ? beat / 2 : 0), bassNotes[Math.floor(b / 4) % 4]);
  }

  const rendered = await ctx.startRendering();
  return URL.createObjectURL(writeWav(rendered));
}
