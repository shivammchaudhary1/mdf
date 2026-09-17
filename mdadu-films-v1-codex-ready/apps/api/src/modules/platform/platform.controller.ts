import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard, AuthRequest, SessionGuard } from "../auth/auth.guard";
import { PlatformService } from "./platform.service";
import {
  ApplicationDto,
  ApplicationUpdateDto,
  ContentDto,
  ProfileDto,
  ListDto,
  UserUpdateDto,
  ContactDto,
} from "./platform.dto";
@ApiTags("public content")
@Controller()
export class PublicContentController {
  constructor(private readonly service: PlatformService) {}
  @Get("content/:kind") list(@Param("kind") kind: string) {
    return this.service.listContent(kind);
  }
  @Get("content/:kind/:slug") detail(
    @Param("kind") kind: string,
    @Param("slug") slug: string,
  ) {
    return this.service.contentItem(kind, slug);
  }
  @Post("contact") contact(@Body() input: ContactDto) {
    return this.service.contact(input);
  }
}
@ApiTags("members")
@ApiCookieAuth()
@UseGuards(SessionGuard)
@Controller("member")
export class MemberController {
  constructor(private readonly service: PlatformService) {}
  @Get("profile") profile(@Req() request: AuthRequest) {
    return this.service.profile(request.user.id);
  }
  @Put("profile") saveProfile(
    @Req() request: AuthRequest,
    @Body() input: ProfileDto,
  ) {
    return this.service.saveProfile(request.user.id, input);
  }
  @Get("applications") applications(@Req() request: AuthRequest) {
    return this.service.myApplications(request.user.id);
  }
  @Post("applications") apply(
    @Req() request: AuthRequest,
    @Body() input: ApplicationDto,
  ) {
    return this.service.apply(request.user.id, input);
  }
}
@ApiTags("super admin")
@ApiCookieAuth()
@UseGuards(SessionGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly service: PlatformService) {}
  @Get("metrics") metrics() {
    return this.service.metrics();
  }
  @Get("users") users(@Query() query: Record<string, string>) {
    return this.service.users(query);
  }
  @Patch("users/:id") updateUser(
    @Req() request: AuthRequest,
    @Param("id") id: string,
    @Body() input: UserUpdateDto,
  ) {
    return this.service.updateUser(id, input, request.user.id);
  }
  @Get("content/:kind") content(@Param("kind") kind: string) {
    return this.service.listContent(kind, true);
  }
  @Post("content/:kind") create(
    @Req() request: AuthRequest,
    @Param("kind") kind: string,
    @Body() input: ContentDto,
  ) {
    return this.service.saveContent(kind, input, request.user.id);
  }
  @Put("content/:kind/:id") update(
    @Req() request: AuthRequest,
    @Param("kind") kind: string,
    @Param("id") id: string,
    @Body() input: ContentDto,
  ) {
    return this.service.saveContent(kind, input, request.user.id, id);
  }
  @Delete("content/:kind/:id") archive(
    @Param("kind") kind: string,
    @Param("id") id: string,
  ) {
    return this.service.archiveContent(kind, id);
  }
  @Get("applications") applications(
    @Query("status") status?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.service.adminApplications(status, projectId);
  }
  @Patch("applications/:id") updateApplication(
    @Param("id") id: string,
    @Body() input: ApplicationUpdateDto,
  ) {
    return this.service.updateApplication(id, input);
  }
  @Get("lists") lists(@Req() request: AuthRequest) {
    return this.service.lists.find({ ownerId: request.user.id }).lean();
  }
  @Post("lists") createList(
    @Req() request: AuthRequest,
    @Body() input: ListDto,
  ) {
    return this.service.saveList(request.user.id, input);
  }
  @Put("lists/:id") updateList(
    @Req() request: AuthRequest,
    @Param("id") id: string,
    @Body() input: ListDto,
  ) {
    return this.service.saveList(request.user.id, input, id);
  }
  @Delete("lists/:id") deleteList(
    @Req() request: AuthRequest,
    @Param("id") id: string,
  ) {
    return this.service.deleteList(request.user.id, id);
  }
  @Get("contacts") contacts() {
    return this.service.contacts.find().sort({ _id: -1 }).limit(500).lean();
  }
}
