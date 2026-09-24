import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { ContentDto, ContentQueryDto, UpdateContentDto } from "./platform.dto";
import { PlatformService } from "./platform.service";
@ApiTags("public content")
@Controller("content")
export class PublicContentController {
  constructor(private readonly service: PlatformService) {}
  @Get(":kind") list(@Param("kind") k: string, @Query() q: ContentQueryDto) {
    return this.service.list(k, q, false);
  }
  @Get(":kind/:slug") detail(@Param("kind") k: string, @Param("slug") slug: string) {
    return this.service.publicItem(k, slug);
  }
}
@ApiTags("super admin content")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin/content")
export class AdminContentController {
  constructor(private readonly service: PlatformService) {}
  @Get(":kind") list(@Param("kind") k: string, @Query() q: ContentQueryDto) {
    return this.service.list(k, q, true);
  }
  @Get("gallery/summary") gallerySummary() {
    return this.service.gallerySummary();
  }
  @Get(":kind/:id") detail(@Param("kind") k: string, @Param("id") id: string) {
    return this.service.adminItem(k, id);
  }
  @Post(":kind") create(@Req() r: AuthRequest, @Param("kind") k: string, @Body() i: ContentDto) {
    return this.service.create(k, i, r.account.id);
  }
  @Patch(":kind/:id") update(@Req() r: AuthRequest, @Param("kind") k: string, @Param("id") id: string, @Body() i: UpdateContentDto) {
    return this.service.update(k, id, i, r.account.id);
  }
  @Delete(":kind/:id") archive(@Req() r: AuthRequest, @Param("kind") k: string, @Param("id") id: string) {
    return this.service.archive(k, id, r.account.id);
  }
}
