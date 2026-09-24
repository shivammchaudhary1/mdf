"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApplyForm } from "@/components/apply-form";
import { useAppStore } from "@/store/app-store";

export function CastingApplyPanel({
  opportunityId,
  closed,
  returnPath,
}: {
  opportunityId: string;
  closed: boolean;
  returnPath: string;
}) {
  const router = useRouter();
  const status = useAppStore((state) => state.authStatus);
  const account = useAppStore((state) => state.account);
  const [open, setOpen] = useState(false);

  const encodedReturn = encodeURIComponent(returnPath);
  const signupHref = `/signup?next=${encodedReturn}`;
  const loginHref = `/login?next=${encodedReturn}`;
  const hasAccount = status === "authenticated" && !!account?.id;

  if (closed) {
    return (
      <div className="rounded-[20px] border border-amber-200/70 bg-amber-50/80 p-5">
        <p className="text-[9px] font-black uppercase tracking-[.13em] text-amber-800">Applications Closed</p>
        <h2 className="font-display mt-2 text-2xl font-semibold text-[#21180f]">This casting call is no longer accepting applications.</h2>
        <p className="mt-2 text-sm leading-6 text-amber-950/65">You can still review the role details and watch for new casting opportunities.</p>
        <Link href="/casting" className="site-button site-button-outline mt-5 bg-white">
          Browse Casting Calls
        </Link>
      </div>
    );
  }

  if (status === "unknown" || status === "loading") {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.03)]">
        <p className="site-kicker">Apply</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">Checking your account…</h2>
        <div className="mt-5 h-11 animate-pulse rounded-xl bg-black/5" />
      </div>
    );
  }

  if (!hasAccount) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-[#111] p-5 text-white shadow-[0_16px_44px_rgba(0,0,0,.12)] sm:p-6">
        <p className="text-[9px] font-black uppercase tracking-[.13em] text-[#ff6068]">Apply for this role</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">Create your member account to apply.</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Your account keeps your applications, portfolio and status updates in one place.
        </p>

        <button
          type="button"
          onClick={() => router.push(signupHref)}
          className="site-button site-button-primary mt-5 w-full justify-center"
        >
          Create Account & Apply
        </button>

        <Link href={loginHref} className="mt-3 block text-center text-xs font-semibold text-white/65 transition hover:text-white">
          Already have an account? Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-black/6 bg-white shadow-[0_12px_36px_rgba(0,0,0,.03)]">
      <div className="p-5 sm:p-6">
        <p className="site-kicker">Application</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">Ready to audition?</h2>
        <p className="mt-2 text-sm leading-6 text-[#777]">
          Applying as <strong className="font-semibold text-[#333]">{account?.name}</strong>. Your account details are attached automatically.
        </p>

        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="site-button site-button-primary mt-5 w-full justify-center">
            Apply Now
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-black/6 px-5 pb-6 sm:px-6">
          <ApplyForm opportunityId={opportunityId} opportunityType="CASTING" closed={false} hideHeading />
        </div>
      )}
    </div>
  );
}
