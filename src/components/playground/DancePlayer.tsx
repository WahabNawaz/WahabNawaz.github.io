"use client";

// "Dance with me": pick a song and the character dances to it. Pause and it
// holds still; drag the bar ahead and it catches up (the dance follows the
// song position stored in sceneStore.dance).
import { useEffect, useRef, useState } from "react";
import { tracks, type Track } from "@/content/music";
import { asset, sceneStore } from "@/lib/scene-store";
import { demoBeatUrl } from "@/lib/demo-beat";

export default function DancePlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Feed the song position to the 3D scene every frame.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = audio.current;
      if (a && current) {
        sceneStore.setDance({ active: true, playing: !a.paused, time: a.currentTime, bpm: current.bpm, clip: current.dance });
        setTime(a.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current]);

  // Leaving the page stops the music and the dance.
  useEffect(
    () => () => {
      audio.current?.pause();
      sceneStore.setDance({ active: false, playing: false, time: 0 });
    },
    [],
  );

  async function choose(track: Track) {
    if (current?.id === track.id && audio.current) {
      if (audio.current.paused) void audio.current.play();
      else audio.current.pause();
      return;
    }
    audio.current?.pause();
    const src = track.src ? asset(track.src) : await demoBeatUrl(track.bpm);
    const a = new Audio(src);
    a.loop = true;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onloadedmetadata = () => setDuration(a.duration);
    audio.current = a;
    setCurrent(track);
    setTime(0);
    await a.play().catch(() => setPlaying(false));
  }

  function stop() {
    audio.current?.pause();
    audio.current = null;
    setCurrent(null);
    setPlaying(false);
    setTime(0);
    sceneStore.setDance({ active: false, playing: false, time: 0 });
  }

  function seek(value: number) {
    if (audio.current) audio.current.currentTime = value;
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-sm rounded-3xl bg-paper/80 p-5 backdrop-blur md:p-6">
      <p className="text-sm leading-relaxed">
        Pick a song and I dance to it. Pause it and I hold still; skip ahead and I catch up.
      </p>

      <ul className="mt-5 space-y-2">
        {tracks.map((t) => {
          const isCurrent = current?.id === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => choose(t)}
                aria-label={`${isCurrent && playing ? "Pause" : "Play"} ${t.title}, ${t.artist}`}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isCurrent ? "border-ink bg-ink text-paper" : "border-line hover:bg-white"
                }`}
              >
                <span>
                  <span className="block font-mono text-xs uppercase tracking-widest">{t.title}</span>
                  <span className="block text-xs opacity-60">{t.artist}</span>
                </span>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-ink">
                  {isCurrent && playing ? "❚❚" : "▶"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {current ? (
        <div className="mt-5">
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
            <span>{playing ? "Now playing" : "Paused"}</span>
            <span>
              {fmt(time)} / {fmt(duration || 0)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(time, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Song position"
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <button type="button" onClick={stop} className="mt-3 font-mono text-xs uppercase tracking-widest underline underline-offset-4">
            ■ Stop the music
          </button>
        </div>
      ) : (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted">Tap a song</p>
      )}
    </div>
  );
}
