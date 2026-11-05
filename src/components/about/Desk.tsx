"use client";

// "Organised chaos": things on the desk can be dragged and thrown (GSAP
// Draggable + Inertia). Mess / Tidy / Stack animate them into a layout.
// The items are placeholders: swap the emoji for cut-out photos of your own things.
import { useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { lorem } from "@/content/site";

gsap.registerPlugin(Draggable, InertiaPlugin, useGSAP);

type Item = { id: string; label: string; icon?: string; kind?: "photo" | "note" };

const ITEMS: Item[] = [
  { id: "photo", label: "Your photo", kind: "photo" },
  { id: "laptop", label: "Laptop", icon: "💻" },
  { id: "coffee", label: "Coffee", icon: "☕" },
  { id: "headphones", label: "Headphones", icon: "🎧" },
  { id: "plant", label: "Plant", icon: "🪴" },
  { id: "phone", label: "Phone", icon: "📱" },
  { id: "camera", label: "Camera", icon: "📷" },
  { id: "pencil", label: "Pencil", icon: "✏️" },
  { id: "glasses", label: "Sunglasses", icon: "🕶️" },
  { id: "note", label: "Sticky note", kind: "note" },
];

type Mode = "mess" | "tidy" | "stack";

// Positions as fractions of the desk (0..1) + rotation in degrees.
const MESS: [number, number, number][] = [
  [0.08, 0.1, -8], [0.7, 0.06, 6], [0.22, 0.62, 12], [0.82, 0.55, -10], [0.55, 0.72, 4],
  [0.38, 0.08, -14], [0.06, 0.7, 7], [0.9, 0.18, 15], [0.62, 0.38, -6], [0.25, 0.32, 9],
];

function target(mode: Mode, i: number, n: number): [number, number, number] {
  if (mode === "mess") return MESS[i % MESS.length];
  if (mode === "tidy") {
    const cols = 5;
    const c = i % cols;
    const r = Math.floor(i / cols);
    return [0.06 + c * 0.2, 0.2 + r * 0.42, 0];
  }
  // stack: a loose pile in the middle
  return [0.44 + Math.sin(i * 1.7) * 0.03, 0.34 + Math.cos(i * 2.3) * 0.04, (i - n / 2) * 4];
}

export default function Desk() {
  const desk = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("mess");

  // Make items draggable once.
  useGSAP(
    () => {
      let z = 10;
      Draggable.create("[data-item]", {
        bounds: desk.current,
        inertia: true,
        edgeResistance: 0.7,
        onPress() {
          z += 1;
          gsap.set(this.target, { zIndex: z });
          gsap.to(this.target, { scale: 1.08, duration: 0.2 });
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, duration: 0.3 });
        },
      });
    },
    { scope: desk },
  );

  // Animate into the chosen layout (and re-place on resize).
  useGSAP(
    () => {
      const el = desk.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-item]", el);
      const place = (animate: boolean) => {
        const { width, height } = el.getBoundingClientRect();
        items.forEach((item, i) => {
          const [fx, fy, rot] = target(mode, i, items.length);
          const x = Math.min(fx * width, width - item.offsetWidth);
          const y = Math.min(fy * height, height - item.offsetHeight);
          const vars = { x, y, rotation: rot, duration: animate ? 0.9 : 0, ease: "back.out(1.4)", delay: animate ? i * 0.03 : 0 };
          gsap.to(item, vars);
        });
      };
      place(true);
      const onResize = () => place(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [mode], scope: desk },
  );

  return (
    <section className="px-5 py-24 md:px-8" aria-labelledby="desk-title">
      <div className="relative">
        <div ref={desk} className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-3xl bg-white/50">
          {/* center copy sits under the objects */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center">
            <div className="max-w-md">
              <h2 id="desk-title" className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                Organised chaos
              </h2>
              <p className="mt-4 text-ink/70">{lorem.sentence} Drag things around.</p>
            </div>
          </div>

          {ITEMS.map((item) => (
            <div
              key={item.id}
              data-item
              className="absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing"
              title={item.label}
            >
              {item.kind === "photo" ? (
                <figure className="w-28 rounded-sm bg-white p-2 pb-6 shadow-xl md:w-44">
                  <div className="grid aspect-square place-items-center bg-gradient-to-br from-accent to-[#ffd1a8] font-mono text-[10px] uppercase tracking-widest text-ink/60">
                    Your photo
                  </div>
                  <figcaption className="mt-2 text-center text-xs">Me, lorem ipsum</figcaption>
                </figure>
              ) : item.kind === "note" ? (
                <div className="w-28 bg-[#fff2a8] p-3 text-xs leading-snug shadow-lg md:w-40 md:p-4 md:text-sm">Lorem ipsum: dolor sit amet, consectetur.</div>
              ) : (
                <span className="block text-5xl drop-shadow-[0_12px_14px_rgba(0,0,0,0.25)] md:text-7xl" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
              )}
            </div>
          ))}
        </div>

        <div role="group" aria-label="Arrange the desk" className="mt-6 flex justify-center gap-2">
          {(["mess", "tidy", "stack"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                mode === m ? "bg-ink text-paper" : "hover:bg-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
