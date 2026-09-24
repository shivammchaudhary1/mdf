import { Body, Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";

import { AuthRequest, SessionGuard, sessionToken } from "../auth/auth.guard";
import { MediaService, type Upload } from "./media.service";

@ApiTags("media")
@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post()
  @ApiCookieAuth()
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "purpose"],
      properties: {
        file: { type: "string", format: "binary" },
        purpose: {
          type: "string",
          enum: [
            "website-image",
            "project",
            "casting",
            "blog",
            "gallery",
            "team",
            "bts",
            "show",
            "member-profile",
            "member-portfolio",
            "member-resume",
          ],
        },
      },
    },
  })
  upload(@Req() request: AuthRequest, @UploadedFile() file: Upload | undefined, @Body("purpose") purpose?: string) {
    return this.service.upload(request.account.id, request.account.role, file, purpose);
  }

  @Delete(":id")
  @ApiCookieAuth()
  @UseGuards(SessionGuard)
  remove(@Req() request: AuthRequest, @Param("id") id: string) {
    return this.service.remove(id, { id: request.account.id, role: request.account.role });
  }

  @Get(":id/:variant")
  async read(@Req() request: Request, @Res() response: Response, @Param("id") id: string, @Param("variant") variant: string) {
    const media = await this.service.read(id, variant, sessionToken(request));
    response.setHeader("Cache-Control", media.private ? "private, no-store" : "public, max-age=3600, stale-while-revalidate=86400");
    response.setHeader("Content-Type", media.type);
    response.setHeader("X-Content-Type-Options", "nosniff");

    if (media.type === "application/pdf") {
      const safeName = (media.originalName || "document.pdf").replace(/[^\w.\- ]+/g, "_").slice(0, 100);
      response.setHeader("Content-Disposition", `attachment; filename="${safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`}"`);
    }

    response.send(media.buffer);
  }
}
