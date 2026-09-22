import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from "./project.dto";
import { ProjectService } from "./project.service";
@ApiTags("projects")
@Controller(["projects", "content/projects"])
export class PublicProjectController {
  constructor(private readonly projects: ProjectService) {}
  @Get() list(@Query() query: ProjectQueryDto) {
    return this.projects.listPublic(query);
  }
  @Get(":slug") detail(@Param("slug") slug: string) {
    return this.projects.bySlug(slug);
  }
}
@ApiTags("super admin projects")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller(["admin/projects", "admin/content/projects"])
export class AdminProjectController {
  constructor(private readonly projects: ProjectService) {}
  @Get() list(@Query() query: ProjectQueryDto) {
    return this.projects.listAdmin(query);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.projects.byId(id);
  }
  @Post() create(@Req() request: AuthRequest, @Body() input: CreateProjectDto) {
    return this.projects.create(input, request.account.id);
  }
  @Patch(":id") update(@Req() request: AuthRequest, @Param("id") id: string, @Body() input: UpdateProjectDto) {
    return this.projects.update(id, input, request.account.id);
  }
  @Delete(":id") archive(@Req() request: AuthRequest, @Param("id") id: string) {
    return this.projects.archive(id, request.account.id);
  }
}
