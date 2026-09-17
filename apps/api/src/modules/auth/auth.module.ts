import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountSchema, SessionSchema, ResetSchema } from "./auth.models";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionGuard, AdminGuard } from "./auth.guard";
import { MailModule } from "../mail/mail.module";
@Module({
  imports: [MailModule, MongooseModule.forFeature([{ name: "Account", schema: AccountSchema }, { name: "Session", schema: SessionSchema }, { name: "PasswordReset", schema: ResetSchema }])],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, AdminGuard],
  exports: [AuthService, SessionGuard, AdminGuard, MongooseModule],
})
export class AuthModule {}
