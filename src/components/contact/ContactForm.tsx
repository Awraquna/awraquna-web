"use client";

import { useState, type FormEvent } from "react";
import { API_BASE } from "@/lib/api";
import type { ContactPayload } from "@/lib/types";
import Icon from "@/components/Icon";

type Props = {
  initialSubject?: string;
  labels: {
    name: string;
    phone: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
};

type Status = "idle" | "sending" | "success" | "error";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export default function ContactForm({ initialSubject = "", labels }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState<ContactPayload>({
    name: "",
    phone: "",
    email: "",
    company: "",
    subject: initialSubject,
    message: "",
  });

  const set = (k: keyof ContactPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email?.trim() || undefined,
          company: form.company?.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      setForm({ name: "", phone: "", email: "", company: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white dark:text-[#0a1017]">
          <Icon name="check" size={24} />
        </div>
        <p className="font-semibold text-brand-800">{labels.success}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-brand-700 underline"
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.name} required>
          <input className={inputCls} value={form.name} onChange={set("name")} required maxLength={200} autoComplete="name" />
        </Field>
        <Field label={labels.phone} required>
          <input
            className={inputCls}
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            required
            maxLength={50}
            autoComplete="tel"
            dir="ltr"
          />
        </Field>
        <Field label={labels.email}>
          <input className={inputCls} type="email" value={form.email} onChange={set("email")} maxLength={200} autoComplete="email" dir="ltr" />
        </Field>
        <Field label={labels.company} required>
          <input className={inputCls} value={form.company} onChange={set("company")} required maxLength={200} autoComplete="organization" />
        </Field>
      </div>
      <Field label={labels.subject} required>
        <input className={inputCls} value={form.subject} onChange={set("subject")} required maxLength={300} />
      </Field>
      <Field label={labels.message} required>
        <textarea className={inputCls} rows={6} value={form.message} onChange={set("message")} required maxLength={4000} />
      </Field>

      {status === "error" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {labels.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white dark:text-[#0a1017] transition hover:bg-brand-700 disabled:opacity-60"
      >
        <Icon name="mail" size={16} />
        {status === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ms-0.5 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
