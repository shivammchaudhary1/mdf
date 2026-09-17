import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");
  use(request: Request, response: Response, next: NextFunction) {
    const started = performance.now();
    response.on("finish", () => {
      this.logger.log(
        `${request.method} ${request.path} ${response.statusCode} ${Math.round(performance.now() - started)}ms`,
      );
    });
    next();
  }
}
