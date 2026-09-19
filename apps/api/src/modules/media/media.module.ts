import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { MediaController } from "./media.controller";
import { MediaSchema } from "./media.model";
import { MediaService } from "./media.service";
import { LocalStorageAdapter, S3StorageAdapter, StorageAdapter } from "./storage";
@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: "Media", schema: MediaSchema }])],
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: StorageAdapter,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        String(config.get("STORAGE_DRIVER") ?? "local").toLowerCase() === "s3" ? new S3StorageAdapter(config) : new LocalStorageAdapter(),
    },
  ],
  exports: [MediaService, MongooseModule],
})
export class MediaModule {}
