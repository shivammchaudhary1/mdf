import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { CastingSchema } from "../castings/casting.model";
import { MediaModule } from "../media/media.module";
import { ProjectSchema } from "../projects/project.model";
import { AdminApplicationController, MemberApplicationController } from "./application.controller";
import { ApplicationSchema } from "./application.model";
import { ApplicationService } from "./application.service";
@Module({
  imports: [
    AuthModule,
    MediaModule,
    MongooseModule.forFeature([
      { name: "Application", schema: ApplicationSchema },
      { name: "Project", schema: ProjectSchema },
      { name: "Casting", schema: CastingSchema },
    ]),
  ],
  controllers: [MemberApplicationController, AdminApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService, MongooseModule],
})
export class ApplicationModule {}
