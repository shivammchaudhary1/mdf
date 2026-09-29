import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { LeadController } from "./lead.controller";
import { LeadActivitySchema, LeadSchema } from "./lead.model";
import { LeadService } from "./lead.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: "Lead", schema: LeadSchema },
      { name: "LeadActivity", schema: LeadActivitySchema },
    ]),
  ],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
