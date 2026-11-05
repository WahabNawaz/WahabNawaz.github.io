"use client";

import { useState } from "react";
import { site } from "@/content/site";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-accent hover:text-ink"
    >
      <span aria-live="polite">{copied ? "Copied ✓" : "Copy email"}</span>
    </button>
  );
}
