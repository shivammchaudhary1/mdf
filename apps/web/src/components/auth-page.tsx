import Link from "next/link";

import { AccountForm } from "@/components/account-form";
import { BrandLogo } from "@/components/brand-logo";
import { GuestOnly } from "@/components/guest-only";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

export function AuthPage({ mode }: { mode: AuthMode }) {
  const content = websiteData.auth.pages[mode];

  return (
    <GuestOnly>
      <main id="main-content" className="auth-shell">
        <section className="auth-visual">
          <SiteMedia
            src={content.image}
            alt={content.imageAlt}
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

            <p>{websiteData.auth.mobileTagline}</p>
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
                  <span>{content.bottomPrompt}</span> <Link href="/signup">{content.bottomLinkLabel}</Link>
                </>
              )}

              {mode === "signup" && (
                <>
                  <span>{content.bottomPrompt}</span> <Link href="/login">{content.bottomLinkLabel}</Link>
                </>
              )}

              {mode === "forgot-password" && (
                <>
                  <span>{content.bottomPrompt}</span> <Link href="/login">{content.bottomLinkLabel}</Link>
                </>
              )}

              {mode === "reset-password" && (
                <>
                  <span>{content.bottomPrompt}</span> <Link href="/login">{content.bottomLinkLabel}</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </GuestOnly>
  );
}
