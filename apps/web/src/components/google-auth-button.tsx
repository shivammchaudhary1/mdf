"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { runtimeConfig } from "@/config/runtime";
import { api, type CurrentAccount } from "@/services/api";
import { establishSession } from "@/services/auth-session";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdApi = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard";
      theme?: "outline";
      size?: "large";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular";
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdApi;
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentity() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in is only available in the browser."));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(script);
  }).finally(() => {
    if (!window.google?.accounts?.id) googleScriptPromise = null;
  });

  return googleScriptPromise;
}

export function GoogleAuthButton({ mode }: { mode: "login" | "signup" }) {
  const toast = useToast();
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const clientId = runtimeConfig.googleClientId;

  useEffect(() => {
    let active = true;

    if (!clientId || !host.current) {
      setReady(false);
      return;
    }

    void loadGoogleIdentity()
      .then(() => {
        if (!active || !host.current || !window.google?.accounts?.id) return;

        const parent = host.current;
        parent.replaceChildren();

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            const credential = response.credential;
            if (!credential || busyRef.current) return;

            busyRef.current = true;
            setBusy(true);

            void api<CurrentAccount>("/auth/google", {
              method: "POST",
              body: JSON.stringify({
                credential,
                remember: true,
              }),
            })
              .then(async (account) => {
                await establishSession(account);
                toast.success(mode === "signup" ? "Account ready." : "Signed in with Google.");
                router.replace(account.role === "SUPER_ADMIN" ? "/admin" : "/member");
              })
              .catch((error) => {
                const message = error instanceof Error ? error.message : "Google sign-in failed.";
                toast.error(message);
              })
              .finally(() => {
                busyRef.current = false;
                setBusy(false);
              });
          },
        });

        window.google.accounts.id.renderButton(parent, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          width: Math.max(240, Math.min(400, parent.clientWidth || 360)),
        });

        setReady(true);
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Google sign-in could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, [clientId, mode, router, toast]);

  if (!clientId) {
    return (
      <button type="button" className="auth-google-button" disabled title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.">
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <div ref={host} className={`min-h-11 w-full overflow-hidden ${busy ? "pointer-events-none opacity-60" : ""}`} aria-busy={busy} />
      {!ready && <p className="text-center text-xs text-[#777]">Loading Google sign-in…</p>}
    </div>
  );
}
