import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
export type AuthUser = Awaited<ReturnType<AuthService["authenticate"]>>;
export type AuthRequest = Request & { user: AuthUser };
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    request.user = await this.auth.authenticate(request.cookies?.mdadu_session);
    return true;
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (
      context.switchToHttp().getRequest<AuthRequest>().user.role !==
      "SUPER_ADMIN"
    )
      throw new ForbiddenException("Administrator access required.");
    return true;
  }
}
