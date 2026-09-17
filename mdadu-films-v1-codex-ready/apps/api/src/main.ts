import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.use(cookieParser(config.get<string>("COOKIE_SECRET")));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const frontendUrls = (config.get<string>("FRONTEND_URL") ?? "http://localhost:3333")
    .split(",")
    .map((url) => url.trim());

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("M. Dadu Films API")
    .setDescription("REST API for M. Dadu Films Digital Platform V1.0.0")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = Number(config.get<string>("PORT") ?? 8888);
  await app.listen(port);

  console.log(`M. Dadu Films API: http://localhost:${port}/api/v1`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}

void bootstrap();
