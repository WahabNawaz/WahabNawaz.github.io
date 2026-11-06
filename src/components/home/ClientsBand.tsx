// "In good company": dark section with three rows of client names drifting
// in alternating directions. Swap the names for logo images later.
import Marquee from "@/components/Marquee";
import { clients } from "@/content/data";

function Row({ offset }: { offset: number }) {
  const list = [...clients.slice(offset), ...clients.slice(0, offset)];
  return (
    <>
      {list.map((c) => (
        <span
          key={c}
          className="mx-3 grid h-24 w-56 shrink-0 place-items-center rounded-2xl border border-paper/10 font-display text-2xl font-semibold tracking-tight text-paper/70 md:h-28 md:w-64"
        >
          {c}
        </span>
      ))}
    </>
  );
}

export default function ClientsBand() {
  return (
    <section data-pose="clients" className="bg-ink py-28 text-paper">
      <div className="px-5 md:px-8 md:pl-[26%]">
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">In good company.</h2>
        <p className="mt-6 max-w-md text-paper/60">Lorem ipsum brands from dolor to amet who trusted me with how they look online, and how they sell.</p>
      </div>
      <div className="mt-14 space-y-4">
        <Marquee duration={40} scrollBoost={false}>
          <Row offset={0} />
        </Marquee>
        <Marquee duration={46} reverse scrollBoost={false}>
          <Row offset={3} />
        </Marquee>
        <Marquee duration={52} scrollBoost={false}>
          <Row offset={5} />
        </Marquee>
      </div>
    </section>
  );
}
