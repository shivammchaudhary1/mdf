import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { CreateListDto, ListMemberDto, TalentListQueryDto, TalentQueryDto, UpdateListDto, UserUpdateDto } from "./talent.dto";
import { TalentService } from "./talent.service";
@ApiTags("talent network")
@Controller("talent")
export class PublicTalentController {
  constructor(private readonly talent: TalentService) {}
  @Get() list(@Query() q: TalentQueryDto) {
    return this.talent.listPublic(q);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.talent.publicDetail(id);
  }
}
@ApiTags("super admin talent")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin")
export class AdminTalentController {
  constructor(private readonly talent: TalentService) {}
  @Get("users") users(@Query() q: TalentQueryDto) {
    return this.talent.listAdmin(q);
  }
  @Get("users/:id") user(@Param("id") id: string) {
    return this.talent.adminDetail(id);
  }
  @Patch("users/:id") updateUser(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: UserUpdateDto) {
    return this.talent.updateUser(id, i, r.user.id);
  }
  @Get("lists") lists(@Req() r: AuthRequest, @Query() q: TalentListQueryDto) {
    return this.talent.listSavedLists(r.user.id, q);
  }
  @Get("lists/:id") listDetail(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.talent.listDetail(r.user.id, id);
  }
  @Post("lists") createList(@Req() r: AuthRequest, @Body() i: CreateListDto) {
    return this.talent.createList(r.user.id, i);
  }
  @Put("lists/:id") updateList(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: UpdateListDto) {
    return this.talent.updateList(r.user.id, id, i);
  }
  @Post("lists/:id/members") addMember(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: ListMemberDto) {
    return this.talent.addMember(r.user.id, id, i.memberId);
  }
  @Delete("lists/:id/members/:memberId") removeMember(@Req() r: AuthRequest, @Param("id") id: string, @Param("memberId") memberId: string) {
    return this.talent.removeMember(r.user.id, id, memberId);
  }
  @Delete("lists/:id") deleteList(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.talent.deleteList(r.user.id, id);
  }
}
