import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AuditModule } from "./common/audit/audit.module";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { SecurityModule } from "./common/security/security.module";
import { validateEnvironment } from "./config/environment";
import { AdminModule } from "./modules/admin/admin.module";
import { ApplicationModule } from "./modules/applications/application.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CareerModule } from "./modules/careers/career.module";
import { CastingModule } from "./modules/castings/casting.module";
import { ContactModule } from "./modules/contact/contact.module";
import { HealthModule } from "./modules/health/health.module";
import { MailModule } from "./modules/mail/mail.module";
import { MediaModule } from "./modules/media/media.module";
import { PlatformModule } from "./modules/platform/platform.module";
import { ProfileModule } from "./modules/profiles/profile.module";
import { ProjectModule } from "./modules/projects/project.module";
import { TalentModule } from "./modules/talent/talent.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnvironment }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>("MONGODB_URI");
        if (!uri) throw new Error("MONGODB_URI is missing from the selected environment file.");
        return {
          uri,
          appName: "mdadu-films-api",
          maxPoolSize: Number(config.get("MONGODB_MAX_POOL_SIZE") ?? 20),
          minPoolSize: Number(config.get("MONGODB_MIN_POOL_SIZE") ?? 0),
          maxIdleTimeMS: Number(config.get("MONGODB_MAX_IDLE_MS") ?? 60000),
          serverSelectionTimeoutMS: Number(config.get("MONGODB_SERVER_SELECTION_TIMEOUT_MS") ?? 10000),
          socketTimeoutMS: 45000,
          retryWrites: true,
          autoIndex: Boolean(config.get("MONGODB_AUTO_INDEX")),
        };
      },
    }),
    SecurityModule,
    AuditModule,
    MailModule,
    HealthModule,
    AuthModule,
    MediaModule,
    ProjectModule,
    CastingModule,
    CareerModule,
    ApplicationModule,
    ProfileModule,
    TalentModule,
    ContactModule,
    PlatformModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware, SecurityMiddleware).forRoutes("{*path}");
  }
}
