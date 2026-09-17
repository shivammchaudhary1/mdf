import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountSchema, SessionSchema, ResetSchema } from "./auth.models";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionGuard, AdminGuard } from "./auth.guard";
import { MailService } from "../mail/mail.service";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Account", schema: AccountSchema },
      { name: "Session", schema: SessionSchema },
      { name: "PasswordReset", schema: ResetSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, AdminGuard, MailService],
  exports: [AuthService, SessionGuard, AdminGuard, MongooseModule, MailService],
})
export class AuthModule {}
