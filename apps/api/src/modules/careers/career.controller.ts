import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { CareerQueryDto, CreateCareerApplicationDto, UpdateCareerApplicationDto } from "./career.dto";
import { CareerService } from "./career.service";

@ApiTags("careers")
@Controller("careers")
export class CareerController {
  constructor(private readonly careers: CareerService) {}
  @Post() create(@Body() input: CreateCareerApplicationDto) {
    return this.careers.create(input);
  }
}

@ApiTags("super admin careers")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin/careers")
export class AdminCareerController {
  constructor(private readonly careers: CareerService) {}
  @Get() list(@Query() query: CareerQueryDto) {
    return this.careers.list(query);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.careers.detail(id);
  }
  @Patch(":id") update(@Req() request: AuthRequest, @Param("id") id: string, @Body() input: UpdateCareerApplicationDto) {
    return this.careers.update(id, input, request.user.id);
  }
}
