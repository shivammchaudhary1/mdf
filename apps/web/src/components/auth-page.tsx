import Link from "next/link";

import { AccountForm } from "@/components/account-form";
import { BrandLogo } from "@/components/brand-logo";
import { GuestOnly } from "@/components/guest-only";
import { SiteMedia } from "@/components/site/site-media";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

const copy: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    visualTitle: string;
    visualFooter: string;
  }
> = {
  login: {
    eyebrow: "Member Access",
    title: "Welcome Back",
    description: "Sign in to continue your creative journey with M. Dadu Films.",
    visualTitle: "Good People.\nGreat Stories.",
    visualFooter: "Stories that move people.",
  },

  signup: {
    eyebrow: "Join The Community",
    title: "Create Your Account",
    description: "Join M. Dadu Films and be part of a community that brings powerful stories to life.",
    visualTitle: "Creative\nPeople.\nBrighter\nTomorrows.",
    visualFooter: "Good People. Great Stories.",
  },

  "forgot-password": {
    eyebrow: "Account Recovery",
    title: "Forgot Password?",
    description: "Enter your account email and we’ll help you continue your journey.",
    visualTitle: "Every Story\nFinds Its Way\nBack.",
    visualFooter: "Good People. Great Stories.",
  },

  "reset-password": {
    eyebrow: "Secure Your Account",
    title: "Create New Password",
    description: "Choose a secure password to regain access to your creative profile.",
    visualTitle: "Back To\nCreating.",
    visualFooter: "Good People. Great Stories.",
  },
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const content = copy[mode];

  return (
    <GuestOnly>
      <main id="main-content" className="auth-shell">
        <section className="auth-visual">
          <SiteMedia
            alt="M. Dadu Films cinematic studio placeholder"
            kind="project"
            className="auth-visual-media"
            imageClassName="auth-visual-image"
            priority
          />

          <div className="auth-visual-overlay" />

          <div className="auth-visual-top">
            <Link href="/" aria-label="M. Dadu Films home">
              <BrandLogo className="auth-visual-logo" />
            </Link>
          </div>

          <div className="auth-visual-content">
            <div className="auth-rule" />

            <p className="auth-visual-title">
              {content.visualTitle.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>

          <div className="auth-visual-footer">
            <div className="auth-rule auth-rule-small" />

            <p>
              {content.visualFooter.split(". ").map((part, index, array) => (
                <span key={`${part}-${index}`}>
                  {part}
                  {index < array.length - 1 ? "." : ""}
                  {index < array.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-mobile-brand">
            <Link href="/" aria-label="M. Dadu Films home">
              <BrandLogo darkInk className="auth-mobile-logo" />
            </Link>

            <p>Good People. Great Stories.</p>
          </div>

          <div className="auth-form-card">
            <div className="auth-heading">
              <p className="auth-kicker">{content.eyebrow}</p>

              <h1>{content.title}</h1>

              <p>{content.description}</p>
            </div>

            <AccountForm mode={mode} />

            <div className="auth-bottom-link">
              {mode === "login" && (
                <>
                  <span>Don&apos;t have an account?</span> <Link href="/signup">Create one</Link>
                </>
              )}

              {mode === "signup" && (
                <>
                  <span>Already have an account?</span> <Link href="/login">Sign in</Link>
                </>
              )}

              {mode === "forgot-password" && (
                <>
                  <span>Remember your password?</span> <Link href="/login">Back to sign in</Link>
                </>
              )}

              {mode === "reset-password" && (
                <>
                  <span>Ready to continue?</span> <Link href="/login">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </GuestOnly>
  );
}
