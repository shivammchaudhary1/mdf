"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { runtimeConfig } from "@/config/runtime";
import { api, type CurrentUser } from "@/services/api";
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

type SignupData = {
  name: string;
  mobile: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
};

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

            const form = host.current?.closest("form");
            const formData = form ? new FormData(form) : null;
            const extra: SignupData | undefined =
              mode === "signup"
                ? {
                    name: String(formData?.get("name") ?? ""),
                    mobile: String(formData?.get("mobile") ?? ""),
                    acceptTerms: formData?.get("acceptTerms") === "on",
                    acceptPrivacy: formData?.get("acceptPrivacy") === "on",
                  }
                : undefined;

            if (mode === "signup") {
              if (!extra?.name.trim()) {
                toast.error("Enter your full name before continuing with Google.");
                return;
              }

              if (!/^\+?[\d\s()-]{7,20}$/.test(extra.mobile.trim())) {
                toast.error("Enter a valid mobile number before continuing with Google.");
                return;
              }

              if (!extra.acceptTerms || !extra.acceptPrivacy) {
                toast.error("Accept the Terms & Conditions and acknowledge the Privacy Policy first.");
                return;
              }
            }

            busyRef.current = true;
            setBusy(true);

            void api<CurrentUser>("/auth/google", {
              method: "POST",
              body: JSON.stringify({
                credential,
                remember: true,
                ...(extra
                  ? {
                      name: extra.name.trim(),
                      mobile: extra.mobile.trim(),
                      acceptTerms: extra.acceptTerms,
                      acceptPrivacy: extra.acceptPrivacy,
                    }
                  : {}),
              }),
            })
              .then(async (user) => {
                await establishSession(user);
                toast.success(mode === "signup" ? "Account ready." : "Signed in with Google.");
                router.replace(user.role === "SUPER_ADMIN" ? "/admin" : "/member");
              })
              .catch((error) => {
                const message = error instanceof Error ? error.message : "Google sign-in failed.";
                if (mode === "login" && /mobile number is required|accept the terms/i.test(message)) {
                  toast.error("New Google users should use Create Account once to add mobile number and accept the policies.");
                } else {
                  toast.error(message);
                }
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
