import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { AdminCareerController, CareerController } from "./career.controller";
import { CareerApplicationSchema } from "./career.model";
import { CareerService } from "./career.service";

@Module({
  imports:[AuthModule,MongooseModule.forFeature([{name:"CareerApplication",schema:CareerApplicationSchema}])],
  controllers:[CareerController,AdminCareerController],
  providers:[CareerService],
})
export class CareerModule {}
