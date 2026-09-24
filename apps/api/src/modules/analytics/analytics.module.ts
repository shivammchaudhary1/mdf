import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { VisitorSchema } from "./visitor.model";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Visitor", schema: VisitorSchema }])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
