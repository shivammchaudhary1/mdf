import { Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";

import { randomToken } from "../../common/utils/crypto";
import { AnalyticsService } from "./analytics.service";

type SignedCookieRequest = Request & {
  signedCookies?: Record<string, string | false>;
};

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions() {
    const domain = this.config.get<string>("COOKIE_DOMAIN")?.trim();

    return {
      httpOnly: true,
      secure: this.config.get("NODE_ENV") === "production",
      sameSite: "lax" as const,
      signed: true,
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
      ...(domain ? { domain } : {}),
    };
  }

  @Post("visit")
  @HttpCode(200)
  @ApiOperation({ summary: "Record one anonymous browser visitor" })
  visit(@Req() request: SignedCookieRequest, @Res({ passthrough: true }) response: Response) {
    const existing = request.signedCookies?.mdadu_visitor;
    const token = typeof existing === "string" ? existing : randomToken(24);

    if (typeof existing !== "string") {
      response.cookie("mdadu_visitor", token, this.cookieOptions());
    }

    return this.analytics.recordVisitor(token);
  }
}
