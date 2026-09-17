import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { EmailDto, LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
import { AuthRequest, SessionGuard } from "./auth.guard";
@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get("NODE_ENV") === "production",
      sameSite: "lax" as const,
      path: "/api/v1",
    };
  }
  private setSession(
    response: Response,
    session: Awaited<ReturnType<AuthService["login"]>>,
  ) {
    response.cookie("mdadu_session", session.token, {
      ...this.cookieOptions(),
      ...(session.remember ? { maxAge: session.duration } : {}),
    });
    return session.user;
  }
  @Post("register") async register(
    @Body() input: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.setSession(response, await this.auth.register(input));
  }
  @Post("login") async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.setSession(response, await this.auth.login(input));
  }
  @Post("logout") async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie("mdadu_session", this.cookieOptions());
    return this.auth.logout(request.cookies?.mdadu_session);
  }
  @Get("me") @ApiCookieAuth() @UseGuards(SessionGuard) me(
    @Req() request: AuthRequest,
  ) {
    return request.user;
  }
  @Post("forgot-password") forgot(@Body() input: EmailDto) {
    return this.auth.forgot(input);
  }
  @Post("reset-password") reset(@Body() input: ResetPasswordDto) {
    return this.auth.reset(input);
  }
}
