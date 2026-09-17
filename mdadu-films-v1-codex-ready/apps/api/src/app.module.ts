import { PlatformModule } from "./modules/platform/platform.module";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { validateEnvironment } from "./config/environment";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>("MONGODB_URI");

        if (!uri) {
          throw new Error(
            "MONGODB_URI is missing. Copy apps/api/.env.example to apps/api/.env.",
          );
        }

        return { uri };
      },
    }),
    HealthModule,
    AuthModule,
    PlatformModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, SecurityMiddleware)
      .forRoutes("{*path}");
  }
}
