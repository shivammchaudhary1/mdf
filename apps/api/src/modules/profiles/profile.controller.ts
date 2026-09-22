import { Body, Controller, Get, Patch, Put, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { AuthRequest, SessionGuard } from "../auth/auth.guard";
import { MemberSettingsDto, ProfileDto } from "./profile.dto";
import { ProfileService } from "./profile.service";
@ApiTags("member profile")
@ApiCookieAuth()
@UseGuards(SessionGuard)
@Controller("member")
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}
  @Get("profile") profile(@Req() r: AuthRequest) {
    return this.profiles.get(r.account.id);
  }
  @Put("profile") save(@Req() r: AuthRequest, @Body() i: ProfileDto) {
    return this.profiles.save(r.account.id, i);
  }
  @Patch("settings") settings(@Req() r: AuthRequest, @Body() i: MemberSettingsDto) {
    return this.profiles.updateSettings(r.account.id, i);
  }
  @Get("dashboard") dashboard(@Req() r: AuthRequest) {
    return this.profiles.dashboard(r.account.id);
  }
}
