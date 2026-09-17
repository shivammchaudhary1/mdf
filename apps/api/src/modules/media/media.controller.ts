import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthRequest, SessionGuard } from "../auth/auth.guard";
import { MediaService, Upload } from "./media.service";
@ApiTags("media")
@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}
  @Post()
  @ApiCookieAuth()
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  upload(@Req() request: AuthRequest, @UploadedFile() file?: Upload) {
    return this.service.upload(request.user.id, file);
  }
  @Get(":id/:variant") async read(
    @Req() request: Request,
    @Res() response: Response,
    @Param("id") id: string,
    @Param("variant") variant: string,
  ) {
    const media = await this.service.read(
      id,
      variant,
      request.cookies?.mdadu_session,
    );
    response.setHeader(
      "Cache-Control",
      media.private ? "private, no-store" : "public, max-age=3600",
    );
    response.setHeader("Content-Type", media.type);
    if (media.type === "application/pdf")
      response.setHeader(
        "Content-Disposition",
        "attachment; filename=document.pdf",
      );
    response.send(media.buffer);
  }
}
