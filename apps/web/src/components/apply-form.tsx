"use client";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { api, ApiError } from "@/services/api";
export function ApplyForm({
  opportunityId,
  closed,
  opportunityType,
}: {
  opportunityId: string;
  closed: boolean;
  opportunityType: "PROJECT" | "CASTING";
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const toast = useToast();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await api("/member/applications", {
        method: "POST",
        body: JSON.stringify({
          opportunityId,
          opportunityType,
          coverNote: data.get("coverNote"),
          ...(data.get("showreel") ? { showreelUrl: data.get("showreel") } : {}),
        }),
      });
      setDone(true);
      toast.success("Application submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to apply.";
      setError(message);
      setLogin(error instanceof ApiError && error.status === 401);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }
  if (closed) return <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-900">Applications for this opportunity are closed.</p>;
  if (done)
    return (
      <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">
        Application submitted.{" "}
        <Link href="/member/applications" className="underline">
          Track your application
        </Link>
        .
      </p>
    );
  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Tell us about yourself
        <textarea name="coverNote" required minLength={20} maxLength={5000} rows={5} className="field" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Showreel link (optional)
        <input name="showreel" type="url" placeholder="https://" className="field" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {login && (
        <Link href="/login" className="text-sm font-semibold text-red-700">
          Sign in to apply →
        </Link>
      )}
      <button disabled={pending} className="brand-button brand-button-primary">
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
