import {
  ForbiddenException,
  HttpException,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response, NextFunction } from "express";
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly buckets = new Map<
    string,
    { count: number; until: number }
  >();
  constructor(private readonly config: ConfigService) {}
  use(request: Request, response: Response, next: NextFunction) {
    const now = Date.now();
    for (const [key, bucket] of this.buckets)
      if (bucket.until <= now) this.buckets.delete(key);
    const sensitive =
      request.path.includes("/auth/") && request.method === "POST";
    const key = `${request.ip}:${sensitive ? "auth" : "general"}`;
    const bucket = this.buckets.get(key) ?? {
      count: 0,
      until: now + (sensitive ? 900000 : 60000),
    };
    if (++bucket.count > (sensitive ? 30 : 300)) {
      response.setHeader("Retry-After", Math.ceil((bucket.until - now) / 1000));
      throw new HttpException(
        "Too many requests. Please try again later.",
        429,
      );
    }
    this.buckets.set(key, bucket);
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const origins = String(
        this.config.get("FRONTEND_URL") ?? "http://localhost:3333",
      )
        .split(",")
        .map((value) => value.trim());
      if (
        (request.headers.origin && !origins.includes(request.headers.origin)) ||
        request.headers["sec-fetch-site"] === "cross-site"
      )
        throw new ForbiddenException("Request origin is not allowed.");
    }
    next();
  }
}
