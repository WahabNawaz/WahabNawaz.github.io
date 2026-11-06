"use client";

// Contact form for a static site (GitHub Pages has no server):
// - validates name, email and message with clear inline errors;
// - if site.formEndpoint is set (e.g. a Formspree/Web3Forms URL), it POSTs
//   there and shows success or failure;
// - otherwise it opens the visitor's email app with everything pre-filled.
import { useState } from "react";
import { site } from "@/content/site";

type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "mail" | "error";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Record<Field, string>) {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!EMAIL.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (v.message.trim().length < 10) e.message = "Tell me a little more (at least 10 characters).";
  return e;
}

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (f: Field, value: string) => {
    const next = { ...values, [f]: value };
    setValues(next);
    if (touched[f]) setErrors(validate(next));
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length) {
      const first = (Object.keys(found) as Field[])[0];
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }

    if (site.formEndpoint) {
      setStatus("sending");
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        setStatus(res.ok ? "sent" : "error");
        if (res.ok) setValues({ name: "", email: "", message: "" });
      } catch {
        setStatus("error");
      }
      return;
    }

    // No form service configured: hand over to the email app.
    const subject = encodeURIComponent(`Project enquiry from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setStatus("mail");
  }

  const fieldCls = (f: Field) =>
    `mt-2 w-full rounded-2xl border bg-white/70 px-4 py-3 text-base outline-none transition-colors focus:border-ink ${
      errors[f] && touched[f] ? "border-red-500" : "border-line"
    }`;

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-xl space-y-5" aria-describedby="cf-status">
      {(["name", "email"] as Field[]).map((f) => (
        <div key={f}>
          <label htmlFor={`cf-${f}`} className="font-mono text-[11px] uppercase tracking-widest">
            {f === "name" ? "Your name" : "Email"}
          </label>
          <input
            id={`cf-${f}`}
            type={f === "email" ? "email" : "text"}
            autoComplete={f === "email" ? "email" : "name"}
            value={values[f]}
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
          What are you building?
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={values.message}
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
          disabled={status === "sending"}
          className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p id="cf-status" role="status" aria-live="polite" className="text-sm">
          {status === "sent" && "Thanks! Your message is on its way. I usually reply within a day."}
          {status === "mail" && "Your email app should open with the message ready to send."}
          {status === "error" && `Sorry, that did not go through. Please email ${site.email} directly.`}
        </p>
      </div>
    </form>
  );
}
