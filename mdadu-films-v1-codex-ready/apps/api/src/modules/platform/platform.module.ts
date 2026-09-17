import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  ApplicationSchema,
  ContentSchema,
  ProfileSchema,
  SavedListSchema,
  ContactSchema,
  MediaSchema,
} from "./platform.models";
import { PlatformService } from "./platform.service";
import {
  PublicContentController,
  MemberController,
  AdminController,
} from "./platform.controller";
import { MediaController } from "../media/media.controller";
import { MediaService } from "../media/media.service";
import { StorageAdapter, LocalStorageAdapter } from "../media/storage";
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: "Content", schema: ContentSchema },
      { name: "Profile", schema: ProfileSchema },
      { name: "Application", schema: ApplicationSchema },
      { name: "SavedList", schema: SavedListSchema },
      { name: "Contact", schema: ContactSchema },
      { name: "Media", schema: MediaSchema },
    ]),
  ],
  controllers: [
    PublicContentController,
    MemberController,
    AdminController,
    MediaController,
  ],
  providers: [
    PlatformService,
    MediaService,
    { provide: StorageAdapter, useClass: LocalStorageAdapter },
  ],
})
export class PlatformModule {}
