import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AdminGuard, SessionGuard } from "./auth.guard";
import { AccountSchema, ResetSchema, SessionSchema } from "./auth.models";
import { AuthService } from "./auth.service";
@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: "Account", schema: AccountSchema },
      { name: "Session", schema: SessionSchema },
      { name: "PasswordReset", schema: ResetSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, AdminGuard],
  exports: [AuthService, SessionGuard, AdminGuard, MongooseModule],
})
export class AuthModule {}
