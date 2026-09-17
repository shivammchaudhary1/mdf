import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { randomToken } from "../../common/utils/crypto";
import { AuthService } from "./auth.service";
import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
import { AuthRequest, SessionGuard, sessionToken } from "./auth.guard";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}
  private requestContext(request: Request) { return { ip: request.ip, userAgent: request.get("user-agent") ?? undefined }; }
  private cookieDomain() { const value = this.config.get<string>("COOKIE_DOMAIN")?.trim(); return value || undefined; }
  private sessionCookieOptions() {
    return { httpOnly: true, secure: this.config.get("NODE_ENV") === "production", sameSite: "lax" as const, path: "/api/v1", signed: true, ...(this.cookieDomain() ? { domain: this.cookieDomain() } : {}) };
  }
  private csrfCookieOptions() {
    return { httpOnly: true, secure: this.config.get("NODE_ENV") === "production", sameSite: "lax" as const, path: "/", ...(this.cookieDomain() ? { domain: this.cookieDomain() } : {}) };
  }
  private issueCsrf(response: Response) { const csrfToken = randomToken(24); response.cookie("mdadu_csrf", csrfToken, this.csrfCookieOptions()); return csrfToken; }
  private setSession(response: Response, session: Awaited<ReturnType<AuthService["login"]>>) {
    response.cookie("mdadu_session", session.token, { ...this.sessionCookieOptions(), ...(session.remember ? { maxAge: session.duration } : {}) });
    const csrfToken = this.issueCsrf(response);
    return { ...session.user, csrfToken };
  }
  private clearCookies(response: Response) { response.clearCookie("mdadu_session", this.sessionCookieOptions()); response.clearCookie("mdadu_csrf", this.csrfCookieOptions()); }

  @Post("register") async register(@Req() request: Request, @Body() input: RegisterDto, @Res({ passthrough: true }) response: Response) { return this.setSession(response, await this.auth.register(input, this.requestContext(request))); }
  @Post("login") async login(@Req() request: Request, @Body() input: LoginDto, @Res({ passthrough: true }) response: Response) { return this.setSession(response, await this.auth.login(input, this.requestContext(request))); }
  @Post("google") async google(@Req() request: Request, @Body() input: GoogleAuthDto, @Res({ passthrough: true }) response: Response) { return this.setSession(response, await this.auth.googleLogin(input, this.requestContext(request))); }
  @Post("logout") async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) { this.clearCookies(response); return this.auth.logout(sessionToken(request)); }
  @Post("logout-all") @ApiCookieAuth() @UseGuards(SessionGuard) async logoutAll(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) { this.clearCookies(response); return this.auth.logoutAll(request.user.id); }
  @Get("me") @ApiCookieAuth() @UseGuards(SessionGuard) me(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) { return { ...this.auth.publicPrincipal(request.user), csrfToken: this.issueCsrf(response) }; }
  @Get("csrf") @ApiCookieAuth() @UseGuards(SessionGuard) csrf(@Res({ passthrough: true }) response: Response) { return { csrfToken: this.issueCsrf(response) }; }
  @Get("sessions") @ApiCookieAuth() @UseGuards(SessionGuard) sessions(@Req() request: AuthRequest) { return this.auth.listSessions(request.user.id, request.user.sessionId); }
  @Delete("sessions/:id") @ApiCookieAuth() @UseGuards(SessionGuard) async revokeSession(@Req() request: AuthRequest, @Param("id") id: string, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.revokeSession(request.user.id, id, request.user.sessionId);
    if (result.currentSessionRevoked) this.clearCookies(response);
    return result;
  }
  @Post("forgot-password") forgot(@Body() input: EmailDto) { return this.auth.forgot(input); }
  @Patch("account") @ApiCookieAuth() @UseGuards(SessionGuard) updateAccount(@Req() request: AuthRequest, @Body() input: AccountSettingsDto) { return this.auth.updateAccount(request.user, input); }
  @Post("deactivate") @ApiCookieAuth() @UseGuards(SessionGuard) async deactivate(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) { const result = await this.auth.deactivate(request.user.id); this.clearCookies(response); return result; }
  @Post("reset-password") reset(@Body() input: ResetPasswordDto) { return this.auth.reset(input); }
}
