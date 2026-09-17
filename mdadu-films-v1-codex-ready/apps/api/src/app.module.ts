import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [AppController],
})
export class AppModule {}
