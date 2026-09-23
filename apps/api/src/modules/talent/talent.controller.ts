import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import {
  CreateListDto,
  ListMemberDto,
  MemberUpdateDto,
  PublicProfileViewDto,
  TalentListQueryDto,
  TalentQueryDto,
  UpdateListDto,
} from "./talent.dto";
import { TalentService } from "./talent.service";
@ApiTags("talent network")
@Controller("talent")
export class PublicTalentController {
  constructor(private readonly talent: TalentService) {}
  @Get() list(@Query() q: TalentQueryDto) {
    return this.talent.listPublic(q);
  }
  @Get("options") options() {
    return this.talent.publicOptions();
  }
  @Get(":id/view") view(@Param("id") id: string, @Query() q: PublicProfileViewDto) {
    return this.talent.recordPublicView(id, q.visitorKey);
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
  @Get("members") members(@Query() q: TalentQueryDto) {
    return this.talent.listAdmin(q);
  }
  @Get("members/:id") member(@Param("id") id: string) {
    return this.talent.adminDetail(id);
  }
  @Patch("members/:id") updateMember(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: MemberUpdateDto) {
    return this.talent.updateMember(id, i, r.account.id);
  }
  @Get("lists") lists(@Req() r: AuthRequest, @Query() q: TalentListQueryDto) {
    return this.talent.listSavedLists(r.account.id, q);
  }
  @Get("lists/summary") listSummary(@Req() r: AuthRequest) {
    return this.talent.savedListSummary(r.account.id);
  }
  @Get("lists/:id") listDetail(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.talent.listDetail(r.account.id, id);
  }
  @Post("lists") createList(@Req() r: AuthRequest, @Body() i: CreateListDto) {
    return this.talent.createList(r.account.id, i);
  }
  @Put("lists/:id") updateList(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: UpdateListDto) {
    return this.talent.updateList(r.account.id, id, i);
  }
  @Post("lists/:id/members") addMember(@Req() r: AuthRequest, @Param("id") id: string, @Body() i: ListMemberDto) {
    return this.talent.addMember(r.account.id, id, i.memberId);
  }
  @Delete("lists/:id/members/:memberId") removeMember(@Req() r: AuthRequest, @Param("id") id: string, @Param("memberId") memberId: string) {
    return this.talent.removeMember(r.account.id, id, memberId);
  }
  @Delete("lists/:id") deleteList(@Req() r: AuthRequest, @Param("id") id: string) {
    return this.talent.deleteList(r.account.id, id);
  }
}
