import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Request, Response } from "express";
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request & { requestId?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      status >= 500
        ? "An unexpected server error occurred."
        : typeof body === "string"
          ? body
          : body && typeof body === "object" && "message" in body
            ? body.message
            : "Request failed.";
    if (status >= 500) this.logger.error(`${request.requestId ?? "unknown"} ${request.method} ${request.path} failed (${status})`);
    response
      .status(status)
      .json({ statusCode: status, message, path: request.path, requestId: request.requestId, timestamp: new Date().toISOString() });
  }
}
