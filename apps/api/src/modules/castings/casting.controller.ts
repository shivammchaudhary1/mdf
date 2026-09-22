import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { CastingQueryDto, CreateCastingDto, UpdateCastingDto } from "./casting.dto";
import { CastingService } from "./casting.service";
@ApiTags("casting")
@Controller(["castings", "content/casting"])
export class PublicCastingController {
  constructor(private readonly castings: CastingService) {}
  @Get() list(@Query() q: CastingQueryDto) {
    return this.castings.listPublic(q);
  }
  @Get(":slug") detail(@Param("slug") slug: string) {
    return this.castings.bySlug(slug);
  }
}
@ApiTags("super admin casting")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller(["admin/castings", "admin/content/casting"])
export class AdminCastingController {
  constructor(private readonly castings: CastingService) {}
  @Get() list(@Query() q: CastingQueryDto) {
    return this.castings.listAdmin(q);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.castings.byId(id);
  }
  @Post() create(@Req() r: AuthRequest, @Body() i: CreateCastingDto) {
    return this.castings.create(i, r.account.id);
  }
  @Patch(":id") update(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: UpdateCastingDto) {
    return this.castings.update(id, i, r.account.id);
  }
  @Patch(":id/close") close(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.castings.close(id, r.account.id);
  }
  @Delete(":id") archive(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.castings.archive(id, r.account.id);
  }
}
