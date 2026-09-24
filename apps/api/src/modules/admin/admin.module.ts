import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AnalyticsModule } from "../analytics/analytics.module";
import { ApplicationSchema } from "../applications/application.model";
import { AuthModule } from "../auth/auth.module";
import { CastingSchema } from "../castings/casting.model";
import { ContactSchema } from "../contact/contact.model";
import { ContentSchema } from "../platform/platform.models";
import { ProjectSchema } from "../projects/project.model";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [
    AuthModule,
    AnalyticsModule,
    MongooseModule.forFeature([
      { name: "Project", schema: ProjectSchema },
      { name: "Casting", schema: CastingSchema },
      { name: "Application", schema: ApplicationSchema },
      { name: "Contact", schema: ContactSchema },
      { name: "Content", schema: ContentSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
