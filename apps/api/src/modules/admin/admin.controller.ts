import { Body, Controller, Get, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { AdminProfileDto } from "./admin.dto";
import { AdminService } from "./admin.service";
class ActivityQueryDto {
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) limit = 30;
}
@ApiTags("super admin")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get("profile") profile(@Req() request: AuthRequest) {
    return this.admin.profile(request.account.id);
  }
  @Patch("profile") updateProfile(@Req() request: AuthRequest, @Body() input: AdminProfileDto) {
    return this.admin.updateProfile(request.account.id, input);
  }
  @Get("metrics") metrics() {
    return this.admin.metrics();
  }
  @Get("activity") activity(@Query() q: ActivityQueryDto) {
    return this.admin.activity(q.limit);
  }
  @Get("dashboard") dashboard() {
    return this.admin.dashboard();
  }
}
