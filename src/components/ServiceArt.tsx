// Isometric illustration for a service (public/illustrations/<id>-560|1120.webp).
// Made for this site in three.js (tools/render/services.html), transparent background.
import { asset } from "@/lib/asset";

const IDS = ["wordpress", "webflow", "shopify", "framer", "php"];

export default function ServiceArt({
  id,
  className = "",
  sizes = "(min-width: 768px) 30vw, 80vw",
  delay = 0,
}: {
  id: string;
  className?: string;
  sizes?: string;
  delay?: number;
}) {
  if (!IDS.includes(id)) return null;
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP */}
      <img
        src={asset(`/illustrations/${id}-560.webp`)}
        srcSet={`${asset(`/illustrations/${id}-560.webp`)} 560w, ${asset(`/illustrations/${id}-1120.webp`)} 1120w`}
        sizes={sizes}
        width={1416}
        height={1000}
        loading="lazy"
        decoding="async"
        alt=""
        data-service-art={id}
        className="art-float h-auto w-full"
        style={{ animationDelay: `${-delay}s` }}
      />
    </div>
  );
}
