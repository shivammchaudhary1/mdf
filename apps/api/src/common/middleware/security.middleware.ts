import { ForbiddenException, HttpException, Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NextFunction, Request, Response } from "express";

import { RateLimitService } from "../security/rate-limit.service";
import { safeEqualText } from "../utils/crypto";

type LocalBucket = { count: number; resetAt: number };

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly localBuckets = new Map<string, LocalBucket>();
  private requests = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly rateLimits: RateLimitService,
  ) {}

  private origins() {
    return String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  private route(request: Request) {
    return request.originalUrl.split("?")[0];
  }

  private localLimit(request: Request, response: Response) {
    const now = Date.now();
    const limit = Math.max(60, Number(this.config.get("GENERAL_RATE_LIMIT_PER_MINUTE") ?? 300));
    const key = request.ip || request.socket.remoteAddress || "unknown";
    const current = this.localBuckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + 60000 } : current;

    bucket.count += 1;
    this.localBuckets.set(key, bucket);

    response.setHeader("RateLimit-Limit", limit);
    response.setHeader("RateLimit-Remaining", Math.max(0, limit - bucket.count));
    response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > limit) {
      response.setHeader("Retry-After", Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
      throw new HttpException("Too many requests. Please try again later.", 429);
    }

    this.requests += 1;

    if (this.requests % 1000 === 0) {
      for (const [k, v] of this.localBuckets) {
        if (v.resetAt <= now) this.localBuckets.delete(k);
      }

      if (this.localBuckets.size > 50000) this.localBuckets.clear();
    }
  }

  private async persistentLimit(request: Request, response: Response) {
    if (request.method !== "POST") return;

    const route = this.route(request);
    const rules = [
      { match: "/auth/login", scope: "auth-login-ip", limit: 12, windowMs: 900000 },
      { match: "/auth/google", scope: "auth-google-ip", limit: 12, windowMs: 900000 },
      { match: "/auth/register", scope: "auth-register-ip", limit: 10, windowMs: 3600000 },
      { match: "/auth/verify-email", scope: "auth-verify-ip", limit: 30, windowMs: 3600000 },
      { match: "/auth/resend-verification", scope: "auth-resend-verify-ip", limit: 8, windowMs: 3600000 },
      { match: "/auth/forgot-password", scope: "auth-forgot-ip", limit: 8, windowMs: 3600000 },
      { match: "/auth/reset-password", scope: "auth-reset-ip", limit: 12, windowMs: 3600000 },
      { match: "/contact", scope: "contact-ip", limit: 10, windowMs: 3600000 },
      { match: "/careers", scope: "career-application-ip", limit: 8, windowMs: 3600000 },
      { match: "/media", scope: "media-upload-ip", limit: 40, windowMs: 3600000 },
      { match: "/analytics/visit", scope: "analytics-visit-ip", limit: 240, windowMs: 3600000 },
    ];

    const rule = rules.find((x) => route.endsWith(x.match));
    if (!rule) return;

    try {
      const result = await this.rateLimits.consume(
        rule.scope,
        request.ip || request.socket.remoteAddress || "unknown",
        rule.limit,
        rule.windowMs,
      );

      response.setHeader("RateLimit-Limit", result.limit);
      response.setHeader("RateLimit-Remaining", result.remaining);
      response.setHeader("RateLimit-Reset", Math.ceil(result.resetAt.getTime() / 1000));
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 429) {
        const retry = (error as HttpException & { retryAfter?: number }).retryAfter;
        if (retry) response.setHeader("Retry-After", retry);
      }

      throw error;
    }
  }

  private enforceOrigin(request: Request) {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;

    const origin = request.headers.origin;

    if (origin && !this.origins().includes(origin)) {
      throw new ForbiddenException("Request origin is not allowed.");
    }

    if (request.headers["sec-fetch-site"] === "cross-site") {
      throw new ForbiddenException("Cross-site request is not allowed.");
    }
  }

  private enforceCsrf(request: Request) {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;

    const route = this.route(request);
    const exempt = [
      "/auth/login",
      "/auth/google",
      "/auth/register",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/contact",
      "/analytics/visit",
    ].some((value) => route.endsWith(value));

    if (exempt) return;

    const signed = (request as Request & { signedCookies?: Record<string, string | false> }).signedCookies;
    const hasSession = typeof signed?.mdadu_session === "string";

    if (!hasSession) return;

    const cookieToken = request.cookies?.mdadu_csrf;
    const header = request.headers["x-csrf-token"];
    const headerToken = Array.isArray(header) ? header[0] : header;

    if (!safeEqualText(cookieToken, headerToken)) {
      throw new ForbiddenException("Security token is missing or invalid. Refresh and try again.");
    }
  }

  async use(request: Request, response: Response, next: NextFunction) {
    this.localLimit(request, response);
    await this.persistentLimit(request, response);
    this.enforceOrigin(request);
    this.enforceCsrf(request);

    if (this.route(request).includes("/auth/")) {
      response.setHeader("Cache-Control", "no-store");
    }

    next();
  }
}
