import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import {
  AdminApplicationQueryDto,
  CreateApplicationDto,
  MemberApplicationQueryDto,
  OpportunityQueryDto,
  UpdateApplicationDto,
} from "./application.dto";
import { ApplicationService } from "./application.service";
@ApiTags("member applications")
@ApiCookieAuth()
@UseGuards(SessionGuard)
@Controller("member")
export class MemberApplicationController {
  constructor(private readonly applications: ApplicationService) {}
  @Get("opportunities") opportunities(@Query() q: OpportunityQueryDto) {
    return this.applications.opportunities(q);
  }
  @Get("applications") list(@Req() r: AuthRequest, @Query() q: MemberApplicationQueryDto) {
    return this.applications.mine(r.user.id, q);
  }
  @Get("applications/:id") detail(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.applications.mineById(r.user.id, id);
  }
  @Post("applications") apply(@Req() r: AuthRequest, @Body() i: CreateApplicationDto) {
    return this.applications.apply(r.user.id, i);
  }
}
@ApiTags("super admin applications")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin/applications")
export class AdminApplicationController {
  constructor(private readonly applications: ApplicationService) {}
  @Get() list(@Query() q: AdminApplicationQueryDto) {
    return this.applications.adminList(q);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.applications.adminById(id);
  }
  @Patch(":id") update(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: UpdateApplicationDto) {
    return this.applications.update(id, i, r.user.id);
  }
}
