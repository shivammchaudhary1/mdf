import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RateLimitBucketSchema } from "./rate-limit.model";
import { RateLimitService } from "./rate-limit.service";

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: "RateLimitBucket", schema: RateLimitBucketSchema }])],
  providers: [RateLimitService],
  exports: [RateLimitService, MongooseModule],
})
export class SecurityModule {}
