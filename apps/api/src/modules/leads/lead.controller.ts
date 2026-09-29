import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { CreateLeadDto, LeadActivityDto, LeadActivityQueryDto, LeadDuplicateQueryDto, LeadQueryDto, UpdateLeadDto } from "./lead.dto";
import { LeadService } from "./lead.service";

@ApiTags("super admin leads")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin/leads")
export class LeadController {
  constructor(private readonly leads: LeadService) {}

  @Get()
  list(@Query() query: LeadQueryDto) {
    return this.leads.list(query);
  }

  @Get("summary")
  summary() {
    return this.leads.summary();
  }

  @Get("options")
  options() {
    return this.leads.options();
  }

  @Get("duplicates")
  duplicates(@Query() query: LeadDuplicateQueryDto) {
    return this.leads.duplicates(query);
  }

  @Post()
  create(@Req() request: AuthRequest, @Body() input: CreateLeadDto) {
    return this.leads.create(input, request.account.id);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.leads.detail(id);
  }

  @Patch(":id")
  update(@Req() request: AuthRequest, @Param("id") id: string, @Body() input: UpdateLeadDto) {
    return this.leads.update(id, input, request.account.id);
  }

  @Get(":id/activities")
  activities(@Param("id") id: string, @Query() query: LeadActivityQueryDto) {
    return this.leads.activitiesForLead(id, query);
  }

  @Post(":id/activities")
  addActivity(@Req() request: AuthRequest, @Param("id") id: string, @Body() input: LeadActivityDto) {
    return this.leads.addActivity(id, input, request.account.id);
  }

  @Delete(":id")
  archive(@Req() request: AuthRequest, @Param("id") id: string) {
    return this.leads.archive(id, request.account.id);
  }

  @Post(":id/restore")
  restore(@Req() request: AuthRequest, @Param("id") id: string) {
    return this.leads.restore(id, request.account.id);
  }
}
