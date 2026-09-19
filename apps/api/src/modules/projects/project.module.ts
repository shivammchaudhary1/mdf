import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { MediaModule } from "../media/media.module";
import { AdminProjectController, PublicProjectController } from "./project.controller";
import { ProjectSchema } from "./project.model";
import { ProjectService } from "./project.service";
@Module({
  imports: [AuthModule, MediaModule, MongooseModule.forFeature([{ name: "Project", schema: ProjectSchema }])],
  controllers: [PublicProjectController, AdminProjectController],
  providers: [ProjectService],
  exports: [ProjectService, MongooseModule],
})
export class ProjectModule {}
