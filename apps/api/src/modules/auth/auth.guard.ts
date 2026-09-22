import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { AuthPrincipal, AuthService } from "./auth.service";
export type AuthRequest = Request & { account: AuthPrincipal };
export function sessionToken(request: Request) {
  const signed = (request as Request & { signedCookies?: Record<string, string | false> }).signedCookies?.mdadu_session;
  return typeof signed === "string" ? signed : undefined;
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    request.account = await this.auth.authenticate(sessionToken(request));
    return true;
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const account = context.switchToHttp().getRequest<AuthRequest>().account;
    if (account.role !== "SUPER_ADMIN") throw new ForbiddenException("Administrator access required.");
    return true;
  }
}
