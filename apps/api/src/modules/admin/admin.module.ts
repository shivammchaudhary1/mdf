import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ApplicationSchema } from "../applications/application.model";
import { AuthModule } from "../auth/auth.module";
import { CastingSchema } from "../castings/casting.model";
import { ContactSchema } from "../contact/contact.model";
import { ProjectSchema } from "../projects/project.model";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: "Project", schema: ProjectSchema },
      { name: "Casting", schema: CastingSchema },
      { name: "Application", schema: ApplicationSchema },
      { name: "Contact", schema: ContactSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
