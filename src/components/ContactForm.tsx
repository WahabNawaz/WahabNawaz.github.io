"use client";

// Contact form for a static site (GitHub Pages has no server).
// - Validates name, email and message with inline, screen-reader friendly errors.
// - Sends through a form service set in site.form (src/content/site.ts):
//     web3forms: needs the public access key from web3forms.com
//     formspree: needs the form URL from formspree.io
//   Both keys are meant to be public; never put a secret here.
// - With no service set it opens the visitor's email app, everything pre-filled.
// - Spam guard: a hidden honeypot field + a minimum fill time.
// - No double sends: one request at a time, and the same message is not sent twice.
import { useRef, useState } from "react";
import { site } from "@/content/site";

type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "mail" | "error" | "duplicate";

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const MIN_FILL_MS = 2500; // a person needs longer than this to fill the form
const TIMEOUT_MS = 15000;

function validate(v: Record<Field, string>) {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email address does not look right.";
  if (v.message.trim().length < 10) e.message = "Tell me a little more (at least 10 characters).";
  return e;
}

/** Which service is set up, if any. */
export function formService(): { kind: "web3forms" | "formspree"; url: string } | null {
  const f = site.form;
  if (f.provider === "web3forms" && f.accessKey) return { kind: "web3forms", url: "https://api.web3forms.com/submit" };
  if (f.provider === "formspree" && f.endpoint) return { kind: "formspree", url: f.endpoint };
  return null;
}

async function send(values: Record<Field, string>, honey: string) {
  const service = formService();
  if (!service) throw new Error("no service");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const body =
    service.kind === "web3forms"
      ? {
          access_key: site.form.accessKey,
          subject: `New message from ${values.name} (${site.name} portfolio)`,
          from_name: `${site.name} portfolio`,
          ...values,
          botcheck: honey, // Web3Forms drops anything with this filled in
        }
      : { ...values, _subject: `New message from ${values.name}`, _gotcha: honey };
  try {
    const res = await fetch(service.url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; ok?: boolean };
    // Web3Forms answers { success }, Formspree { ok }
    return res.ok && (data.success ?? data.ok ?? true) !== false;
  } finally {
    clearTimeout(timer);
  }
}

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const busy = useRef(false); // blocks double clicks before React re-renders
  const lastSent = useRef<string>("");
  const startedAt = useRef<number>(0);
  const honey = useRef<HTMLInputElement>(null);

  const set = (f: Field, value: string) => {
    const next = { ...values, [f]: value };
    setValues(next);
    if (touched[f]) setErrors(validate(next));
    if (status !== "sending" && status !== "idle") setStatus("idle");
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length) {
      const first = (Object.keys(found) as Field[])[0];
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }

    const fingerprint = JSON.stringify(values);
    if (fingerprint === lastSent.current) {
      setStatus("duplicate");
      return;
    }

    if (formService()) {
      // bots fill the hidden field or submit instantly: pretend it worked
      const tooFast = !startedAt.current || e.timeStamp - startedAt.current < MIN_FILL_MS;
      if (honey.current?.value || tooFast) {
        setStatus("sent");
        return;
      }
      busy.current = true;
      setStatus("sending");
      try {
        const ok = await send(values, honey.current?.value ?? "");
        if (ok) {
          lastSent.current = fingerprint;
          setValues({ name: "", email: "", message: "" });
          setTouched({});
          setStatus("sent");
        } else setStatus("error");
      } catch {
        setStatus("error");
      } finally {
        busy.current = false;
      }
      return;
    }

    // No form service configured: hand over to the email app.
    const subject = encodeURIComponent(`Project enquiry from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    lastSent.current = fingerprint;
    setStatus("mail");
  }

  const fieldCls = (f: Field) =>
    `mt-2 w-full rounded-2xl border bg-white/70 px-4 py-3 text-base outline-none transition-colors focus:border-ink ${
      errors[f] && touched[f] ? "border-red-500" : "border-line"
    }`;
  const sending = status === "sending";

  return (
    <form
      onSubmit={submit}
      noValidate
      className="w-full max-w-xl space-y-5"
      aria-describedby="cf-status"
      aria-busy={sending}
      onFocusCapture={(e) => {
        // when the visitor starts filling it in (for the spam timer)
        if (!startedAt.current) startedAt.current = e.timeStamp || 1;
      }}
      data-form-service={formService()?.kind ?? "mailto"}
    >
      {/* honeypot: hidden from people and screen readers, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-company">Company website</label>
        <input ref={honey} id="cf-company" name="botcheck" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {(["name", "email"] as Field[]).map((f) => (
        <div key={f}>
          <label htmlFor={`cf-${f}`} className="font-mono text-[11px] uppercase tracking-widest">
            {f === "name" ? "Your name" : "Email"} <span aria-hidden className="text-accent">*</span>
          </label>
          <input
            id={`cf-${f}`}
            name={f}
            type={f === "email" ? "email" : "text"}
            autoComplete={f === "email" ? "email" : "name"}
            required
            maxLength={f === "email" ? 200 : 100}
            value={values[f]}
            disabled={sending}
            onChange={(e) => set(f, e.target.value)}
            onBlur={() => {
              setTouched((t) => ({ ...t, [f]: true }));
              setErrors(validate(values));
            }}
            aria-invalid={Boolean(errors[f] && touched[f])}
            aria-describedby={errors[f] && touched[f] ? `cf-${f}-err` : undefined}
            className={fieldCls(f)}
          />
          {errors[f] && touched[f] && (
            <p id={`cf-${f}-err`} className="mt-1 text-sm text-red-600">
              {errors[f]}
            </p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="cf-message" className="font-mono text-[11px] uppercase tracking-widest">
          What are you building? <span aria-hidden className="text-accent">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          value={values.message}
          disabled={sending}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, message: true }));
            setErrors(validate(values));
          }}
          aria-invalid={Boolean(errors.message && touched.message)}
          aria-describedby={errors.message && touched.message ? "cf-message-err" : undefined}
          className={`${fieldCls("message")} resize-y`}
        />
        {errors.message && touched.message && (
          <p id="cf-message-err" className="mt-1 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-accent hover:text-ink disabled:cursor-wait disabled:opacity-60"
        >
          {sending && <span aria-hidden className="size-3 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />}
          {sending ? "Sending…" : "Send message"}
        </button>
        <p id="cf-status" role="status" aria-live="polite" className="text-sm">
          {status === "sent" && "Thanks! Your message is on its way. I usually reply within a day."}
          {status === "mail" && "Your email app should open with the message ready to send."}
          {status === "duplicate" && "This message was already sent. Change it if you want to send another."}
          {status === "error" && (
            <span className="text-red-600">
              Sorry, that did not go through. Please try again, or email{" "}
              <a className="underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              .
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
