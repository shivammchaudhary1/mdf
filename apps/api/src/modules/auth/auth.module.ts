import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AdminGuard, SessionGuard } from "./auth.guard";
import { AccountSchema, ResetSchema, SessionSchema } from "./auth.models";
import { AuthService } from "./auth.service";
import { MemberCodeService } from "./member-code.service";
import { MemberSequenceSchema } from "./member-sequence.model";
@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: "Account", schema: AccountSchema },
      { name: "Session", schema: SessionSchema },
      { name: "PasswordReset", schema: ResetSchema },
      { name: "MemberSequence", schema: MemberSequenceSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MemberCodeService, SessionGuard, AdminGuard],
  exports: [AuthService, MemberCodeService, SessionGuard, AdminGuard, MongooseModule],
})
export class AuthModule {}
